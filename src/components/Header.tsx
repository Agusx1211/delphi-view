import { AppBar, Toolbar, Typography, TextField, Grid } from "@suid/material";
import { Component } from "solid-js";
import logo from "../logo.svg";
import { input, setInput } from "../stores/InputStore";

export const Header: Component = () => {
  return (
    <AppBar position="static" color="default" elevation={1}>
      <Grid container direction="column">
        <Grid item>
          <Toolbar>
            <img src={logo} alt="DelphiView Logo" width="50" height="50" style={{ margin: '16px' }}/>
            <Typography variant="h4" noWrap>
              DelphiView
            </Typography>
          </Toolbar>
        </Grid>
        <Grid item xs={12} sm={8} md={6} lg={4}>
          <TextField
            placeholder="Paste anything here..."
            value={input()}
            onChange={(e) => setInput(e.currentTarget.value)}
            style={{ margin: '1rem', width: '45%' }}
          />
        </Grid>
      </Grid>
    </AppBar>
  );
};
