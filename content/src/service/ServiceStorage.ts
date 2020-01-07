import { EntityId, Entity } from "./Entity"
import { ContentStorage } from "../storage/ContentStorage"
import { EntityFactory } from "./EntityFactory"
import { ContentFileHash } from "./Hashing"

export class ServiceStorage {

    private static CONTENT_CATEGORY = "contents"

    constructor(private storage: ContentStorage) { }

    storeContent(fileHash: ContentFileHash, content: Buffer): Promise<void> {
        return this.storage.store(ServiceStorage.CONTENT_CATEGORY, fileHash, content)
    }

    async getContent(fileHash: ContentFileHash): Promise<Buffer | undefined> {
        try {
            return await this.storage.getContent(ServiceStorage.CONTENT_CATEGORY, fileHash)
        } catch (error) {
            return Promise.resolve(undefined)
        }
    }

    async isContentAvailable(fileHashes: ContentFileHash[]): Promise<Map<ContentFileHash, boolean>> {
        // TODO: Consider listing everything in dir
        const contentsAvailableActions: Promise<[ContentFileHash, boolean]>[] = fileHashes.map((fileHash: ContentFileHash) =>
            this.storage.exists(ServiceStorage.CONTENT_CATEGORY, fileHash).then(exists => [fileHash, exists]))

        return new Map(await Promise.all(contentsAvailableActions));
    }

    async getEntityById(id: EntityId): Promise<Entity | undefined> {
        try {
            const buffer = await this.storage.getContent(ServiceStorage.CONTENT_CATEGORY, id)
            return EntityFactory.fromBufferWithId(buffer, id)
        } catch (error) {
            return undefined
        }
    }
}