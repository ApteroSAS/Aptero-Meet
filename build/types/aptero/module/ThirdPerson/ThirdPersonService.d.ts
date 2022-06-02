export class ThirdPersonService {
    start(): Promise<void>;
    storeUpdated: () => void;
    stop(): Promise<void>;
}
