import { commons } from "@0xsequence/core";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
} from "@suid/material";
import { Component, Show, createSignal } from "solid-js";
import { Flag } from "./commons/Flag";
import { ethers } from "ethers";

const TransactionView: Component<{
  tx: commons.transaction.TransactionEncoded;
}> = (props) => {
  return (
    <>
      <Card sx={{ width: 800 }}>
        <CardContent>
          <List>
            <ListItem sx={{ padding: '4px 0' }}>
              <ListItemText
                primary={`delegateCall: ${String(props.tx.delegateCall)}`}
              />
            </ListItem>
            <ListItem sx={{ padding: '4px 0' }}>
              <ListItemText
                primary={`revertOnError: ${String(props.tx.revertOnError)}`}
              />
            </ListItem>
            <ListItem sx={{ padding: '4px 0' }}>
              <ListItemText
                primary={`gasLimit: ${ethers.utils.formatUnits(props.tx.gasLimit, "wei")}`}
              />
            </ListItem>
            <ListItem sx={{ padding: '4px 0' }}>
              <ListItemText primary={`target: ${props.tx.target}`} />
            </ListItem>
            <ListItem sx={{ padding: '4px 0' }}>
              <ListItemText
                primary={`value: ${ethers.utils.formatUnits(props.tx.value, "wei")}`}
              />
            </ListItem>
            <ListItem sx={{ padding: '4px 0' }}>
              <ListItemText
                primary={`data: ${ethers.utils.hexValue(props.tx.data)}`}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </>
  );
};

export const CallDataView: Component<{
  tx: ethers.utils.TransactionDescription;
}> = (props) => {
  return (
    <>
      <h2>Transaction Calldata</h2>
      {props.tx.args[0] && props.tx.args[0].length > 0 && (
        <Grid container direction={"column"} gap={2}>
          {props.tx.args[0].map(
            (tx: commons.transaction.TransactionEncoded) => (
                <TransactionView tx={tx} />  
            )
          )}
        </Grid>
      )}
    </>
  );
};
