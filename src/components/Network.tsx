import { Component, For } from "solid-js";
import { NetworkAndStatus } from "../stores/InputAddressStore";
import { Box, Card, CardContent, Grid, Typography } from "@suid/material"

export const NetworksView: Component<NetworkAndStatus[]> = (prop) => {
  return <Box sx={{ flexGrow: 1 }}>
     <Grid container spacing={2}>
      <For each={prop}>{(entry) =>
        <Grid item xs={6} md={2}>
          <OnChainViewEntry {...entry} />
        </Grid>
      }</For>
    </Grid>
  </Box>
}

export const OnChainViewEntry: Component<NetworkAndStatus> = (props) => {
  return <Card>
    <CardContent sx={{ textAlign: 'left' }}>
      <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
        Network
      </Typography>
      <Typography variant="h5" component="div">
        {props.network.name}
      </Typography>
      <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
        Image Hash
      </Typography>
      <Typography variant="body2" noWrap>
        {props.onChain.imageHash}
      </Typography>
      <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
        Version
      </Typography>
      <Typography variant="body2">
        {props.onChain.version}
      </Typography>
      <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
        Deployed
      </Typography>
      <Typography variant="body2">
        {props.onChain.deployed ? 'Yes' : 'No'}
      </Typography>
    </CardContent>
  </Card>
}
