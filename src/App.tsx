import { Component, Show } from 'solid-js';

import styles from './App.module.css';
import { Header } from './components/Header';
import { SideContext, input, input2, setInput2 } from './stores/InputStore';

import { Box, Button, StyledProps, ThemeProvider, createTheme } from '@suid/material';
import { InputView } from './components/Input';

import wagmi from '@web3-onboard/wagmi'
import { init, useOnboard } from '@web3-onboard/solid'
import injectedModule from '@web3-onboard/injected-wallets'
import { NETWORKS } from "./stores/NetworksStore";

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

const injected = injectedModule()

const onboard = init({
  wagmi,
  wallets: [injected],
  chains: NETWORKS.sort((a, b) => a.chainId - b.chainId).map((n) => {
    return {
      id: n.chainId,
      label: n.name,
      rpcUrl: n.rpcUrl
    }
  }),
  accountCenter: {desktop: {enabled: false}, mobile: {enabled: false}},
  connect: {autoConnectLastWallet: true}
})

const App: Component = () => {
  const { connectWallet, connectedWallet, getChain } = useOnboard()
  const showSide = () => input2() !== '' && input2() !== undefined

  return (
    <>
      <ThemeProvider theme={customTheme}>
          <div class={styles.App}>
            <Header wallet={connectedWallet()} connectWallet={connectWallet} />
            <Box class={styles.ViewContainer}>
              <Box class={styles.ViewBox}>
                <Box sx={{ p: '1rem'}}>
                  <SideContext.Provider value={1}>
                    <InputView getChain={getChain} onboard={onboard} wallet={connectedWallet()} input={ input()} />
                  </SideContext.Provider>
                </Box>
              </Box>
              <Show when={showSide()}>
                <Box class={`${styles.ViewBox2} ${styles.scrollable}`}>
                  <Box sx={{ p: '1rem'}}>
                    <Box sx={{ display: "flex" }} justifyContent="space-between">
                      <Button variant="outlined" sx={{ m: '0.25rem' }} onClick={() => {
                        // Open input 2 (as input 1) on a new tab
                        window.open(`/?input=${input2()}`, '_blank')
                      }}>Focus</Button>
                      <Button variant="outlined" sx={{ m: '0.25rem' }} onClick={() => setInput2('')}>Close</Button>
                    </Box>
                    <SideContext.Provider value={2}>
                      <InputView getChain={getChain} onboard={onboard} optional wallet={connectedWallet()} input={ input2()} />
                    </SideContext.Provider>
                  </Box>
                </Box>
              </Show>
            </Box>
          </div>
      </ThemeProvider>
    </>
  );
};

export default App;
