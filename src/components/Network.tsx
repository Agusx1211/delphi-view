import { Component, For, Show, createEffect, createSignal, useContext } from "solid-js";
import { Box, Button, Card, CardActions, CardContent, Divider, Grid, LinearProgress, List, ListItem, Skeleton, Typography } from "@suid/material"
import { AccountStatusStore } from "../stores/AccountStatusStore";
import { NetworkConfig } from '@0xsequence/network'
import { Flag } from "./commons/Flag";
import { HIGHEST_VERSION } from "../stores/ContextStore";
import { decodeInputAddress, encodeInputAddress, toUpperFirst } from "../utils";

import ArrowDownward from "@suid/icons-material/ArrowDownward";
import Circle from "@suid/icons-material/Circle";
import { ImageHashFlag } from "./commons/ImageHashFlag";
import { SideContext, inputFor, setInput2, setInputFor } from "../stores/InputStore";
import { tracker } from "@0xsequence/sessions";
import RotateLeftIcon from '@suid/icons-material/RotateLeft';
import { v2 } from "@0xsequence/core";

export const NetworksView: Component<{ store: AccountStatusStore }> = (prop) => {
  const sideContext = useContext(SideContext)

  const selected = () => {
    const decoded = decodeInputAddress(inputFor(sideContext)())
    return prop.store.networks.find((n) => n.chainId.toString() === decoded?.selected)
  }

  const setSelected = (n?: NetworkConfig) => {
    // Strip the chainId from the input, and add the new one
    const decoded = decodeInputAddress(inputFor(sideContext)())
    const encoded = encodeInputAddress(decoded?.address, n?.chainId?.toString())
    setInputFor(sideContext)(encoded)
  }

  return <Box sx={{ flexGrow: 1 }}>
     <Grid container spacing={2}>
      <For each={prop.store.networks}>{(n) =>
        <Grid item xs={6} md={3}>
          <NetworkCardView
            selected={selected()?.chainId === n.chainId}
            onExpand={() => setSelected(n)}
            onClose={() => setSelected(undefined)}
            network={n} store={prop.store}
            />
        </Grid>
      }</For>
    </Grid>
    <Show when={selected()} fallback={<></>} keyed>
      {(n) => <NetworkView network={n} store={prop.store} />}
    </Show>
  </Box>
}

export const NetworkCardView: Component<{ network: NetworkConfig, store: AccountStatusStore, selected: boolean, onExpand: () => void, onClose: () => void }> = (props) => {
  return <Card>
    <CardContent sx={{ textAlign: 'left' }}>
      <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
        Network
      </Typography>
      <Typography variant="h5" component="div">
        {toUpperFirst(props.network.name)}
      </Typography>
      <Show when={props.store.status(props.network.chainId)} fallback={<>
        <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
        <Skeleton variant="rectangular" height={120} />
      </>} keyed>
        {(status) => <>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            Image Hash
          </Typography>
          <Typography variant="body2" noWrap>
            {status.onChain.imageHash}
          </Typography>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            Version
          </Typography>
          <Typography variant="body2">
            {status.onChain.version}
          </Typography>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            Deployed
          </Typography>
          <Typography variant="body2">
            {status.onChain.deployed ? 'Yes' : 'No'}
          </Typography>
        </>}
      </Show>
    </CardContent>
    <CardActions>
      <Show when={props.selected}>
        <Button size="small" onClick={() => props.onClose()}>Close</Button>
      </Show>
      <Show when={!props.selected}>
        <Button size="small" onClick={() => props.onExpand()}>Select</Button>
      </Show>
    </CardActions>
  </Card>
}

export const NetworkView: Component<{ store: AccountStatusStore, network: NetworkConfig }> = (props) => {
  const [configs, setConfigs] = createSignal<Map<string, v2.config.WalletConfig>>()

  const willSkip = (presigned: tracker.PresignedConfigLink) => {
    const shortPath = props.store.statusShort(props.network.chainId)
    if (!shortPath) return false
    return shortPath?.presignedConfigurations.find((l) => l.nextImageHash === presigned.nextImageHash) === undefined
  }

  const skipSignature = (presigned: tracker.PresignedConfigLink) => {
    const shortPath = props.store.statusShort(props.network.chainId)
    if (!shortPath) return
    const sig = shortPath?.presignedConfigurations.find((l) => l.nextImageHash === presigned.nextImageHash)?.signature
    if (sig === presigned.signature) return
    return sig
  }

  createEffect(() => {
    
  })

  return <Box sx={{ flexGrow: 1 }}>
    <Show when={props.store.loading(props.network.chainId)}>
      <LinearProgress />
    </Show>
    <Show when={props.store.error(props.network.chainId)} keyed>
      {(error) => <Typography variant="h5" component="div">
        {error.message}
      </Typography>}
    </Show>
    <Show when={props.store.status(props.network.chainId)} keyed>
      {(status) => <>
        <h3>{toUpperFirst(props.network.name)} details</h3>
        <Grid container spacing={2}>
          <ImageHashFlag grid label="Image Hash (final)" value={status.imageHash} />
          <ImageHashFlag grid label="Image Hash (onchain)" value={status.onChain.imageHash} />
          <Flag grid label="Version" value={status.version.toString()} status={status.version === HIGHEST_VERSION ? 'green' : 'yellow'} />
          <Flag grid label="Version (onchain)" value={status.onChain.version.toString()} status={status.onChain.version === HIGHEST_VERSION ? 'green' : 'yellow'} />
          <Flag grid label="Fully migrated" value={status.fullyMigrated ? 'Yes' : 'No'} status={status.fullyMigrated ? 'green' : 'red'} />
          <Flag grid label="Deployed" value={status.onChain.deployed ? 'Yes' : 'No'} status={status.onChain.deployed ? 'green' : 'red'} />
          <Flag grid label="Can onchain validate (v2)" value={status.canOnchainValidate ? 'Yes' : 'No'} status={status.canOnchainValidate ? 'green' : 'red'} />
          <Flag grid label="Checkpoint (lazy)" value={status.checkpoint.toString()} />
        </Grid>

        {/* Display chain of presigned configurations */}
        <h3>{toUpperFirst(props.network.name)} presigned configurations</h3>
        <List>
          <ListItem disableGutters>
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
              <Circle fontSize="large" style={{ color: 'blue '}} />
              <Box sx={{ marginLeft: 2 }}>
                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                  {status.presignedConfigurations.length === 0 ? 'Initial Image hash' : 'Image hash'}
                </Typography>
                <Typography variant="code" noWrap>
                  {status.onChain.imageHash}
                </Typography>
                <Typography variant="code" ml='0.5rem'>
                  <a href="#" onClick={() => setInput2(status.onChain.imageHash)}>{"[->]"}</a>
                </Typography>
              </Box>
            </Box>
          </ListItem>
          <Divider/>
          <For each={status.presignedConfigurations}>{(c, i) =>
            <>
              <ListItem disableGutters>
                <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                  <Show when={i() !== status.presignedConfigurations.length - 1} fallback={<>
                    <Circle fontSize="large" style={{ color: 'green '}} />
                  </>}>
                    <Show when={!willSkip(c)} fallback={
                      <RotateLeftIcon style={{ rotate: '220deg', color: 'gray' }} fontSize="large" />
                    }>
                      <ArrowDownward fontSize="large" style={{ color: 'orange'}} />
                    </Show>
                  </Show>
                  <Box sx={{ marginLeft: 2 }}>
                    <Typography sx={{ fontSize: 14 }} color="text.secondary">
                      {
                        i() !== status.presignedConfigurations.length - 1 ? 
                        (willSkip(c) ? 'Skippable next image hash' : 'Next image hash') : 'Final image hash'
                      }
                    </Typography>
                    <Typography variant="code" noWrap>
                      {c.nextImageHash}
                    </Typography>
                    <Typography variant="code" ml='0.5rem'>
                      <a href="#" onClick={() => setInput2(c.nextImageHash)}>{"[->]"}</a>
                    </Typography>
                    <Typography sx={{ fontSize: 14 }} color="text.secondary">
                      Signature
                    </Typography>
                    <Typography variant="code" style={{ "overflow-wrap": 'break-word'}} flexWrap="wrap">
                      {c.signature}
                    </Typography>
                    <Typography variant="code" ml='0.5rem'>
                      <a href="#" onClick={() => setInput2(c.signature)}>{"[->]"}</a>
                    </Typography>
                    <Show when={skipSignature(c)} keyed>
                      {(ssig) => <>
                      <Typography sx={{ fontSize: 14 }} color="text.secondary">
                        Skip signature
                      </Typography>
                      <Typography variant="code" style={{ "overflow-wrap": 'break-word'}} flexWrap="wrap">
                        {ssig}
                      </Typography>
                      <Typography variant="code" ml='0.5rem'>
                        <a href="#" onClick={() => setInput2(ssig)}>{"[->]"}</a>
                      </Typography>
                      </>}
                    </Show>
                  </Box>
                </Box>
              </ListItem>
              <Divider/>
            </>
          }</For>
        </List>
      </>}
    </Show>
  </Box>
}
