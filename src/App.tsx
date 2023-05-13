import type { Component } from 'solid-js';

import logo from './logo.svg';
import styles from './App.module.css';
import { Header } from './components/Header';
import { AccountView } from './components/Account';

const App: Component = () => {
  return (
    <>
    <Header />
      <div class={styles.App}>
        <AccountView />
      </div>
    </>
  );
};

export default App;
