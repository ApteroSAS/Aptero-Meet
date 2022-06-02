export class NetworkService {
    eventEmitter: EventEmitter<string | symbol, any>;
    start(): void;
    setPhoenixChannel(hubPhxChannel: any): void;
    hubPhxChannel: any;
    sendMessage(type: any, data: any): void;
    onMessage(type: any, callback: any): () => void;
    /**
     * Network utils
     */
    getClientId(): any;
    getElementNetworkId(element: any): Promise<any>;
    notifyAdapterReady(): void;
}
export const networkService: NetworkService;
import EventEmitter = require("eventemitter3");
