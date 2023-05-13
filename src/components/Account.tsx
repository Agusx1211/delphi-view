import { Component, Show } from "solid-js";
import { Box, Grid, LinearProgress, Paper } from "@suid/material"
import { NetworkAndStatus, addressLoading, status } from "../stores/InputAddressStore";
import { NetworksView } from "./Network";
import { Flag } from "./commons/Flag";
import { input } from "../stores/InputStore";
import { HIGHEST_VERSION } from "../stores/ContextStore";

export const GlobalAccountView: Component<{ address: string, status: NetworkAndStatus[] }> = (props) => {
  const initialVersion = () => props.status.length === 0 ? undefined : props.status[0].original.version
  const fullyMigrated = () => {
    if (props.status.length === 0) {
      return ''
    }

    if (props.status.every((s) => s.original.version === HIGHEST_VERSION)) {
      return 'Yes'
    }

    if (props.status.some((s) => s.original.version === HIGHEST_VERSION)) {
      return 'Partial'
    }

    return 'No'
  }

  const commonLatestImageHash = () => {
    if (props.status.length === 0) {
      return ''
    }

    // Compute how many different image hashes we have
    const imageHashes = new Set(props.status.map((s) => s.imageHash))
    if (imageHashes.size === 1) {
      return imageHashes.values().next().value as string
    }

    return `Multiple (${imageHashes.size})`
  }

  return <Box sx={{ flexGrow: 1 }}>
     <Grid container spacing={2}>
      <Grid item>
        <Flag label="Address" value={props.address} />
      </Grid>
      <Show when={props.status.length > 0}>
        <Grid item>
          <Flag label="Initial image hash" value={props.status[0].original.imageHash} />
        </Grid>
        <Grid item>
          <Flag label="Initial version" value={initialVersion()!.toString()} status={initialVersion() === 1 ? 'yellow' : 'green'} />
        </Grid>
        <Grid item>
          <Flag label="Fully migrated" value={fullyMigrated()} status={fullyMigrated() === 'Yes' ? 'green' : fullyMigrated() === 'No' ? 'red' : 'yellow'} />
        </Grid>
        <Grid item>
          <Flag label="Last image hash" value={commonLatestImageHash()} status={commonLatestImageHash().includes('Multiple') ? 'red' : 'green'} />
        </Grid>
      </Show>
    </Grid>
  </Box>
}

export const AccountView: Component = () => {  
  return (
    <>
      {addressLoading() && <LinearProgress />}
      <Show when={status()}>
        <h2>Account</h2>
        <GlobalAccountView address={input()!} status={status()!} />
        <br/>
        <NetworksView {...status()!} />
      </Show>
    </>
  );
};
