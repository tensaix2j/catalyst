import { WearableId } from '@katalyst/lambdas/apis/collections/controllers/collections'
import { fetchProfiles, ProfileMetadata } from '@katalyst/lambdas/apis/profiles/controllers/profiles'
import { EnsOwnership } from '@katalyst/lambdas/apis/profiles/EnsOwnership'
import { WearablesOwnership } from '@katalyst/lambdas/apis/profiles/WearablesOwnership'
import { SmartContentClient } from '@katalyst/lambdas/utils/SmartContentClient'
import { Entity, EntityType } from 'dcl-catalyst-commons'
import { EthAddress } from 'dcl-crypto'
import { anything, instance, mock, when } from 'ts-mockito'

const EXTERNAL_URL = 'https://content-url.com'

describe('profiles', () => {
  const SOME_ADDRESS = '0x079bed9c31cb772c4c156f86e1cff15bf751add0'
  const SOME_NAME = 'NFTName'
  const WEARABLE_ID_1 = 'someCollection-someWearable'

  it(`When profiles are fetched and NFTs are owned, then the returned profile is the same as the content server`, async () => {
    const { entity, metadata } = profileWith(SOME_ADDRESS, { name: SOME_NAME, wearables: [WEARABLE_ID_1] })
    const client = contentServerThatReturns(entity)
    const ensOwnership = ownedNames(SOME_ADDRESS, SOME_NAME)
    const wearablesOwnership = ownedWearables(SOME_ADDRESS, WEARABLE_ID_1)

    const profiles = await fetchProfiles([SOME_ADDRESS], client, ensOwnership, wearablesOwnership)

    expect(profiles.length).toEqual(1)
    expect(profiles[0]).toEqual(metadata)
  })

  it(`When the current name is not owned, then it says so in the profile`, async () => {
    const { entity } = profileWith(SOME_ADDRESS, { name: SOME_NAME })
    const client = contentServerThatReturns(entity)
    const ensOwnership = noNames()
    const wearablesOwnership = noWearables()

    const profiles = await fetchProfiles([SOME_ADDRESS], client, ensOwnership, wearablesOwnership)

    expect(profiles.length).toEqual(1)
    expect(profiles[0].avatars[0].name).toEqual(SOME_NAME)
    expect(profiles[0].avatars[0].hasClaimedName).toEqual(false)
  })

  it(`When some of the worn wearables are not owned, then they are filtered out`, async () => {
    const { entity } = profileWith(SOME_ADDRESS, { wearables: [WEARABLE_ID_1] })
    const client = contentServerThatReturns(entity)
    const ensOwnership = noNames()
    const wearablesOwnership = noWearables()

    const profiles = await fetchProfiles([SOME_ADDRESS], client, ensOwnership, wearablesOwnership)

    expect(profiles.length).toEqual(1)
    expect(profiles[0].avatars[0].avatar.wearables.length).toEqual(0)
  })

  it(`When some of the worn wearables are not owned but sanitization is off, then they are not filtered out`, async () => {
    const { entity } = profileWith(SOME_ADDRESS, { wearables: [WEARABLE_ID_1] })
    const client = contentServerThatReturns(entity)
    const ensOwnership = noNames()
    const wearablesOwnership = noWearables()

    const profiles = await fetchProfiles([SOME_ADDRESS], client, ensOwnership, wearablesOwnership, false)

    expect(profiles.length).toEqual(1)
    expect(profiles[0].avatars[0].avatar.wearables).toEqual([WEARABLE_ID_1])
  })

  it(`When the is no profile with that address, then an empty list is returned`, async () => {
    const client = contentServerThatReturns()
    const ensOwnership = noNames()
    const wearablesOwnership = noWearables()

    const profiles = await fetchProfiles([SOME_ADDRESS], client, ensOwnership, wearablesOwnership)

    expect(profiles.length).toEqual(0)
  })

  it(`When profiles are returned, external urls are added to snapshots`, async () => {
    const { entity } = profileWith(SOME_ADDRESS, { snapshots: { aKey: 'aHash' } })
    const client = contentServerThatReturns(entity)
    const ensOwnership = noNames()
    const wearablesOwnership = noWearables()

    const profiles = await fetchProfiles([SOME_ADDRESS], client, ensOwnership, wearablesOwnership)

    expect(profiles.length).toEqual(1)
    expect(profiles[0].avatars[0].avatar.snapshots.aKey).toEqual(`${EXTERNAL_URL}/contents/aHash`)
  })
})

function profileWith(
  ethAddress: EthAddress,
  options: { name?: string; wearables?: string[]; snapshots?: Record<string, string> }
): { entity: Entity; metadata: ProfileMetadata } {
  const metadata = {
    avatars: [
      {
        name: options.name ?? '',
        description: 'description',
        hasClaimedName: true,
        avatar: {
          bodyShape: {},
          eyes: {},
          hair: {},
          skin: {},
          version: 10,
          snapshots: options.snapshots ?? {},
          wearables: options.wearables ?? []
        }
      }
    ]
  }

  const entity = {
    id: '',
    type: EntityType.PROFILE,
    pointers: [ethAddress],
    timestamp: 10,
    metadata: metadata
  }

  return { entity, metadata }
}

function contentServerThatReturns(profile?: Entity): SmartContentClient {
  const mockedClient = mock(SmartContentClient)
  when(mockedClient.fetchEntitiesByPointers(anything(), anything())).thenResolve(profile ? [profile] : [])
  when(mockedClient.getExternalContentServerUrl()).thenReturn(EXTERNAL_URL)
  return instance(mockedClient)
}

function noNames(): EnsOwnership {
  const mockedEnsOwnership = mock(EnsOwnership)
  when(mockedEnsOwnership.areNamesOwned(anything())).thenCall((names: Map<EthAddress, string[]>) => {
    const entries = Array.from(names.entries()).map<[EthAddress, Map<string, boolean>]>(([address, names]) => [
      address,
      new Map(names.map((name) => [name, false]))
    ])
    return Promise.resolve(new Map(entries))
  })
  return instance(mockedEnsOwnership)
}

function ownedNames(ethAddress: EthAddress, ...owned: string[]): EnsOwnership {
  const mockedEnsOwnership = mock(EnsOwnership)
  when(mockedEnsOwnership.areNamesOwned(anything())).thenCall((names: Map<EthAddress, string[]>) => {
    const entries = Array.from(names.entries()).map<[EthAddress, Map<string, boolean>]>(([address, names]) => [
      address,
      new Map(names.map((name) => [name, address === ethAddress && owned.includes(name)]))
    ])
    return Promise.resolve(new Map(entries))
  })
  return instance(mockedEnsOwnership)
}

function ownedWearables(ethAddress: EthAddress, ...wearables: WearableId[]): WearablesOwnership {
  const mockedWearablesOwnership = mock(WearablesOwnership)
  const result = new Map([[ethAddress, { wearables: new Set(wearables), updatedMillisAgo: 0 }]])
  when(mockedWearablesOwnership.getWearablesOwnedByAddresses(anything())).thenResolve(result)
  return instance(mockedWearablesOwnership)
}

function noWearables(): WearablesOwnership {
  const mockedWearablesOwnership = mock(WearablesOwnership)
  when(mockedWearablesOwnership.getWearablesOwnedByAddresses(anything())).thenCall((addresses) =>
    Promise.resolve(new Map(addresses.map((address) => [address, { wearables: new Set() }])))
  )
  return instance(mockedWearablesOwnership)
}