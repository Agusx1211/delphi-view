import { Component, Show } from 'solid-js';

import styles from './App.module.css';
import { Header } from './components/Header';
import { SideContext, input, input2, setInput2 } from './stores/InputStore';

import { Box, Button, StyledProps, ThemeProvider, createTheme } from '@suid/material';
import { InputView } from './components/Input';

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
  const showSide = () => input2() !== '' && input2() !== undefined
  return (
    <>
      <ThemeProvider theme={customTheme}>
          <div class={styles.App}>
            <Header />
            <Box class={styles.ViewContainer}>
              <Box class={styles.ViewBox}>
                <Box sx={{ p: '1rem'}}>
                  <SideContext.Provider value={1}>
                    <InputView input={ input()} />
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
                      <InputView optional input={ input2()} />
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
