import { ServerName } from "../naming/NameKeeper";
import { ContentServerClient } from "./clients/contentserver/ContentServerClient";
import { Timestamp } from "../Service";
import { DeploymentHistory } from "../history/HistoryManager";
import { EventDeployer } from "./EventDeployer";

/**
 * On some occasions (such as server onboarding) a server might need to make a request to many other servers on the cluster.
 */
export class MultiServerHistoryRequest {

    private readonly request: Request

    constructor(private readonly recipients: ContentServerClient[],
                private readonly deployer: EventDeployer,
                from: Timestamp,
                serverName?: ServerName,
                to?: Timestamp) {
        this.request = { from, serverName, to }
    }

    /** Execute the request */
    async execute(): Promise<void> {
        const histories: DeploymentHistory[] = await Promise.all(this.recipients
            .map(recipient => this.executeRequestOn(recipient)))

        try {
            await this.deployer.deployHistories(histories)
        } catch (error) {
            console.error(`Failed to deploy histories. Reason:\n${error}`)
        }
    }

    /** Execute the request on one server */
    private async executeRequestOn(server: ContentServerClient): Promise<DeploymentHistory> {
        try {
            return await server.getHistory(this.request.from, this.request.serverName, this.request.to)
        } catch (error) {
            console.error(`Failed to execute multi server request on ${server.getName()}. Reason:\n${error}`)
            return []
        }
    }
}

type Request = {
    from: Timestamp,
    serverName?: ServerName,
    to?: Timestamp,
}
