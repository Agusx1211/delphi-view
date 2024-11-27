import { NetworkConfig, ChainId, networks } from '@0xsequence/network'

export const indexerURL = (network: string) => `https://${network}-relayer.sequence.app`
export const relayerURL = (network: string) => `https://${network}-indexer.sequence.app`
export const nodesURL = (network: string) => `https://nodes.sequence.app/${network}/AQAAAAAAAJ34xUT-MXAgwfvO0h2r5DciJYE`

const genUrls = (network: string) => {
  const rpcUrl = nodesURL(network)
  return {
    rpcUrl,
    relayer: {
      url: relayerURL(network),
      provider: {
        url: rpcUrl,
      }
    },
    indexerUrl: indexerURL(network)
  }
}

// Add default values for API, relayer and Indexer
export const NETWORKS: NetworkConfig[] = [
  {
    ...networks[ChainId.MAINNET],
    ...genUrls('mainnet'),
    isDefaultChain: true
  },
  {
    ...networks[ChainId.SEPOLIA],
    ...genUrls('sepolia'),
  },
  {
    ...networks[ChainId.POLYGON],
    ...genUrls('polygon'),
  },
  {
    ...networks[ChainId.BSC],
    ...genUrls('bsc'),
  },
  {
    ...networks[ChainId.AVALANCHE],
    ...genUrls('avalanche'),
  },
  {
    ...networks[ChainId.ARBITRUM],
    ...genUrls('arbitrum'),
  },
  {
    ...networks[ChainId.ARBITRUM_NOVA],
    ...genUrls('arbitrum-nova'),
  },
  {
    ...networks[ChainId.ARBITRUM_SEPOLIA],
    ...genUrls('arbitrum-sepolia'),
  },
  {
    ...networks[ChainId.OPTIMISM],
    ...genUrls('optimism'),
  },
  {
    ...networks[ChainId.POLYGON_ZKEVM],
    ...genUrls('polygon-zkevm'),
    name: 'Pol-ZKEVM'
  },
  {
    ...networks[ChainId.GNOSIS],
    ...genUrls('gnosis'),
  },
  {
    ...networks[ChainId.POLYGON_AMOY],
    ...genUrls('amoy'),
  },
  {
    ...networks[ChainId.BSC_TESTNET],
    ...genUrls('bsc-testnet'),
  },
  {
    ...networks[ChainId.BASE],
    ...genUrls('base'),
  },
  {
    ...networks[ChainId.HOMEVERSE],
    ...genUrls('homeverse'),
  },
  {
    ...networks[ChainId.HOMEVERSE_TESTNET],
    ...genUrls('homeverse-testnet'),
  },
  {
    ...networks[ChainId.AVALANCHE_TESTNET],
    ...genUrls('avalanche-testnet'),
  }
]
