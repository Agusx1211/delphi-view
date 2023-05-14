import { AppBar, Toolbar, Typography, TextField, Grid, Paper, InputBase } from "@suid/material";
import { Component } from "solid-js";
import logo from "../logo.svg";
import { input, setInput } from "../stores/InputStore";

export const Header: Component = () => {
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
      </Toolbar>
    </AppBar>
  );
};
