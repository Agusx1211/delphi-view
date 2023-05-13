
import { commons } from '@0xsequence/core'

const DEFAULT_CREATION_CODE = '0x603a600e3d39601a805130553df3363d3d373d3d3d363d30545af43d82803e903d91601857fd5bf3'

export const SEQUENCE_CONTEXT: commons.context.VersionedContext = {
  [1]: {
    version: 1,
    factory: '0xf9D09D634Fb818b05149329C1dcCFAeA53639d96',
    mainModule: '0xd01F11855bCcb95f88D7A48492F66410d4637313',
    mainModuleUpgradable: '0x7EFE6cE415956c5f80C6530cC6cc81b4808F6118',
    guestModule: '0x02390F3E6E5FD1C6786CB78FD3027C117a9955A7',
    walletCreationCode: DEFAULT_CREATION_CODE
  },
  [2]: {
    version: 2,
    factory: '0xFaA5c0b14d1bED5C888Ca655B9a8A5911F78eF4A',
    mainModule: '0xfBf8f1A5E00034762D928f46d438B947f5d4065d',
    mainModuleUpgradable: '0x4222dcA3974E39A8b41c411FeDDE9b09Ae14b911',
    guestModule: '0xfea230Ee243f88BC698dD8f1aE93F8301B6cdfaE',
    walletCreationCode: DEFAULT_CREATION_CODE
  }
}

export const HIGHEST_VERSION = 2
