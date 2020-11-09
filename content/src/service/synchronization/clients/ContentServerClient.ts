import log4js from 'log4js'
import { Readable } from 'stream'
import { Timestamp, ContentFileHash, ServerAddress, Fetcher, DeploymentWithAuditInfo } from "dcl-catalyst-commons";
import { ContentClient, DeploymentFields } from "dcl-catalyst-client";
import { passThrough } from '../streaming/StreamHelper';
import { ContentFile } from '../../../controller/Controller';

export class ContentServerClient {

    private static readonly LOGGER = log4js.getLogger('ContentServerClient');
    private readonly client: ContentClient
    private connectionState: ConnectionState = ConnectionState.NEVER_REACHED
    private potentialLocalDeploymentTimestamp: Timestamp | undefined

    constructor(private readonly address: ServerAddress,
        private lastLocalDeploymentTimestamp: Timestamp,
        fetcher: Fetcher) {
            this.client = new ContentClient(address, '', fetcher)
        }

    /**
     * After entities have been deployed (or set as failed deployments), we can finally update the last deployment timestamp.
     */
    allDeploymentsWereSuccessful(): Timestamp {
        return this.lastLocalDeploymentTimestamp = Math.max(this.lastLocalDeploymentTimestamp, this.potentialLocalDeploymentTimestamp ?? 0);
    }

    /** Return all new deployments, and store the local timestamp of the newest one. */
    getNewDeployments(): Readable {
        let error = false

        // Fetch the deployments
        const stream = this.client.streamAllDeployments(
            { fromLocalTimestamp: this.lastLocalDeploymentTimestamp + 1 },
            DeploymentFields.AUDIT_INFO,
            (errorMessage) => {
                error = true
                ContentServerClient.LOGGER.error(`Failed to get new entities from content server '${this.getAddress()}'\n${errorMessage}`)
            })

        // Listen to all deployments passing through, and store the newest one's timestamps
        const passTrough = passThrough((deployment: DeploymentWithAuditInfo) => this.potentialLocalDeploymentTimestamp = Math.max(this.potentialLocalDeploymentTimestamp ?? 0, deployment.auditInfo.localTimestamp))

        // Wait for stream to end to update connection state
        stream.once('end', () => {
            if (!error) {
                // Update connection state
                if (this.connectionState !== ConnectionState.CONNECTED) {
                    ContentServerClient.LOGGER.info(`Could connect to '${this.address}'`)
                }
                this.connectionState = ConnectionState.CONNECTED
            } else {
                // Update connection state
                if (this.connectionState === ConnectionState.CONNECTED) {
                    this.connectionState = ConnectionState.CONNECTION_LOST
                }
                this.potentialLocalDeploymentTimestamp = undefined
            }
        })

        return stream.pipe(passTrough)
    }

    async getContentFile(fileHash: ContentFileHash): Promise<ContentFile> {
        const content = await this.client.downloadContent(fileHash, { attempts: 3, waitTime: '0.5s' })
        return { name: fileHash, content }
    }

    getAddress(): ServerAddress {
        return this.address
    }

    getConnectionState(): ConnectionState {
        return this.connectionState;
    }

    getLastLocalDeploymentTimestamp() {
        return this.lastLocalDeploymentTimestamp
    }
}

export enum ConnectionState {
    CONNECTED = "Connected",
    CONNECTION_LOST = "Connection lost",
    NEVER_REACHED = "Could never be reached",
}