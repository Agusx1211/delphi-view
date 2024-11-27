import { NetworkConfig, ChainId, networks, NetworkMetadata } from '@0xsequence/network'

export const indexerURL = (network: string) => `https://${network}-relayer.sequence.app`
export const relayerURL = (network: string) => `https://${network}-indexer.sequence.app`
export const nodesURL = (network: string) => `https://nodes.sequence.app/${network}/AQAAAAAAAJ34xUT-MXAgwfvO0h2r5DciJYE`

const genUrls = (networkName: string) => {
  const rpcUrl = nodesURL(networkName)
  return {
    rpcUrl,
    relayer: {
      url: relayerURL(networkName),
      provider: {
        url: rpcUrl,
      }
    },
    indexerUrl: indexerURL(networkName)
  }
}

const genNetworkConfig: (network: NetworkMetadata) => NetworkConfig = (network) => ({
  ...network,
  ...genUrls(network.name),
  isDefaultChain: network.chainId === ChainId.MAINNET,
})

// Add default values for API, relayer and Indexer
export const NETWORKS: NetworkConfig[] = Object.values(networks)
  .filter(n => !n.deprecated)
  .map(n => genNetworkConfig(n))
