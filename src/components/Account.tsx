import { Component, Show, createEffect, createSignal } from "solid-js";
import { Box, Grid, LinearProgress, Paper } from "@suid/material"
import { NetworksView } from "./Network";
import { Flag, FlagStatus } from "./commons/Flag";
import { HIGHEST_VERSION } from "../stores/ContextStore";
import { AccountStatusStore, createStatusStore } from "../stores/AccountStatusStore";
import { ImageHashFlag } from "./commons/ImageHashFlag";

export const GlobalAccountView: Component<{ store: AccountStatusStore }> = (props) => {
  const [someFailed, setSomeFailed] = createSignal(false)

  createEffect(() => {
    setSomeFailed(props.store.networks.some((n) => props.store.error(n.chainId)))
  })

  const initialImageHash = () => {
    const loaded = props.store.networks.find((n) => !props.store.loading(n.chainId) && props.store.status(n.chainId))
    if (!loaded) {
      return {}
    }

    return { value: props.store.status(loaded.chainId)!.original.imageHash }
  }

  const initialVersion = () => {
    const loaded = props.store.networks.find((n) => !props.store.loading(n.chainId) && props.store.status(n.chainId))
    if (!loaded) {
      return {}
    }

    const version = props.store.status(loaded.chainId)!.original.version
    return { value: version.toString(), status: version === HIGHEST_VERSION ? 'green' : 'yellow' as FlagStatus }
  }

  const fullyMigrated = () => {
    const loading = props.store.networks.some((n) => props.store.loading(n.chainId))
    if (loading) {
      return {}
    }

    if (someFailed()) {
      return { value: 'Unknown', status: 'red' as FlagStatus }
    }

    if (props.store.networks.every((s) => props.store.status(s.chainId)?.version === HIGHEST_VERSION)) {
      return { value: 'Yes', status: 'green' as FlagStatus }
    }

    if (props.store.networks.some((s) => props.store.status(s.chainId)?.version === HIGHEST_VERSION)) {
      return { value: 'Partially', status: 'yellow' as FlagStatus }
    }

    return { value: 'No', status: 'red' as FlagStatus }
  }

  const commonLatestImageHash = () => {
    const loading = props.store.networks.some((n) => props.store.loading(n.chainId))
    if (loading) {
      return {}
    }

    if (someFailed()) {
      return { value: 'Unknown', status: 'red' as FlagStatus }
    }

    // Compute how many different image hashes we have
    const imageHashes = new Set(props.store.networks.map((s) => props.store.status(s.chainId)?.imageHash))
    if (imageHashes.size === 1) {
      return { value: imageHashes.values().next().value as string, status: 'green' as FlagStatus }
    }

    return { value: `Multiple (${imageHashes.size})`, status: 'red' as FlagStatus }
  }

  return <Box sx={{ flexGrow: 1 }}>
     <Grid container spacing={2}>
      <Flag grid label="Address" value={props.store.address} />
      <ImageHashFlag grid label="Initial image hash" {...initialImageHash()} />
      <Flag grid label="Initial version" {...initialVersion()} />
      <Flag grid label="Fully migrated" {...fullyMigrated()} />
      <ImageHashFlag grid label="Last image hash" {...commonLatestImageHash()} />
    </Grid>
  </Box>
}

export const AccountView: Component<{ address: string }> = (props) => {
  const store = createStatusStore(props.address)

  const loading = () => store.networks.every((n) => store.loading(n.chainId))

  return (
    <>
      <Show when={!loading()} fallback={<LinearProgress />}>
        <h2>Sequence account</h2>
        <GlobalAccountView store={store} />
        <br/>
        <NetworksView store={store}/>
      </Show>
    </>
  );
};
