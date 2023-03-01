import { EntityType, EthAddress } from '@dcl/schemas'
import { ILoggerComponent } from '@well-known-components/interfaces'
import ms from 'ms'
import { initComponentsWithEnv } from './components'
import { AppComponents, parseEntityType } from './types'

export const CURRENT_CONTENT_VERSION = 'v3'
const DEFAULT_STORAGE_ROOT_FOLDER = 'storage'
const DEFAULT_SERVER_PORT = 6969
const DEFAULT_DENYLIST_FILE_NAME = 'denylist.txt'
const DEFAULT_DENYLIST_URLS = 'https://config.decentraland.org/denylist'
const DECENTRALAND_ADDRESS: EthAddress = '0xc9a332bcddcdecb3a6e4f6cdc18a5775651ca133'

const DEFAULT_FOLDER_MIGRATION_MAX_CONCURRENCY = 1000
export const DEFAULT_ENTITIES_CACHE_SIZE = 150000
export const DEFAULT_ETH_NETWORK = 'goerli'
export const DEFAULT_ENS_OWNER_PROVIDER_URL_TESTNET =
  'https://api.thegraph.com/subgraphs/name/decentraland/marketplace-goerli'
const DEFAULT_ENS_OWNER_PROVIDER_URL_MAINNET = 'https://api.thegraph.com/subgraphs/name/decentraland/marketplace'
export const DEFAULT_LAND_MANAGER_SUBGRAPH_TESTNET =
  'https://api.thegraph.com/subgraphs/name/decentraland/land-manager-goerli'
export const DEFAULT_LAND_MANAGER_SUBGRAPH_MAINNET = 'https://api.thegraph.com/subgraphs/name/decentraland/land-manager'
export const DEFAULT_COLLECTIONS_SUBGRAPH_TESTNET =
  'https://api.thegraph.com/subgraphs/name/decentraland/collections-ethereum-goerli'
export const DEFAULT_COLLECTIONS_SUBGRAPH_MAINNET =
  'https://api.thegraph.com/subgraphs/name/decentraland/collections-ethereum-mainnet'
export const DEFAULT_COLLECTIONS_SUBGRAPH_MATIC_MUMBAI =
  'https://api.thegraph.com/subgraphs/name/decentraland/collections-matic-mumbai'
export const DEFAULT_COLLECTIONS_SUBGRAPH_MATIC_MAINNET =
  'https://api.thegraph.com/subgraphs/name/decentraland/collections-matic-mainnet'
export const DEFAULT_THIRD_PARTY_REGISTRY_SUBGRAPH_MATIC_MUMBAI =
  'https://api.thegraph.com/subgraphs/name/decentraland/tpr-matic-mumbai'
export const DEFAULT_THIRD_PARTY_REGISTRY_SUBGRAPH_MATIC_MAINNET =
  'https://api.thegraph.com/subgraphs/name/decentraland/tpr-matic-mainnet'
export const DEFAULT_BLOCKS_SUBGRAPH_TESTNET =
  'https://api.thegraph.com/subgraphs/name/decentraland/blocks-ethereum-goerli'
export const DEFAULT_BLOCKS_SUBGRAPH_MAINNET =
  'https://api.thegraph.com/subgraphs/name/decentraland/blocks-ethereum-mainnet'
export const DEFAULT_BLOCKS_SUBGRAPH_MATIC_MUMBAI =
  'https://api.thegraph.com/subgraphs/name/decentraland/blocks-matic-mumbai'
export const DEFAULT_BLOCKS_SUBGRAPH_MATIC_MAINNET =
  'https://api.thegraph.com/subgraphs/name/decentraland/blocks-matic-mainnet'

export const DEFAULT_LAND_MANAGER_SUBGRAPH_AVALANCHE    = 'https://api.thegraph.com/subgraphs/name/tensaix2j/land-manager-avax';
export const DEFAULT_COLLECTIONS_SUBGRAPH_AVALANCHE     = 'https://api.thegraph.com/subgraphs/name/tensaix2j/collections-avax';
export const DEFAULT_BLOCKS_SUBGRAPH_AVALANCHE          = 'https://api.thegraph.com/subgraphs/name/tensaix2j/blocks-avax';


export const CURRENT_COMMIT_HASH = process.env.COMMIT_HASH ?? 'Unknown'
export const CURRENT_CATALYST_VERSION = process.env.CATALYST_VERSION ?? 'Unknown'
export const DEFAULT_DATABASE_CONFIG = {
  password: '12345678',
  user: 'postgres',
  database: 'content',
  host: 'localhost',
  schema: 'public',
  port: 5432
}
const DEFAULT_SYNC_STREAM_TIMEOUT = '10m'

export class Environment {
  private configs: Map<EnvironmentConfig, any>

  constructor(otherEnv?: Environment) {
    this.configs = otherEnv ? new Map(otherEnv.configs) : new Map()
  }

  getConfig<T>(key: EnvironmentConfig): T {
    return this.configs.get(key)
  }

  setConfig<T>(key: EnvironmentConfig, value: T): Environment {
    this.configs.set(key, value)
    return this
  }

  logConfigValues(logger: ILoggerComponent.ILogger): void {
    logger.info('These are the configuration values:')
    const sensitiveEnvs = [EnvironmentConfig.PSQL_PASSWORD, EnvironmentConfig.PSQL_USER]
    for (const [config, value] of this.configs.entries()) {
      if (!sensitiveEnvs.includes(config)) {
        logger.info(`${EnvironmentConfig[config]}: ${this.printObject(value)}`)
      }
    }
  }

  private printObject(object: any) {
    if (object instanceof Map) {
      let mapString: string = '{'
      object.forEach((value: string, key: string) => {
        mapString += `'${key}': ${value},`
      })
      mapString += '}'
      return mapString
    } else {
      return JSON.stringify(object)
    }
  }
}

export enum EnvironmentConfig {
  STORAGE_ROOT_FOLDER,
  SERVER_PORT,
  LOG_REQUESTS,
  UPDATE_FROM_DAO_INTERVAL,
  DECENTRALAND_ADDRESS,
  DEPLOYMENTS_DEFAULT_RATE_LIMIT_TTL,
  DEPLOYMENTS_DEFAULT_RATE_LIMIT_MAX,
  ETH_NETWORK,
  LOG_LEVEL,
  FETCH_REQUEST_TIMEOUT,
  USE_COMPRESSION_MIDDLEWARE,
  BOOTSTRAP_FROM_SCRATCH,
  REQUEST_TTL_BACKWARDS,
  ENS_OWNER_PROVIDER_URL,
  LAND_MANAGER_SUBGRAPH_URL,
  COLLECTIONS_L1_SUBGRAPH_URL,
  COLLECTIONS_L2_SUBGRAPH_URL,
  THIRD_PARTY_REGISTRY_L2_SUBGRAPH_URL,
  PSQL_PASSWORD,
  PSQL_USER,
  PSQL_DATABASE,
  PSQL_HOST,
  PSQL_SCHEMA,
  PSQL_PORT,
  PG_IDLE_TIMEOUT,
  PG_QUERY_TIMEOUT,
  PG_STREAM_QUERY_TIMEOUT,
  GARBAGE_COLLECTION,
  GARBAGE_COLLECTION_INTERVAL,
  SNAPSHOT_FREQUENCY_IN_MILLISECONDS,
  CUSTOM_DAO,
  DISABLE_SYNCHRONIZATION,
  SYNC_STREAM_TIMEOUT,
  CONTENT_SERVER_ADDRESS,
  ENTITIES_CACHE_SIZE,
  BLOCKS_L1_SUBGRAPH_URL,
  BLOCKS_L2_SUBGRAPH_URL,
  VALIDATE_API,
  FOLDER_MIGRATION_MAX_CONCURRENCY,
  RETRY_FAILED_DEPLOYMENTS_DELAY_TIME,
  DEPLOYMENT_RATE_LIMIT_TTL,
  DEPLOYMENT_RATE_LIMIT_MAX,
  DENYLIST_FILE_NAME,
  DENYLIST_URLS,
  READ_ONLY,

  // List of entity types ignored during the synchronization
  SYNC_IGNORED_ENTITY_TYPES,
  IGNORE_BLOCKCHAIN_ACCESS_CHECKS,

  COLLECTIONS_L3_SUBGRAPH_URL,
  LAND_MANAGER_L3_SUBGRAPH_URL,
  BLOCKS_L3_SUBGRAPH_URL
      
}
export class EnvironmentBuilder {
  private baseEnv: Environment
  constructor(other?: Environment | EnvironmentBuilder) {
    if (other) {
      if (other instanceof EnvironmentBuilder) {
        this.baseEnv = new Environment(other.baseEnv)
      } else {
        this.baseEnv = new Environment(other)
      }
    } else {
      this.baseEnv = new Environment()
    }
  }

  withConfig(config: EnvironmentConfig, value: any): EnvironmentBuilder {
    this.baseEnv.setConfig(config, value)
    return this
  }

  async buildConfigAndComponents(): Promise<AppComponents> {
    return await initComponentsWithEnv(await this.build())
  }

  async build(): Promise<Environment> {
    const env = new Environment()

    this.registerConfigIfNotAlreadySet(
      env,
      EnvironmentConfig.STORAGE_ROOT_FOLDER,
      () => process.env.STORAGE_ROOT_FOLDER ?? DEFAULT_STORAGE_ROOT_FOLDER
    )
    this.registerConfigIfNotAlreadySet(
      env,
      EnvironmentConfig.DENYLIST_FILE_NAME,
      () => process.env.DENYLIST_FILE_NAME ?? DEFAULT_DENYLIST_FILE_NAME
    )
    this.registerConfigIfNotAlreadySet(
      env,
      EnvironmentConfig.DENYLIST_URLS,
      () => process.env.DENYLIST_URLS ?? DEFAULT_DENYLIST_URLS
    )
    this.registerConfigIfNotAlreadySet(
      env,
      EnvironmentConfig.SYNC_IGNORED_ENTITY_TYPES,
      () => process.env.SYNC_IGNORED_ENTITY_TYPES ?? ''
    )
    this.registerConfigIfNotAlreadySet(
      env,
      EnvironmentConfig.FOLDER_MIGRATION_MAX_CONCURRENCY,
      () => process.env.FOLDER_MIGRATION_MAX_CONCURRENCY ?? DEFAULT_FOLDER_MIGRATION_MAX_CONCURRENCY
    )
    this.registerConfigIfNotAlreadySet(
      env,
      EnvironmentConfig.SERVER_PORT,
      () => process.env.CONTENT_SERVER_PORT ?? DEFAULT_SERVER_PORT
    )
    this.registerConfigIfNotAlreadySet(env, EnvironmentConfig.LOG_REQUESTS, () => process.env.LOG_REQUESTS !== 'false')
    this.registerConfigIfNotAlreadySet(
      env,
      EnvironmentConfig.UPDATE_FROM_DAO_INTERVAL,
      () => process.env.UPDATE_FROM_DAO_INTERVAL ?? ms('30m')
    )
    this.registerConfigIfNotAlreadySet(env, EnvironmentConfig.DECENTRALAND_ADDRESS, () => DECENTRALAND_ADDRESS)
    this.registerConfigIfNotAlreadySet(env, EnvironmentConfig.DEPLOYMENTS_DEFAULT_RATE_LIMIT_TTL, () =>
      Math.floor(ms((process.env.DEPLOYMENTS_DEFAULT_RATE_LIMIT_TTL ?? '1m') as string) / 1000)
    )
    this.registerConfigIfNotAlreadySet(
      env,
      EnvironmentConfig.DEPLOYMENTS_DEFAULT_RATE_LIMIT_MAX,
      () => process.env.DEPLOYMENTS_DEFAULT_RATE_LIMIT_MAX ?? 300
    )
    this.registerConfigIfNotAlreadySet(
      env,
      EnvironmentConfig.ETH_NETWORK,
      () => process.env.ETH_NETWORK ?? DEFAULT_ETH_NETWORK
    )
    this.registerConfigIfNotAlreadySet(env, EnvironmentConfig.LOG_LEVEL, () => process.env.LOG_LEVEL ?? 'INFO')
    this.registerConfigIfNotAlreadySet(
      env,
      EnvironmentConfig.FETCH_REQUEST_TIMEOUT,
      () => process.env.FETCH_REQUEST_TIMEOUT ?? '2m'
    )
    this.registerConfigIfNotAlreadySet(
      env,
      EnvironmentConfig.USE_COMPRESSION_MIDDLEWARE,
      () => process.env.USE_COMPRESSION_MIDDLEWARE === 'true'
    )
    this.registerConfigIfNotAlreadySet(
      env,
      EnvironmentConfig.BOOTSTRAP_FROM_SCRATCH,
      () => process.env.BOOTSTRAP_FROM_SCRATCH === 'true'
    )
    this.registerConfigIfNotAlreadySet(env, EnvironmentConfig.REQUEST_TTL_BACKWARDS, () => ms('20m'))
    this.registerConfigIfNotAlreadySet(
      env,
      EnvironmentConfig.ENS_OWNER_PROVIDER_URL,
      () =>
        process.env.ENS_OWNER_PROVIDER_URL ??
        (process.env.ETH_NETWORK === 'mainnet'
          ? DEFAULT_ENS_OWNER_PROVIDER_URL_MAINNET
          : DEFAULT_ENS_OWNER_PROVIDER_URL_TESTNET)
    )
    this.registerConfigIfNotAlreadySet(
      env,
      EnvironmentConfig.LAND_MANAGER_SUBGRAPH_URL,
      () =>
        process.env.LAND_MANAGER_SUBGRAPH_URL ??
        (env.getConfig(EnvironmentConfig.ETH_NETWORK) === 'mainnet'
          ? DEFAULT_LAND_MANAGER_SUBGRAPH_MAINNET
          : DEFAULT_LAND_MANAGER_SUBGRAPH_TESTNET)
    )
    this.registerConfigIfNotAlreadySet(
      env,
      EnvironmentConfig.COLLECTIONS_L1_SUBGRAPH_URL,
      () =>
        process.env.COLLECTIONS_L1_SUBGRAPH_URL ??
        (env.getConfig(EnvironmentConfig.ETH_NETWORK) === 'mainnet'
          ? DEFAULT_COLLECTIONS_SUBGRAPH_MAINNET
          : DEFAULT_COLLECTIONS_SUBGRAPH_TESTNET)
    )

    this.registerConfigIfNotAlreadySet(
      env,
      EnvironmentConfig.COLLECTIONS_L2_SUBGRAPH_URL,
      () =>
        process.env.COLLECTIONS_L2_SUBGRAPH_URL ??
        (process.env.ETH_NETWORK === 'mainnet'
          ? DEFAULT_COLLECTIONS_SUBGRAPH_MATIC_MAINNET
          : DEFAULT_COLLECTIONS_SUBGRAPH_MATIC_MUMBAI)
    )

    this.registerConfigIfNotAlreadySet( env , EnvironmentConfig.COLLECTIONS_L3_SUBGRAPH_URL ,  ()=> DEFAULT_COLLECTIONS_SUBGRAPH_AVALANCHE );
    this.registerConfigIfNotAlreadySet( env , EnvironmentConfig.LAND_MANAGER_L3_SUBGRAPH_URL , ()=> DEFAULT_LAND_MANAGER_SUBGRAPH_AVALANCHE );
    this.registerConfigIfNotAlreadySet( env , EnvironmentConfig.BLOCKS_L3_SUBGRAPH_URL , ()=> DEFAULT_BLOCKS_SUBGRAPH_AVALANCHE );
    

    this.registerConfigIfNotAlreadySet(
      env,
      EnvironmentConfig.THIRD_PARTY_REGISTRY_L2_SUBGRAPH_URL,
      () =>
        process.env.THIRD_PARTY_REGISTRY_L2_SUBGRAPH_URL ??
        (process.env.ETH_NETWORK === 'mainnet'
          ? DEFAULT_THIRD_PARTY_REGISTRY_SUBGRAPH_MATIC_MAINNET
          : DEFAULT_THIRD_PARTY_REGISTRY_SUBGRAPH_MATIC_MUMBAI)
    )

    this.registerConfigIfNotAlreadySet(
      env,
      EnvironmentConfig.BLOCKS_L1_SUBGRAPH_URL,
      () =>
        process.env.BLOCKS_L1_SUBGRAPH_URL ??
        (env.getConfig(EnvironmentConfig.ETH_NETWORK) === 'mainnet'
          ? DEFAULT_BLOCKS_SUBGRAPH_MAINNET
          : DEFAULT_BLOCKS_SUBGRAPH_TESTNET)
    )

    this.registerConfigIfNotAlreadySet(
      env,
      EnvironmentConfig.BLOCKS_L2_SUBGRAPH_URL,
      () =>
        process.env.BLOCKS_L2_SUBGRAPH_URL ??
        (process.env.ETH_NETWORK === 'mainnet'
          ? DEFAULT_BLOCKS_SUBGRAPH_MATIC_MAINNET
          : DEFAULT_BLOCKS_SUBGRAPH_MATIC_MUMBAI)
    )
    this.registerConfigIfNotAlreadySet(
      env,
      EnvironmentConfig.PSQL_PASSWORD,
      () => process.env.POSTGRES_CONTENT_PASSWORD ?? DEFAULT_DATABASE_CONFIG.password
    )
    this.registerConfigIfNotAlreadySet(
      env,
      EnvironmentConfig.PSQL_USER,
      () => process.env.POSTGRES_CONTENT_USER ?? DEFAULT_DATABASE_CONFIG.user
    )
    this.registerConfigIfNotAlreadySet(
      env,
      EnvironmentConfig.PSQL_DATABASE,
      () => process.env.POSTGRES_CONTENT_DB ?? DEFAULT_DATABASE_CONFIG.database
    )
    this.registerConfigIfNotAlreadySet(
      env,
      EnvironmentConfig.PSQL_HOST,
      () => process.env.POSTGRES_HOST ?? DEFAULT_DATABASE_CONFIG.host
    )
    this.registerConfigIfNotAlreadySet(
      env,
      EnvironmentConfig.PSQL_SCHEMA,
      () => process.env.POSTGRES_SCHEMA ?? DEFAULT_DATABASE_CONFIG.schema
    )
    this.registerConfigIfNotAlreadySet(
      env,
      EnvironmentConfig.PSQL_PORT,
      () => process.env.POSTGRES_PORT ?? DEFAULT_DATABASE_CONFIG.port
    )

    this.registerConfigIfNotAlreadySet(
      env,
      EnvironmentConfig.GARBAGE_COLLECTION,
      () => process.env.GARBAGE_COLLECTION === 'true'
    )
    this.registerConfigIfNotAlreadySet(env, EnvironmentConfig.GARBAGE_COLLECTION_INTERVAL, () => ms('6h'))

    this.registerConfigIfNotAlreadySet(env, EnvironmentConfig.PG_IDLE_TIMEOUT, () =>
      process.env.PG_IDLE_TIMEOUT ? ms(process.env.PG_IDLE_TIMEOUT) : ms('30s')
    )
    this.registerConfigIfNotAlreadySet(env, EnvironmentConfig.PG_QUERY_TIMEOUT, () =>
      process.env.PG_QUERY_TIMEOUT ? ms(process.env.PG_QUERY_TIMEOUT) : ms('1m')
    )
    this.registerConfigIfNotAlreadySet(env, EnvironmentConfig.PG_STREAM_QUERY_TIMEOUT, () =>
      process.env.PG_STREAM_QUERY_TIMEOUT ? ms(process.env.PG_STREAM_QUERY_TIMEOUT) : ms('10m')
    )
    this.registerConfigIfNotAlreadySet(
      env,
      EnvironmentConfig.SNAPSHOT_FREQUENCY_IN_MILLISECONDS,
      () => process.env.SNAPSHOT_FREQUENCY_IN_MILLISECONDS ?? ms('6h')
    )
    this.registerConfigIfNotAlreadySet(env, EnvironmentConfig.CUSTOM_DAO, () => process.env.CUSTOM_DAO)

    this.registerConfigIfNotAlreadySet(
      env,
      EnvironmentConfig.DISABLE_SYNCHRONIZATION,
      () => process.env.DISABLE_SYNCHRONIZATION === 'true'
    )
    this.registerConfigIfNotAlreadySet(
      env,
      EnvironmentConfig.SYNC_STREAM_TIMEOUT,
      () => process.env.SYNC_STREAM_TIMEOUT || DEFAULT_SYNC_STREAM_TIMEOUT
    )

    this.registerConfigIfNotAlreadySet(
      env,
      EnvironmentConfig.CONTENT_SERVER_ADDRESS,
      () =>
        process.env.CONTENT_SERVER_ADDRESS ||
        'http://localhost:' + env.getConfig<number>(EnvironmentConfig.SERVER_PORT).toString()
    )

    this.registerConfigIfNotAlreadySet(
      env,
      EnvironmentConfig.ENTITIES_CACHE_SIZE,
      () => process.env.ENTITIES_CACHE_SIZE ?? DEFAULT_ENTITIES_CACHE_SIZE
    )

    /*
     * These are configured as 'DEPLOYMENT_RATE_LIMIT_MAX_{ENTITY_TYPE}=MAX_SIZE'.
     * For example: 'DEPLOYMENT_RATE_LIMIT_MAX_PROFILE=300'
     */
    this.registerConfigIfNotAlreadySet(env, EnvironmentConfig.DEPLOYMENT_RATE_LIMIT_MAX, () => {
      const rateLimitMaxConfig: Map<EntityType, number> = new Map(
        Object.entries(process.env)
          .filter(([name, value]) => name.startsWith('DEPLOYMENT_RATE_LIMIT_MAX_') && !!value)
          .map(([name, value]) => [
            parseEntityType(name.replace('DEPLOYMENT_RATE_LIMIT_MAX_', '')) as EntityType,
            value as any as number
          ])
      )
      return rateLimitMaxConfig ?? new Map()
    })
    /*
     * These are configured as 'DEPLOYMENT_RATE_LIMIT_TTL_{ENTITY_TYPE}=MAX_SIZE'.
     * For example: 'DEPLOYMENT_RATE_LIMIT_TTL_PROFILE=1m'
     */
    this.registerConfigIfNotAlreadySet(env, EnvironmentConfig.DEPLOYMENT_RATE_LIMIT_TTL, () => {
      const rateLimitTtlConfig: Map<EntityType, number> = new Map(
        Object.entries(process.env)
          .filter(([name, value]) => name.startsWith('DEPLOYMENT_RATE_LIMIT_TTL_') && !!value)
          .map(([name, value]) => [
            parseEntityType(name.replace('DEPLOYMENT_RATE_LIMIT_TTL_', '')) as EntityType,
            ms(value ?? '1m')
          ])
      )
      return rateLimitTtlConfig ?? new Map()
    })

    this.registerConfigIfNotAlreadySet(env, EnvironmentConfig.VALIDATE_API, () => process.env.VALIDATE_API == 'true')

    this.registerConfigIfNotAlreadySet(
      env,
      EnvironmentConfig.RETRY_FAILED_DEPLOYMENTS_DELAY_TIME,
      () => process.env.RETRY_FAILED_DEPLOYMENTS_DELAY_TIME ?? ms('15m')
    )

    this.registerConfigIfNotAlreadySet(env, EnvironmentConfig.READ_ONLY, () => process.env.READ_ONLY == 'true')

    this.registerConfigIfNotAlreadySet(
      env,
      EnvironmentConfig.IGNORE_BLOCKCHAIN_ACCESS_CHECKS,
      () => process.env.IGNORE_BLOCKCHAIN_ACCESS_CHECKS
    )

    return env
  }

  private registerConfigIfNotAlreadySet(env: Environment, key: EnvironmentConfig, valueProvider: () => any): void {
    env.setConfig(key, this.baseEnv.getConfig(key) ?? valueProvider())
  }
}
