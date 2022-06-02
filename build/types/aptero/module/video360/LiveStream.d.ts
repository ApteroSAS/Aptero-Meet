export class LiveStreamService {
    start(): Promise<void>;
    secureUrl(url: any, data: any): Promise<any>;
    listStream(is360: any): Promise<any>;
    createStream(is360: any): Promise<any>;
    removeStream(): void;
}
export const liveStream: LiveStreamService;
