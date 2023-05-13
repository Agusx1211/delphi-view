import { Component, Show } from 'solid-js';

import logo from './logo.svg';
import styles from './App.module.css';
import { Header } from './components/Header';
import { AccountView } from './components/Account';
import { input } from './stores/InputStore';

import { StyledProps, ThemeProvider, createTheme } from '@suid/material';

declare module "@suid/material/styles" {
  interface TypographyVariants {
    code: StyledProps;
  }

  interface TypographyVariantsOptions {
    code?: StyledProps;
  }
}

declare module "@suid/material/Typography" {
  interface TypographyPropsVariantOverrides {
    code: true;
  }
}

const customTheme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
      contrastText: "white",
    },
  },
  typography: {
    code: {
      fontSize: "0.9rem",
      fontFamily: "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
      overflowWrap: "break-word",
      wordWrap: "break-word",
      wordBreak: "break-word",
    },
  }
});

const App: Component = () => {
  return (
    <>
    <Header />
      <ThemeProvider theme={customTheme}>
        <div class={styles.App}>
          <Show when={input()} keyed>
            {(i) => <AccountView address={i} />}
          </Show>
        </div>
      </ThemeProvider>
    </>
  );
};

export default App;
