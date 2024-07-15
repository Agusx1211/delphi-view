import { AppBar, Toolbar, Typography, Paper, InputBase, Button, Box } from "@suid/material";
import { Component } from "solid-js";
import logo from "../logo.svg";
import { input, setInput } from "../stores/InputStore";
import { ConnectOptions, WalletState } from "@web3-onboard/solid";

export const Header: Component<{
  wallet: WalletState | null, connectWallet: (options?: ConnectOptions) => Promise<void>;
}> = (props) => {
  return (
    <AppBar color="primary" position="fixed" elevation={2}>
      <Toolbar>
        <img src={logo} alt="DelphiView Logo" width="50" height="50" style={{ margin: '16px' }}/>
        <Typography variant="h4" noWrap>
          DelphiView
        </Typography>
        <Paper
        component="form"
        sx={{ p: '2px 4px', m: '16px', display: 'flex', alignItems: 'center', width: 600 }}
        >
          <InputBase
            value={input()}
            sx={{ ml: 1, flex: 1 }}
            placeholder="Paste anything here"
            inputProps={{ 'aria-label': 'search google maps' }}
            onChange={(e) => setInput(e.currentTarget.value)}
          />
        </Paper>
        <Box sx={{marginLeft: "auto", marginRight: "16px"}}>
        {props.wallet ? <Typography>{`${props.wallet.accounts[0].address.slice(0, 5)}.....${props.wallet.accounts[0].address.slice(37)}`}</Typography>  : <Button onClick={() => props.connectWallet({autoSelect: {label: 'MetaMask', disableModals: true}})} sx={{ bgcolor: "#ffffff", textTransform: 'none', '&:hover': { bgcolor: "#caddff" } }}>Connect Wallet</Button>}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
