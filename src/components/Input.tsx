import { ethers } from "ethers";
import { Component, createSignal, Show, createEffect } from "solid-js";
import { walletContracts } from "@0xsequence/abi";
import { AccountView } from "./Account";
import { ConfigView, mayBeImageHash } from "./ImageHash";
import { commons, v2 } from "@0xsequence/core";
import { V2SignatureView } from "./V2Signature";
import { decodeInputAddress } from "../utils";
import { CallDataView } from "./CallData";
import { ConnectedChain, OnboardAPI, WalletState } from "@web3-onboard/solid";
import { NETWORKS } from "../stores/NetworksStore";
import { LinearProgress } from "@suid/material";
import { TRACKER } from "../stores/TrackerStore";

export const InputView: Component<{
  input?: string;
  optional?: boolean;
  wallet: WalletState | null;
  onboard: OnboardAPI;
  getChain: (walletLabel: string) => ConnectedChain | null;
}> = (props) => {
  const [address, setAddress] = createSignal<string | undefined>();
  const [config, setConfig] = createSignal<commons.config.Config | undefined>();
  const [v2Signature, setV2Signature] = createSignal<
    | v2.signature.UnrecoveredSignature
    | v2.signature.UnrecoveredChainedSignature
    | undefined
  >();
  const [tx, setTx] = createSignal<
    ethers.utils.TransactionDescription | undefined
  >();
  const [chain, setChain] = createSignal<number | undefined>();
  const [calldata, setCalldata] = createSignal<string | undefined>();
  const [walletAddress, setWalletAddress] = createSignal<string | undefined>();
  const [loading, setLoading] = createSignal(false);

  const mainModuleInterface = new ethers.utils.Interface(
    walletContracts.mainModule.abi
  );

  createEffect(async () => {
    setLoading(true);
    setTx(undefined);
    setCalldata(undefined)
    setChain(undefined)
    setWalletAddress(undefined)
    setAddress(undefined);
    setConfig(undefined);
    setV2Signature(undefined);

    let input = props.input ?? "";

    if (
      ethers.utils.isAddress(input) ||
      ethers.utils.isAddress(input.split("#")[0])
    ) {
      setAddress(input);
      return;
    }

    try {
      setV2Signature(v2.signature.SignatureCoder.decode(input));
      return;
    } catch {}

    try {
      setTx(mainModuleInterface.parseTransaction({ data: input }));
      setCalldata(input)
      return;
    } catch {}

    if (mayBeImageHash(input)) {
      try {
        const config = await TRACKER.configOfImageHash({ imageHash: input });
        setConfig(config);
        return
      } catch {}
      
      const chainReq = NETWORKS.map(async (network) => {
        try {
          const provider = new ethers.providers.JsonRpcProvider(network.rpcUrl);
          return await provider.getTransaction(input);
        } catch {
          return null;
        }
      });

      const chainRes = await Promise.all(chainReq);

      const tx = chainRes.find((res) => res !== null);

      if (tx) {
        try {
          setTx(mainModuleInterface.parseTransaction({ data: tx.data }));
          setChain(tx.chainId);
          setCalldata(tx.data)
          const receipt = await tx.wait();
          const nonceChangedLog = receipt.logs.find(
            (log) =>
              log.topics[0] ===
              "0x1f180c27086c7a39ea2a7b25239d1ab92348f07ca7bb59d1438fcf527568f881"
          );
          setWalletAddress(nonceChangedLog?.address);
        } catch {}
      }
    }

    setLoading(false);
  });

  const askForSomething = () =>
    !props.optional && (props.input === "" || !props.input);

  return (
    <>
      <Show when={address()} keyed>
        {(address) => (
          <AccountView
            getChain={props.getChain}
            onboard={props.onboard}
            wallet={props.wallet}
            address={decodeInputAddress(address).address}
          />
        )}
      </Show>
      <Show when={config()} keyed>
        {(config) => <ConfigView config={config} />}
      </Show>
      <Show when={tx()} keyed>
        {(tx) => (
          <>
            <h2>Calldata</h2>
            <CallDataView tx={tx} chain={chain()} walletAddress={walletAddress()} calldata={calldata()} />
          </>
        )}
      </Show>
      <Show when={v2Signature()} keyed>
        {(sig) => (
          <>
            <h2>Signature</h2>
            <V2SignatureView suffixSig={false} signature={sig} />
          </>
        )}
      </Show>
      <Show when={askForSomething()}>
        <div>You need to enter something</div>
      </Show>
      <Show
        when={
          !address() &&
          !askForSomething() &&
          !config() &&
          !v2Signature() &&
          !tx() &&
          !loading()
        }
      >
        <div>What is this?</div>
      </Show>
      <Show
        when={
          !address() &&
          !askForSomething() &&
          !config() &&
          !v2Signature() &&
          !tx() &&
          loading()
        }
      >
        <LinearProgress />
      </Show>
    </>
  );
};
