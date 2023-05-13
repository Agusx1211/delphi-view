import { Component, Show } from "solid-js";
import { Card, CardContent, Typography, Box } from "@suid/material"

type FlagProps = {
  label: string;
  value: string;
  status?: 'green' | 'yellow' | 'red';
}

export const Flag: Component<FlagProps> = (props) => {

  const statusColor = {
    green: '#4CAF50', // Material green 500
    yellow: '#FFEB3B', // Material yellow 500
    red: '#F44336', // Material red 500
  }

  return <Card sx={{ minWidth: 275 }}>
    <CardContent sx={{ textAlign: 'left' }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Show when={props.status}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: statusColor[props.status!], marginRight: 1 }} />
        </Show>
        <Typography variant="h6" component="div">
          {props.label}
        </Typography>
      </Box>
      <Typography variant="body1">
        {props.value}
      </Typography>
    </CardContent>
  </Card>
}