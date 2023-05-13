import { createSignal, createEffect } from 'solid-js';
import { ethers } from 'ethers';
import { input } from './InputStore';
import { Account, AccountStatus } from '@0xsequence/account'
import { TRACKER } from './TrackerStore';
import { SEQUENCE_CONTEXT } from './ContextStore';
import { Orchestrator } from '@0xsequence/signhub';
import { NETWORKS } from './NetworksStore';
import { NetworkConfig } from '@0xsequence/network'

export type NetworkAndStatus = AccountStatus & { network: NetworkConfig }

const [isInputAddress, setIsInputAddress] = createSignal(false)
const [status, setStatus] = createSignal<undefined | NetworkAndStatus[]>()
const [addressLoading, setAddressLoading] = createSignal(false)

createEffect(async () => {
  const inp = input() || ''
  const isAddress = ethers.utils.isAddress(inp)
  setIsInputAddress(isAddress)

  console.log('isAddress', isAddress, 'inp', inp)

  if (!isAddress) {
    setStatus(undefined)
    return
  }

  setAddressLoading(true)

  const account = new Account({
    address: inp,
    tracker: TRACKER,
    contexts: SEQUENCE_CONTEXT,
    orchestrator: new Orchestrator([]), // We are not signing, so it can be empty
    networks: NETWORKS
  })

  // Load statues for all networks
  const statuses = await Promise.all(NETWORKS.map(async (network) => {
    console.log('loading status for network', network.chainId)
    const status = await account.status(network.chainId, true)
    return { ...status, network }
  }))

  console.log('statuses', statuses)

  setStatus(statuses)
  setAddressLoading(false)
})

export { isInputAddress, status, addressLoading }
