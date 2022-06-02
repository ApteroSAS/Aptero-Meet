export const minimumQualityService: MinimumQualityService;
declare class MinimumQualityService {
    globalIssueDetected: {
        "fps-issue": boolean;
        "turn-udp-issue": boolean;
        "turn-tcp-issue": boolean;
        "mic-activity-issue": boolean;
        "has-reloaded-issue": boolean;
    };
    fpsBalancer: FpsBalancer;
    tick(): void;
    initialCheckFinished(): void;
    getCheckStatus(): {
        "fps-issue": boolean;
        "turn-udp-issue": boolean;
        "turn-tcp-issue": boolean;
        "mic-activity-issue": boolean;
        "has-reloaded-issue": boolean;
    };
    getErrorDetected(): boolean;
    checkTurnServerAndSwitchToTCP(iceServer: any): Promise<void>;
    checkTurnServer(iceServers: any, timeout: any): Promise<any>;
    MIN_VOLUME_THRESHOLD: number;
    notifyMicLevel(micLevel: any): void;
    notifyMicChanged(): void;
    startFPSTest(): void;
    stopFPSTest(): void;
}
declare class FpsBalancer {
    lastCalledTime: number;
    fps: number;
    fpsNumber: number;
    average: number;
    lastTestStart: number;
    minimumResolution: number;
    computeMinResolution(): {
        w: number;
        h: number;
    };
    startFPSTest(): void;
    fpsTestLoop: boolean;
    stopFPSTest(): {
        fps: number;
        fpsNumber: number;
        average: number;
    };
    tick(): void;
    startBalancing(): void;
    balancing: boolean;
    changeResolution(ratio: any): void;
}
export {};
