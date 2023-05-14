
import { trackers } from '@0xsequence/sessions'
import { NETWORKS } from './NetworksStore'
import { SEQUENCE_CONTEXT } from './ContextStore'

// export const TRACKER = new trackers.remote.RemoteConfigTracker('https://fun-sessions.sequence.app')

export const REMOTE_TRACKER = new trackers.remote.RemoteConfigTracker('https://fun-sessions.sequence.app')

export const TRACKER = new trackers.CachedTracker(
  REMOTE_TRACKER,
  new trackers.local.LocalConfigTracker(NETWORKS[0].provider!),
  SEQUENCE_CONTEXT
)
