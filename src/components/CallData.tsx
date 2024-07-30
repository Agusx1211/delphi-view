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
} from "@suid/material";
import { Component, For } from "solid-js";
import { ethers } from "ethers";

const TransactionView: Component<{
  tx: commons.transaction.TransactionEncoded;
}> = (props) => {
  const decodeData = (calldata: string) => {
    let parsedTx = undefined;
    try {
      const mainModuleUpgradableInterface = new ethers.utils.Interface(
        walletContracts.mainModuleUpgradable.abi
      );
      parsedTx = mainModuleUpgradableInterface.parseTransaction({
        data: calldata,
      });
    } catch {}

    try {
      const mainModuleInterface = new ethers.utils.Interface(
        walletContracts.mainModule.abi
      );
      parsedTx = mainModuleInterface.parseTransaction({ data: calldata });
    } catch {}

    try {
      const walletFactoryInterface = new ethers.utils.Interface(
        walletContracts.factory.abi
      );
      parsedTx = walletFactoryInterface.parseTransaction({ data: calldata });
    } catch {}

    return parsedTx;
  };

  const parsedTx = decodeData(ethers.utils.hexlify(props.tx.data));

  return (
    <Box sx={{ marginBottom: "15px", textAlign: "left" }}>
      <Card
        sx={{ borderRadius: "5px", backgroundColor: "#f5f5f5", padding: "5px" }}
      >
        <CardContent sx={{ padding: "5px" }}>
          <List disablePadding>
            <For
              each={[
                { label: "delegateCall", value: String(props.tx.delegateCall) },
                {
                  label: "revertOnError",
                  value: String(props.tx.revertOnError),
                },
                {
                  label: "gasLimit",
                  value: ethers.utils.formatUnits(props.tx.gasLimit, "wei"),
                },
                { label: "target", value: props.tx.target },
                {
                  label: "value",
                  value: ethers.utils.formatUnits(props.tx.value, "wei"),
                },
                {
                  label: "data",
                  value: ethers.utils.hexlify(props.tx.data),
                },
              ]}
            >
              {(item: any) => (
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
              )}
            </For>
            {parsedTx &&
              (parsedTx.name === "execute" ? (
                <CallDataView tx={parsedTx} />
              ) : (
                <ListItem disablePadding>
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
                        sx={{
                          fontSize: 12,
                          fontWeight: "bold",
                          color: "text.secondary",
                        }}
                      >
                        {parsedTx.signature}
                      </Typography>
                      <List disablePadding>
                        {parsedTx.args.map((item) => (
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
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </ListItem>
              ))}
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
  const sequenceTxs = txs.map((tx: commons.transaction.TransactionEncoded): commons.transaction.Transaction => {
    return { to: tx.target, revertOnError: tx.revertOnError, delegateCall: tx.delegateCall, value: tx.value, data: tx.data, gasLimit: tx.gasLimit }
  })

  return (
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
          raw:{" "}
          <Typography variant="code" component="span">
            {ethers.utils.formatUnits(nonce, "wei")}
          </Typography>
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
        {signature !== "0x" && (
          <Typography variant="code" ml="0.5rem">
          <a href={`${location.pathname}?input=${signature}&digest=${commons.transaction.digestOfTransactions(nonce, sequenceTxs)}`}>
            {"[->]"}
          </a>
        </Typography>
        )}
      </Paper>
    </Box>
  );
};
