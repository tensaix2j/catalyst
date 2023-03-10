import { IContentStorageComponent, IFileSystemComponent } from '@dcl/catalyst-storage'
import { ExternalCalls, Validator } from '@mua_molecule/content-validator'
import { EntityType, SyncDeployment } from '@dcl/schemas'
import { IDeployerComponent, SynchronizerComponent } from '@dcl/snapshots-fetcher'
import { IJobQueue } from '@dcl/snapshots-fetcher/dist/job-queue-port'
import { IProcessedSnapshotStorageComponent, ISnapshotStorageComponent } from '@dcl/snapshots-fetcher/dist/types'
import { IFetchComponent } from '@well-known-components/http-server'
import { ILoggerComponent, IMetricsComponent } from '@well-known-components/interfaces'
import { Fetcher } from 'dcl-catalyst-commons'
import { HTTPProvider } from 'eth-connect'
import { Controller } from './controller/Controller'
import { Environment } from './Environment'
import { metricsDeclaration } from './metrics'
import { MigrationManager } from './migrations/MigrationManager'
import { ActiveEntities } from './ports/activeEntities'
import { Clock } from './ports/clock'
import { Denylist } from './ports/denylist'
import { DeployedEntitiesBloomFilter } from './ports/deployedEntitiesBloomFilter'
import { IDeployRateLimiterComponent } from './ports/deployRateLimiterComponent'
import { IFailedDeploymentsComponent } from './ports/failedDeployments'
import { IDatabaseComponent } from './ports/postgres'
import { ISequentialTaskExecutorComponent } from './ports/sequecuentialTaskExecutor'
import { SnapshotGenerator } from './ports/snapshotGenerator'
import { SynchronizationState } from './ports/synchronizationState'
import { SystemProperties } from './ports/system-properties'
import { ContentAuthenticator } from './service/auth/Authenticator'
import { GarbageCollectionManager } from './service/garbage-collection/GarbageCollectionManager'
import { PointerManager } from './service/pointers/PointerManager'
import { Server } from './service/Server'
import { MetaverseContentService } from './service/Service'
import { ISnapshotManager } from './service/snapshots/SnapshotManager'
import { IChallengeSupervisor } from './service/synchronization/ChallengeSupervisor'
import { DaoComponent } from './service/synchronization/clients/HardcodedDAOClient'
import { ContentCluster } from './service/synchronization/ContentCluster'
import { IRetryFailedDeploymentsComponent } from './service/synchronization/retryFailedDeployments'
import { ServerValidator } from './service/validations/server'

// Minimum amount of needed stuff to make the sync work

export type AppComponents = {
  env: Environment
  metrics: IMetricsComponent<keyof typeof metricsDeclaration>
  fetcher: IFetchComponent
  downloadQueue: IJobQueue
  logs: ILoggerComponent
  database: IDatabaseComponent
  deployer: MetaverseContentService
  staticConfigs: {
    contentStorageFolder: string
    tmpDownloadFolder: string
  }
  batchDeployer: IDeployerComponent
  synchronizer: SynchronizerComponent
  synchronizationState: SynchronizationState
  deployedEntitiesBloomFilter: DeployedEntitiesBloomFilter
  controller: Controller
  snapshotManager: ISnapshotManager
  challengeSupervisor: IChallengeSupervisor
  contentCluster: ContentCluster
  pointerManager: PointerManager
  failedDeployments: IFailedDeploymentsComponent
  deployRateLimiter: IDeployRateLimiterComponent
  storage: IContentStorageComponent
  authenticator: ContentAuthenticator
  migrationManager: MigrationManager
  serverValidator: ServerValidator
  externalCalls: ExternalCalls
  validator: Validator
  garbageCollectionManager: GarbageCollectionManager
  systemProperties: SystemProperties
  catalystFetcher: Fetcher
  daoClient: DaoComponent
  server: Server
  retryFailedDeployments: IRetryFailedDeploymentsComponent
  activeEntities: ActiveEntities
  sequentialExecutor: ISequentialTaskExecutorComponent
  denylist: Denylist
  fs: IFileSystemComponent
  ethereumProvider: HTTPProvider
  snapshotGenerator: SnapshotGenerator
  processedSnapshotStorage: IProcessedSnapshotStorageComponent
  clock: Clock
  snapshotStorage: ISnapshotStorageComponent
}

export type MaintenanceComponents = {
  env: Environment
  metrics: IMetricsComponent<keyof typeof metricsDeclaration>
  logs: ILoggerComponent
  database: IDatabaseComponent
  storage: IContentStorageComponent
  fs: IFileSystemComponent
  migrationManager: MigrationManager
}

export type Timestamp = number

export enum EntityVersion {
  V2 = 'v2',
  V3 = 'v3',
  V4 = 'v4'
}

export type CannonicalEntityDeployment = { entity: SyncDeployment; servers: string[] }

export type StatusProbeResult = {
  /** name is used as unique key for the status map */
  name: string
  data: Record<string, any>
  // ready?: boolean
}

export type IStatusCapableComponent = {
  getComponentStatus(): Promise<StatusProbeResult>
}

// TODO: Move this to catalyst-commons and remove the check for trailing s?
export function parseEntityType(strType: string): EntityType {
  if (strType.endsWith('s')) {
    strType = strType.slice(0, -1)
  }
  strType = strType.toUpperCase().trim()
  const type = EntityType[strType]
  return type
}

export type DeploymentId = number
