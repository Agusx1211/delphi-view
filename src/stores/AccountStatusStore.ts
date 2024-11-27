import { Accessor, Signal, createSignal } from 'solid-js';
import { Account, AccountStatus } from '@0xsequence/account'
import { ethers } from 'ethers';
import { Orchestrator } from '@0xsequence/signhub';
import { NETWORKS } from './NetworksStore';
import { NetworkConfig } from '@0xsequence/network'
import { SEQUENCE_CONTEXT } from './ContextStore';
import { TRACKER } from './TrackerStore';

type NetworkAndStatus = AccountStatus & { network: NetworkConfig }

export type AccountStatusStore = {
  address: string,
  networks: NetworkConfig[],
  status: (chainId: number) => NetworkAndStatus | undefined,
  statusShort: (chainId: number) => AccountStatus | undefined,
  error: (chainId: number) => any | undefined,
  loading: (chainId: number) => boolean,
}

export const createStatusStore = (address: string): AccountStatusStore => {
  const statuses: Record<number, Signal<NetworkAndStatus | undefined>> = {};
  const statusesShort: Record<number, Signal<NetworkAndStatus | undefined>> = {};
  const errors: Record<number, Signal<any>> = {};
  const loading: Record<number, Signal<boolean>> = {};  

  NETWORKS.forEach((network) => {
    statuses[network.chainId] = createSignal<NetworkAndStatus | undefined>();
    errors[network.chainId] = createSignal<any>();
    loading[network.chainId] = createSignal<boolean>(false);
    statusesShort[network.chainId] = createSignal<NetworkAndStatus | undefined>();
  });

  (async () => {
    if (!ethers.isAddress(address)) {
      return;
    }

    NETWORKS.forEach(async (network) => {
      loading[network.chainId][1](true)
      errors[network.chainId][1](undefined)

      try {
        const account = new Account({
          address,
          tracker: TRACKER,
          contexts: SEQUENCE_CONTEXT,
          orchestrator: new Orchestrator([]), // We are not signing, so it can be empty
          networks: NETWORKS
        });

        const [status, statusLong] = await Promise.all([
          account.status(network.chainId, false),
          account.status(network.chainId, true)
        ])
        const resultLong = { ...statusLong, network };
        const result = { ...status, network };

        statuses[network.chainId][1](resultLong);
        statusesShort[network.chainId][1](result);
      } catch (error) {
        errors[network.chainId][1](error);
      }

      loading[network.chainId][1](false);
    });
  })();

  return {
    address,
    networks: NETWORKS,
    status: (chainId: number) => statuses[chainId][0](),
    statusShort: (chainId: number) => statusesShort[chainId][0](),
    error: (chainId: number) => errors[chainId][0](),
    loading: (chainId: number) => loading[chainId][0]()
  };
};