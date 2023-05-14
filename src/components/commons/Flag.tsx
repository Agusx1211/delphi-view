import { Component, Show } from "solid-js";
import { Card, CardContent, Typography, Box, Skeleton, Grid } from "@suid/material"

export type FlagStatus = 'green' | 'yellow' | 'red';

export type FlagProps = {
  grid?: boolean;
  label: string;
  value?: string;
  status?: FlagStatus;

  link?: {
    text: string,
    onClick: (props: FlagProps) => void,
  }
}

export const Flag: Component<FlagProps> = (props) => {
  const statusColor = {
    green: '#4CAF50', // Material green 500
    yellow: '#FFEB3B', // Material yellow 500
    red: '#F44336', // Material red 500
  }

  const content = <Card sx={{ minWidth: 275 }}>
    <CardContent sx={{ textAlign: 'left' }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Show when={props.status}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: statusColor[props.status!], marginRight: 1 }} />
        </Show>
        <Typography variant="h6" component="div">
          {props.label}
        </Typography>
        <Show when={props.link} keyed>
          {(link) => <Typography variant="body2" component="div" sx={{ flexGrow: 1, textAlign: 'right' }}>
            <a href="#" onClick={() => link.onClick(props)}>{link.text}</a>
          </Typography>}
        </Show>
      </Box>
      <Show when={props.value} fallback={<Skeleton variant="text" />}>
        <Typography style={{ }} variant="code">
          {props.value}
        </Typography>
      </Show>
    </CardContent>
  </Card>

  if (props.grid) {
    return <Grid item>
      {content}
    </Grid>
  }

  return content
}
