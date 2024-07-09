import { commons } from "@0xsequence/core";
import { walletContracts } from "@0xsequence/abi";
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
  Link,
} from "@suid/material";
import { Component } from "solid-js";
import { ethers } from "ethers";

const TransactionView: Component<{
  tx: commons.transaction.TransactionEncoded;
}> = (props) => {
  const decodeData = (calldata: string) => {
    try {
      const mainModuleUpgradableInterface = new ethers.utils.Interface(
        walletContracts.mainModuleUpgradable.abi
      );
      return mainModuleUpgradableInterface.parseTransaction({ data: calldata });
    } catch {}

    return undefined;
  };

  const parsedTx = decodeData(ethers.utils.hexValue(props.tx.data));

  return (
    <Box sx={{ marginBottom: "15px", textAlign: "left" }}>
      <Card
        sx={{ borderRadius: "5px", backgroundColor: "#f5f5f5", padding: "5px" }}
      >
        <CardContent sx={{ padding: "5px" }}>
          <List disablePadding>
            {[
              { label: "delegateCall", value: String(props.tx.delegateCall) },
              { label: "revertOnError", value: String(props.tx.revertOnError) },
              {
                label: "gasLimit",
                value: ethers.utils.formatUnits(props.tx.gasLimit, "wei"),
              },
              { label: "target", value: props.tx.target },
              {
                label: "value",
                value: ethers.utils.formatUnits(props.tx.value, "wei"),
              },
            ].map((item) => (
              <ListItem disablePadding disableGutters>
                <ListItemText
                  primary={
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      {item.label}:{" "}
                      <Typography variant="code" component="span">
                        {item.value}
                      </Typography>
                    </Typography>
                  }
                />
              </ListItem>
            ))}
            {parsedTx ? (
              <ListItem disablePadding disableGutters>
                <Card
                  sx={{
                    borderRadius: "5px",
                    backgroundColor: "#E0E0F8",
                    padding: "5px",
                  }}
                >
                  <CardContent sx={{ padding: "5px" }}>
                    <Typography
                      variant="code"
                      sx={{ fontSize: 12, color: "text.secondary" }}
                    >
                      {parsedTx.signature}
                    </Typography>
                    <List disablePadding>
                      {parsedTx.args.map((item) => (
                        <ListItem disablePadding disableGutters>
                          <ListItemText
                            primary={
                              <Typography
                                sx={{ fontSize: 12, color: "text.secondary" }}
                                variant="code"
                              >
                                {item}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </ListItem>
            ) : (
              <ListItem disablePadding disableGutters>
                <ListItemText
                  primary={
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      data:{" "}
                      <Typography variant="code" component="span">
                        {ethers.utils.hexValue(props.tx.data)}
                      </Typography>
                    </Typography>
                  }
                />
              </ListItem>
            )}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export const CallDataView: Component<{
  tx: ethers.utils.TransactionDescription;
}> = (props) => {
  const [txs, nonce, signature] = props.tx.args;
  const decodedNonce = commons.transaction.decodeNonce(nonce);

  return (
    <>
      <h2>Calldata</h2>
      <Box sx={{ padding: "10px", textAlign: "left" }}>
        <Paper
          sx={{ borderRadius: "5px", padding: "15px", marginBottom: "30px" }}
        >
          <Typography sx={{ fontSize: 16, fontWeight: "bold" }} gutterBottom>
            Transactions
          </Typography>
          {txs && txs.length > 0 && (
            <Grid container direction={"column"} gap={1}>
              {txs.map((tx: commons.transaction.TransactionEncoded) => (
                <TransactionView tx={tx} />
              ))}
            </Grid>
          )}
        </Paper>
        <Paper
          sx={{ borderRadius: "5px", padding: "15px", marginBottom: "30px" }}
        >
          <Typography sx={{ fontSize: 16, fontWeight: "bold" }} gutterBottom>
            Nonce
          </Typography>
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            space:{" "}
            <Typography variant="code" component="span">
              {ethers.utils.formatUnits(decodedNonce[0], "wei")}
            </Typography>
          </Typography>
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            nonce:{" "}
            <Typography variant="code" component="span">
              {ethers.utils.formatUnits(decodedNonce[1], "wei")}
            </Typography>
          </Typography>
        </Paper>
        <Paper
          sx={{ borderRadius: "5px", padding: "15px", marginBottom: "30px" }}
        >
          <Typography sx={{ fontSize: 16, fontWeight: "bold" }} gutterBottom>
            Signature
          </Typography>
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            <Typography variant="code">{signature}</Typography>
          </Typography>
          <Link sx={{ fontSize: 12 }} href={`/?input=${signature}`}>
            View Details
          </Link>
        </Paper>
      </Box>
    </>
  );
};
