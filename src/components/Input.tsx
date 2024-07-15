import { ethers } from "ethers";
import { Component, Show } from "solid-js";
import { walletContracts } from "@0xsequence/abi"
import { AccountView } from "./Account";
import { ImageHashView, mayBeImageHash } from "./ImageHash";
import { v2 } from "@0xsequence/core";
import { V2SignatureView } from "./V2Signature";
import { decodeInputAddress } from "../utils";
import { CallDataView } from "./CallData";
import { ConnectedChain, OnboardAPI, WalletState } from "@web3-onboard/solid";

export const InputView: Component<{ input?: string, optional?: boolean, wallet: WalletState | null, onboard: OnboardAPI, getChain: (walletLabel: string) => ConnectedChain | null }> = (props) => {
  const isAddress = () => {
    const i = props.input ?? ''

    if (i.includes('#')) {
      return ethers.utils.isAddress(i.split('#')[0])
    }

    return ethers.utils.isAddress(props.input ?? '')
  }

  const asCallData = () => {
    try {
      const mainModuleInterface = new ethers.utils.Interface(walletContracts.mainModule.abi)
      return mainModuleInterface.parseTransaction({ data: props.input ?? '' })
    } catch {}

    return undefined
  }

  const mayImageHash = () => mayBeImageHash(props.input ?? '')
  const askForSomething = () => !props.optional && (props.input === '' || !props.input)

  const asV2Signature = () => {
    try {
      return v2.signature.SignatureCoder.decode(props.input ?? '')
    } catch {}

    return undefined
  }

  return <>
    <Show when={isAddress()}>
      <AccountView getChain={props.getChain} onboard={props.onboard} wallet={props.wallet} address={decodeInputAddress(props.input).address} />
    </Show>
    <Show when={mayImageHash()}>
      <ImageHashView imageHash={props.input!} />
    </Show>
    <Show when={asV2Signature()} keyed>
      { (sig) => <><h2>Signature</h2><V2SignatureView signature={sig} /></> }
    </Show>
    <Show when={asCallData()} keyed>
      { (tx) => <><h2>Calldata</h2><CallDataView tx={tx} /></> }
    </Show>
    <Show when={askForSomething()}>
      <div>You need to enter something</div>
    </Show>
    <Show when={ !isAddress() && !askForSomething() && !mayImageHash() && asV2Signature() === undefined && asCallData() === undefined }>
      <div>What is this?</div>
    </Show>
  </>
}
