/**
 *
 */
export class SelfTestServiceModule {
    state: {
        clients: {};
        errorDetected: boolean;
        consoleErrorDetected: boolean;
        micErrorDetected: boolean;
    };
    notifyUpdate: () => void;
    testMode: boolean;
    updateAllFromPresence(): void;
    getRndInteger(min: any, max: any): any;
    notifySceneEntered(): void;
    createClient(id: any): void;
    onUpdate(callback: any): void;
    isTestMode(): boolean;
    startSelfTest(): void;
    startMicTest(): void;
    micTestInProgress: boolean;
    stopMicTest(): void;
    tick(): void;
}
export const selfTestService: SelfTestServiceModule;
