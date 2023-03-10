import { Lifecycle } from '@well-known-components/interfaces'
import { EnvironmentConfig } from './Environment'
import { startSynchronization } from './logic/synchronization'
import { migrateContentFolderStructure } from './migrations/ContentFolderMigrationManager'
import { AppComponents } from './types'

// this function wires the business logic (adapters & controllers) with the components (ports)
export async function main(program: Lifecycle.EntryPointParameters<AppComponents>): Promise<void> {
  const { components, startComponents } = program

  await migrateContentFolderStructure(components)

  // first of all, run the migrations
  await components.migrationManager.run()

  // TODO: move this purgeUploadsDirectory method to a standalone function inside src/logic/ folder
  await components.server.purgeUploadsDirectory()

  // start ports: db, listeners, synchronizations, etc
  await startComponents()

  // synchronization
  const disableSynchronization = components.env.getConfig(EnvironmentConfig.DISABLE_SYNCHRONIZATION)

  if (!disableSynchronization) {
    await startSynchronization(components)
  } else {
    console.log("JDEBUG", "Sync disabled");
    components.metrics.observe('dcl_content_server_sync_state', {}, 1)

    // JDEBUG added:
    components.synchronizationState.toSyncing()
  }
}
