import { commons, v2 } from "@0xsequence/core";
import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  TextField,
  MenuItem,
  IconButton,
  Link,
} from "@suid/material";
import { Component, Show, createSignal, For } from "solid-js";
import { Flag } from "./commons/Flag";
import { backgroundDistinctFrom } from "../utils";
import { nameGenerator } from "../deviceNames";
import { setInput2 } from "../stores/InputStore";
import { ethers } from "ethers";
import { NETWORKS } from "../stores/NetworksStore";
import { TRACKER } from "../stores/TrackerStore";
import { ArrowCircleDown, ArrowCircleRight, ArrowDownward, ArrowDropDown, ArrowForward, ArrowRight, DeleteOutline } from "@suid/icons-material";

export const SignatureRecover: Component<{
  signature:
    | v2.signature.UnrecoveredSignature
    | v2.signature.UnrecoveredChainedSignature;
}> = (props) => {
  const [chain, setChain] = createSignal(1);
  const [transactions, setTransactions] = createSignal<
    commons.transaction.Transaction[]
  >([
    {
      to: "",
      value: "0",
      data: "0x",
      revertOnError: true,
      delegateCall: false,
      gasLimit: "0",
    },
  ]);
  const [digest, setDigest] = createSignal("");
  const [nonce, setNonce] = createSignal("");
  const [subdigest, setSubdigest] = createSignal("");
  const [address, setAddress] = createSignal("");
  const [imageHash, setImageHash] = createSignal("");
  const [error, setError] = createSignal(false);
  const [recovering, setRecovering] = createSignal(false);
  const [open, setOpen] = createSignal(false);

  const handleTransactionChange = <
    K extends keyof commons.transaction.Transaction
  >(
    index: number,
    field: K,
    value: commons.transaction.Transaction[K]
  ) => {
    setTransactions((prevTxs) => {
      const newTxs = [...prevTxs];
      newTxs[index][field] = value;
      return newTxs;
    });
  };

  const handleDeleteTx = (index: number) => {
    setTransactions((prevTxs) => prevTxs.filter((_, i) => i !== index));
  };

  const handleAddTx = () => {
    setTransactions((prevTxs) =>
      prevTxs.concat({
        to: "",
        value: "0",
        data: "0x",
        revertOnError: true,
        delegateCall: false,
        gasLimit: "0",
      })
    );
  };

  const recover = async (e: Event) => {
    e.preventDefault();
    setRecovering(true);
    setError(false);
    try {
      let payload:
        | commons.signature.SignedPayload
        | {
            subdigest: string;
          } = !!subdigest()
        ? { subdigest: subdigest() }
        : {
            chainId: ethers.BigNumber.from(chain()),
            digest:
              digest() ||
              commons.transaction.digestOfTransactions(nonce(), transactions()),
            address: address(),
          };
      console.log(NETWORKS.find((n) => n.chainId === chain())?.rpcUrl);
      const recovered = await v2.signature.recoverSignature(
        props.signature,
        payload,
        new ethers.providers.JsonRpcProvider(
          NETWORKS.find((n) => n.chainId === chain())?.rpcUrl
        )
      );
      const imageHash = v2.config.imageHash(recovered.config);
      const config = await TRACKER.configOfImageHash({ imageHash });
      if (!config) {
        throw new Error("Invalid payload");
      }
      setImageHash(imageHash);
      setRecovering(false);
    } catch (error) {
      setError(true);
      setRecovering(false);
    }
  };

  return (
    <Box
      onSubmit={recover}
      component="form"
      textAlign="left"
      sx={{
        "& .MuiTextField-root": { width: "100%" },
        "& .MuiFormControl-root": { width: "100%" },
        maxWidth: "565px",
      }}
    >
      <IconButton aria-label="delete" onClick={() => setOpen(!open())}>
        {open() ? <ArrowDropDown /> : <ArrowRight />}
      </IconButton>
      <Typography component="span" sx={{ fontSize: 16, fontWeight: "bold" }}>
        Recover Config
      </Typography>
      <Show when={open()}>
        <Grid container spacing={2}>
          <Grid item xs={12} sx={{marginTop: "20px"}}>
            <TextField
              onChange={(e) => setSubdigest(e.target.value)}
              value={subdigest()}
              label="Subdigest"
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <For each={transactions()}>
                {(tx, index) => (
                  <>
                    <Grid item xs={12}>
                      <Grid
                        container
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Grid item>
                          <Typography sx={{ fontSize: 12, fontWeight: "bold" }}>
                            Transaction {index()}
                          </Typography>
                        </Grid>
                        <Grid item>
                          <IconButton
                            aria-label="delete"
                            onClick={() => handleDeleteTx(index())}
                          >
                            <DeleteOutline />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        onChange={(e) =>
                          handleTransactionChange(index(), "to", e.target.value)
                        }
                        value={transactions()[index()].to}
                        label="To"
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        onChange={(e) =>
                          handleTransactionChange(
                            index(),
                            "value",
                            e.target.value
                          )
                        }
                        value={transactions()[index()].value}
                        label="Value (wei)"
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        onChange={(e) =>
                          handleTransactionChange(
                            index(),
                            "gasLimit",
                            e.target.value
                          )
                        }
                        value={transactions()[index()].gasLimit}
                        label="GasLimit"
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        onChange={(e) =>
                          handleTransactionChange(
                            index(),
                            "data",
                            e.target.value
                          )
                        }
                        value={transactions()[index()].data}
                        label="Data"
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl variant="outlined" fullWidth>
                        <InputLabel>DelegateCall</InputLabel>
                        <Select
                          label="Dropdown"
                          onChange={(e) =>
                            handleTransactionChange(
                              index(),
                              "delegateCall",
                              e.target.value === "true" ? true : false
                            )
                          }
                          value={
                            transactions()[index()].delegateCall
                              ? "true"
                              : "false"
                          }
                        >
                          <MenuItem value="true">True</MenuItem>
                          <MenuItem value="false">False</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl variant="outlined" fullWidth>
                        <InputLabel>RevertOnError</InputLabel>
                        <Select
                          label="Dropdown"
                          onChange={(e) =>
                            handleTransactionChange(
                              index(),
                              "revertOnError",
                              e.target.value === "true" ? true : false
                            )
                          }
                          value={
                            transactions()[index()].revertOnError
                              ? "true"
                              : "false"
                          }
                        >
                          <MenuItem value="true">True</MenuItem>
                          <MenuItem value="false">False</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </>
                )}
              </For>
            </Grid>
          </Grid>
          <Grid item xs={6} textAlign="right">
            <TextField
              onChange={(e) => setNonce(e.target.value)}
              value={nonce()}
              label="Nonce"
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={6} textAlign="right">
            <Button onClick={handleAddTx}>Add Transaction</Button>
          </Grid>
          <Grid item xs={12} sx={{ marginTop: "20px" }}>
            <TextField
              onChange={(e) => setDigest(e.target.value)}
              value={digest()}
              disabled={!!subdigest()}
              label="Digest"
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={4}>
            <FormControl variant="outlined" fullWidth>
              <InputLabel>Chain</InputLabel>
              <Select
                disabled={!!subdigest()}
                label="Dropdown"
                onChange={(e) => setChain(e.target.value)}
                value={chain()}
              >
                <For each={NETWORKS}>
                  {(n) => <MenuItem value={n.chainId}>{n.name}</MenuItem>}
                </For>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={8}>
            <TextField
              onChange={(e) => setAddress(e.target.value)}
              value={address()}
              disabled={!!subdigest()}
              label="Wallet address"
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={6} textAlign="left">
            <Button disabled={recovering()} type="submit">
              Recover
            </Button>
          </Grid>
          <Grid item xs={6} textAlign="right">
            <Show when={error() || !!imageHash()}>
              <Typography component="span" color={error() ? "error" : "green"}>
                {error() ? "Invalid payload!" : "Signature recovered! "}
              </Typography>
              <Show when={!error() && !!imageHash()}>
                <Link
                  sx={{ fontSize: 12 }}
                  href={`${location.pathname}?input=${imageHash()}`}
                >
                  Config Details
                </Link>
              </Show>
            </Show>
          </Grid>
        </Grid>
      </Show>
    </Box>
  );
};

export const V2SignatureView: Component<{
  signature:
    | v2.signature.UnrecoveredSignature
    | v2.signature.UnrecoveredChainedSignature;
}> = (props) => {
  const sigType = () => {
    switch (props.signature.type) {
      case v2.signature.SignatureType.Chained:
        return "Chained";
      case v2.signature.SignatureType.Legacy:
        return "Legacy";
      case v2.signature.SignatureType.NoChainIdDynamic:
        return "No ChainId";
      case v2.signature.SignatureType.Dynamic:
        return "Dynamic";
      default:
        return "Unknown";
    }
  };

  return (
    <>
      <Grid container spacing={2} sx={{ marginBottom: "40px" }}>
        <Flag grid label="Version" value={props.signature.version.toString()} />
        <Flag grid label="Type" value={sigType()} />
        <Grid item width="100%" sx={{ marginTop: "20px" }}>
          <SignatureRecover signature={props.signature} />
        </Grid>
        <Grid item width="100%">
          <Typography pb="1rem" pt="1rem" textAlign="left">
            Decoded / Recovered
          </Typography>
          <Paper>
            <Box alignContent="left" textAlign="left">
              <V2UnrecoveredSignatureView node={props.signature.decoded.tree} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {v2.signature.isUnrecoveredChainedSignature(props.signature) &&
        props.signature.suffix.length > 0 && (
          <>
            {props.signature.suffix.map((suffixSig) => (
              <V2SignatureView signature={suffixSig} />
            ))}
          </>
        )}
    </>
  );
};

export const V2UnrecoveredSignatureView: Component<{
  node: v2.signature.UnrecoveredTopology;
  background?: number;
}> = (props) => {
  const [open, setOpen] = createSignal(true);
  const back = () => props.background ?? 255;

  const handleClick = (event: MouseEvent) => {
    event.preventDefault();
    setOpen(!open());
  };

  const backgroundChild1 = () => backgroundDistinctFrom(back(), 1);
  const backgroundChild2 = () =>
    backgroundDistinctFrom(back(), 2, backgroundChild1());

  const label = () => {
    if (v2.signature.isUnrecoveredNode(props.node)) {
      try {
        v2.config.hashNode(props.node as any);
        return { label: "Node", color: "gray" };
      } catch {}
      return { label: "Unrecovered node", color: "gray" };
    }

    if (v2.signature.isUnrecoveredSignatureLeaf(props.node)) {
      return { label: "Unrecovered signature", color: "blue" };
    }

    if (v2.config.isSignerLeaf(props.node)) {
      return { label: "Signer witness", color: "green" };
    }

    if (v2.config.isNodeLeaf(props.node)) {
      return { label: "Node witness", color: "orange" };
    }

    if (v2.config.isSubdigestLeaf(props.node)) {
      return { label: "Subdigest leaf", color: "purple" };
    }

    if (v2.config.isNestedLeaf(props.node)) {
      return { label: "Nested leaf", color: "pink" };
    }

    return { label: "Unknown", color: "red" };
  };

  const nodeHash = () => {
    if (v2.config.isLeaf(props.node)) {
      return v2.config.hashNode(props.node);
    }

    try {
      return v2.config.hashNode(props.node as any);
    } catch {}

    return "Node hash not available";
  };

  return (
    <Box
      sx={{ borderRadius: "0.25rem" }}
      backgroundColor={`rgb(${back()}, ${back()}, ${back()})`}
      p="0.5rem"
    >
      <Typography
        sx={{ fontSize: 12, fontWeight: "bold" }}
        color={label().color}
      >
        {label().label}
      </Typography>
      <Box ml="0.15rem" mb="0.25rem" mr="0.15rem" mt="0.05rem">
        <a href="#" onClick={handleClick}>
          {open() ? "-" : "+"}
        </a>
        <Typography marginLeft="0.5rem" variant="code">
          {nodeHash()}
        </Typography>
      </Box>
      <Show when={open()}>
        <Show
          when={v2.config.isNestedLeaf(props.node) ? props.node : undefined}
          keyed
        >
          {(node) => (
            <Box pl="1rem">
              <Typography sx={{ fontSize: 14 }} color="text.secondary">
                Thershold
              </Typography>
              <Typography variant="code">
                {node.threshold.toString()}
              </Typography>
              <Typography sx={{ fontSize: 14 }} color="text.secondary">
                Weight
              </Typography>
              <Typography variant="code">{node.weight.toString()}</Typography>
              <V2UnrecoveredSignatureView
                node={node.tree}
                background={backgroundChild1()}
              />
            </Box>
          )}
        </Show>
        <Show
          when={v2.config.isNode(props.node) ? props.node : undefined}
          keyed
        >
          {(node) => (
            <Box pl="1rem">
              <V2UnrecoveredSignatureView
                node={node.left}
                background={backgroundChild1()}
              />
              <Box pt="0.5rem">
                <V2UnrecoveredSignatureView
                  node={node.right}
                  background={backgroundChild2()}
                />
              </Box>
            </Box>
          )}
        </Show>
        <Show
          when={v2.config.isSignerLeaf(props.node) ? props.node : undefined}
          keyed
        >
          {(sleaf) => (
            <Box marginLeft="1.5rem">
              <Typography sx={{ fontSize: 14 }} color="text.secondary">
                Name
              </Typography>
              <Typography variant="code">
                {nameGenerator(sleaf.address, 2)}
              </Typography>
              <Typography sx={{ fontSize: 14 }} color="text.secondary">
                Weight
              </Typography>
              <Typography variant="code">{sleaf.weight.toString()}</Typography>
              <Typography sx={{ fontSize: 14 }} color="text.secondary">
                Address
              </Typography>
              <Typography variant="code">{sleaf.address}</Typography>
              <Show when={sleaf.signature} keyed>
                {(sig) => <V2SubSignatureView signature={sig} />}
              </Show>
            </Box>
          )}
        </Show>
        <Show
          when={
            v2.signature.isUnrecoveredSignatureLeaf(props.node) &&
            !v2.config.isSignerLeaf(props.node)
              ? props.node
              : undefined
          }
          keyed
        >
          {(sleaf) => (
            <Box marginLeft="1.5rem">
              <V2SubSignatureView signature={sleaf.signature} />
            </Box>
          )}
        </Show>
      </Show>
    </Box>
  );
};

export const V2SubSignatureView: Component<{ signature: string }> = (props) => {
  // Last byte is the signature type
  const sigType = () => {
    const arr = ethers.utils.arrayify(props.signature);
    const type = arr[arr.length - 1];

    switch (type) {
      /*
        uint256 private constant SIG_TYPE_EIP712 = 1;
        uint256 private constant SIG_TYPE_ETH_SIGN = 2;
        uint256 private constant SIG_TYPE_WALLET_BYTES32 = 3;
      */
      case 1:
        return "EIP712";
      case 2:
        return "ETH_SIGN";
      case 3:
        return "EIP1271";
    }

    return "Unknown";
  };

  const showLink = () => {
    return sigType() === "EIP1271";
  };

  const signature = () => {
    const arr = ethers.utils.arrayify(props.signature);
    return ethers.utils.hexlify(arr.slice(0, arr.length - 1));
  };

  return (
    <>
      <Typography sx={{ fontSize: 14 }} color="text.secondary">
        Type
      </Typography>
      <Typography variant="code">{sigType()}</Typography>
      <Typography sx={{ fontSize: 14 }} color="text.secondary">
        Signature
      </Typography>
      <Typography variant="code">{signature()}</Typography>
      <Show when={showLink()}>
        <Typography variant="code" ml="0.5rem">
          <a href="#" onClick={() => setInput2(signature())}>
            {"[->]"}
          </a>
        </Typography>
      </Show>
    </>
  );
};
