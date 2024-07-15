import { Orchestrator, signers } from "@0xsequence/signhub";
import { Account } from "@0xsequence/account";
import { trackers } from "@0xsequence/sessions";
import { allNetworks } from "@0xsequence/network";
import { commons } from "@0xsequence/core";
import { StaticSigner } from "./StaticSigner";

export const TRACKER = new trackers.remote.RemoteConfigTracker("https://sessions.sequence.app")
export const NETWORKS = allNetworks

export function accountFor(args: { address: string, signatures?: { signer: string, signature: string }[] }) {
    const signers: signers.SapientSigner[] = []
  
    if (args.signatures) {
      for (const { signer, signature } of args.signatures) {
        signers.push(new StaticSigner(signer, signature))
      }
    }
  
    return new Account({
      address: args.address,
      tracker: TRACKER,
      contexts: commons.context.defaultContexts,
      orchestrator: new Orchestrator(signers),
      networks: NETWORKS
    })
  }