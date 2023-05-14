import { ethers } from "ethers";
import { Component, Show } from "solid-js";
import { AccountView } from "./Account";
import { ImageHashView, mayBeImageHash } from "./ImageHash";
import { v2 } from "@0xsequence/core";
import { V2SignatureView } from "./V2Signature";
import { decodeInputAddress } from "../utils";

export const InputView: Component<{ input?: string, optional?: boolean }> = (props) => {
  const isAddress = () => {
    const i = props.input ?? ''

    if (i.includes('#')) {
      return ethers.utils.isAddress(i.split('#')[0])
    }

    return ethers.utils.isAddress(props.input ?? '')
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
      <AccountView address={decodeInputAddress(props.input).address} />
    </Show>
    <Show when={mayImageHash()}>
      <ImageHashView imageHash={props.input!} />
    </Show>
    <Show when={asV2Signature()} keyed>
      { (sig) => <V2SignatureView signature={sig} /> }
    </Show>
    <Show when={askForSomething()}>
      <div>You need to enter something</div>
    </Show>
    <Show when={ !isAddress() && !askForSomething() && !mayImageHash() && asV2Signature() === undefined }>
      <div>What is this?</div>
    </Show>
  </>
}
