import { ServerAddress } from "@katalyst/content/service/synchronization/clients/contentserver/ContentServerClient";
import { DAOClient } from "decentraland-katalyst-commons/DAOClient";
import { ServerMetadata } from "decentraland-katalyst-commons/ServerMetadata";
import { EthAddress } from 'dcl-crypto';
import { DEFAULT_ETH_NETWORK } from "@katalyst/content/Environment";

export class MockedDAOClient extends DAOClient {

    private readonly servers: Map<string, ServerMetadata>

    private constructor(servers: {address: ServerAddress, owner: EthAddress}[]) {
        super(DEFAULT_ETH_NETWORK)
        this.servers = new Map(servers.map(server => [server.address, {...server, id: "Id"}]))
    }

    async getAllContentServers(): Promise<Set<ServerMetadata>> {
        return new Set(this.servers.values())
    }

    remove(address: ServerAddress) {
        this.servers.delete(address)
    }

    static withAddresses(...addresses: ServerAddress[]): MockedDAOClient {
        return new MockedDAOClient(addresses.map(address => ({ address, owner: "0x..."})))
    }
    static with(address: ServerAddress, owner: EthAddress): MockedDAOClient {
        return new MockedDAOClient([{ address, owner }])
    }

}