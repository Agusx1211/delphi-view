import { v2 } from "@0xsequence/core";
import { Box, Grid, Paper, Typography } from "@suid/material";
import { Component, Show, createSignal } from "solid-js";
import { Flag } from "./commons/Flag";
import { backgroundDistinctFrom } from "../utils";
import { nameGenerator } from "../deviceNames";
import { setInput2 } from "../stores/InputStore";
import { ethers } from "ethers";

export const V2SignatureView: Component<{ signature: v2.signature.UnrecoveredSignature | v2.signature.UnrecoveredChainedSignature }> = (props) => {
  const sigType = () => {
    switch (props.signature.type) {
      case v2.signature.SignatureType.Chained: return 'Chained';
      case v2.signature.SignatureType.Legacy: return 'Legacy';
      case v2.signature.SignatureType.NoChainIdDynamic: return 'No ChainId';
      case v2.signature.SignatureType.Dynamic: return 'Dynamic';
      default: return 'Unknown';
    }
  }

  const isChainedSignature = (signature: v2.signature.UnrecoveredSignature | v2.signature.UnrecoveredChainedSignature): signature is v2.signature.UnrecoveredChainedSignature => {
    return 'suffix' in signature;
  }

  return <>
    <h2>Signature</h2>
    <Grid container spacing={2}>
      <Flag grid label="Version" value={props.signature.version.toString()} />
      <Flag grid label="Type" value={sigType()} />
      <Grid item width="100%">
        <Typography pb='1rem' pt='1rem' textAlign="left">Decoded / Recovered</Typography>
        <Paper>
          <Box alignContent="left" textAlign="left">
            <V2UnrecoveredSignatureView node={props.signature.decoded.tree} />
          </Box>
        </Paper>
      </Grid>
    </Grid>

    {isChainedSignature(props.signature) && props.signature.suffix.length > 0 && (
        <>
          {props.signature.suffix.map((suffixSig) => (
              <V2SignatureView signature={suffixSig} />
          ))}
        </>
      )}
  </>
}

export const V2UnrecoveredSignatureView: Component<{ node: v2.signature.UnrecoveredTopology, background?: number }> = (props) => {
  const [open, setOpen] = createSignal(true)
  const back = () => props.background ?? 255

  const handleClick = (event: MouseEvent) => {
    event.preventDefault();
    setOpen(!open());
  }

  const backgroundChild1 = () => backgroundDistinctFrom(back(), 1)
  const backgroundChild2 = () => backgroundDistinctFrom(back(), 2, backgroundChild1())

  const label = () => {
    if (v2.signature.isUnrecoveredNode(props.node)) {
      try {
        v2.config.hashNode(props.node as any)
        return { label: 'Node', color: 'gray' }
      } catch { }
      return { label: 'Unrecovered node', color: 'gray' }
    }

    if (v2.signature.isUnrecoveredSignatureLeaf(props.node)) {
      return { label: 'Unrecovered signature', color: 'blue' }
    }

    if (v2.config.isSignerLeaf(props.node)) {
      return { label: 'Signer witness', color: 'green' }
    }

    if (v2.config.isNodeLeaf(props.node)) {
      return { label: 'Node witness', color: 'orange' }
    }

    if (v2.config.isSubdigestLeaf(props.node)) {
      return { label: 'Subdigest leaf', color: 'purple' }
    }

    if (v2.config.isNestedLeaf(props.node)) {
      return { label: 'Nested leaf', color: 'pink' }
    }

    return { label: 'Unknown', color: 'red' }
  }

  const nodeHash = () => {
    if (v2.config.isLeaf(props.node)) {
      return v2.config.hashNode(props.node)
    }

    try {
      return v2.config.hashNode(props.node as any)
    } catch {}

    return 'Node hash not available'
  }

  return <Box sx={{ borderRadius: '0.25rem' }} backgroundColor={`rgb(${back()}, ${back()}, ${back()})`} p="0.5rem">
    <Typography sx={{ fontSize: 12, fontWeight: 'bold' }} color={label().color}>{label().label}</Typography>
    <Box ml='0.15rem' mb='0.25rem' mr='0.15rem' mt='0.05rem'>
      <a href="#" onClick={handleClick}>{open() ? '-' : '+'}</a>
      <Typography marginLeft='0.5rem' variant="code">{nodeHash()}</Typography>
    </Box>
    <Show when={open()}>
        <Show when={v2.config.isNestedLeaf(props.node) ? props.node : undefined} keyed>
          {(node) => <Box pl="1rem">
            <Typography sx={{ fontSize: 14 }} color="text.secondary">Thershold</Typography>
            <Typography variant="code">{node.threshold.toString()}</Typography>
            <Typography sx={{ fontSize: 14 }} color="text.secondary">Weight</Typography>
            <Typography variant="code">{node.weight.toString()}</Typography>
            <V2UnrecoveredSignatureView node={node.tree} background={backgroundChild1()} />
          </Box>}
        </Show>
        <Show when={v2.config.isNode(props.node) ? props.node : undefined} keyed>
          {(node) => <Box pl="1rem">
            <V2UnrecoveredSignatureView node={node.left} background={backgroundChild1()} />
            <Box pt="0.5rem">
              <V2UnrecoveredSignatureView node={node.right} background={backgroundChild2()} />
            </Box>
          </Box>}
        </Show>
        <Show when={v2.config.isSignerLeaf(props.node) ? props.node : undefined} keyed>
          {(sleaf) => <Box marginLeft="1.5rem">
            <Typography sx={{ fontSize: 14 }} color="text.secondary">Name</Typography>
            <Typography variant="code">{nameGenerator(sleaf.address, 2)}</Typography>
            <Typography sx={{ fontSize: 14 }} color="text.secondary">Weight</Typography>
            <Typography variant="code">{sleaf.weight.toString()}</Typography>
            <Typography sx={{ fontSize: 14 }} color="text.secondary">Address</Typography>
            <Typography variant="code">{sleaf.address}</Typography>
            <Show when={sleaf.signature} keyed>
              {(sig) => <V2SubSignatureView signature={sig} />}
            </Show>
          </Box>}
        </Show>
        <Show when={v2.signature.isUnrecoveredSignatureLeaf(props.node) && !v2.config.isSignerLeaf(props.node) ? props.node : undefined} keyed>
          {(sleaf) => <Box marginLeft="1.5rem">
            <V2SubSignatureView signature={sleaf.signature} />
          </Box>}
        </Show>
    </Show>
  </Box>
}

export const V2SubSignatureView: Component<{ signature: string }> = (props) => {
  // Last byte is the signature type
  const sigType = () => {
    const arr = ethers.utils.arrayify(props.signature)
    const type = arr[arr.length - 1]

    switch (type) {
      /*
        uint256 private constant SIG_TYPE_EIP712 = 1;
        uint256 private constant SIG_TYPE_ETH_SIGN = 2;
        uint256 private constant SIG_TYPE_WALLET_BYTES32 = 3;
      */
      case 1: return 'EIP712'
      case 2: return 'ETH_SIGN'
      case 3: return 'EIP1271'
    }

    return 'Unknown'
  }

  const showLink = () => {
    return sigType() === 'EIP1271'
  }

  const signature = () => {
    const arr = ethers.utils.arrayify(props.signature)
    return ethers.utils.hexlify(arr.slice(0, arr.length - 1))
  }

  return <>
    <Typography sx={{ fontSize: 14 }} color="text.secondary">Type</Typography>
    <Typography variant="code">{sigType()}</Typography>
    <Typography sx={{ fontSize: 14 }} color="text.secondary">Signature</Typography>
    <Typography variant="code">{signature()}</Typography>
    <Show when={showLink()}>
      <Typography variant="code" ml='0.5rem'>
        <a href="#" onClick={() => setInput2(signature())}>{"[->]"}</a>
      </Typography>
    </Show>
  </>
}
