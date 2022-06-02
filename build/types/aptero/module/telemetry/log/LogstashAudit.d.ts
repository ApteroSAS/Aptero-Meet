export class LogstashAudit {
    constructor(tracking_url: any, origine_url: any);
    uuidv4(): string;
    /** A generated random id for each application-start. */
    sessionId: string;
    /** Timestamp of the session-start. */
    sessionStart: number;
    _userId: string;
    tracking_url: any;
    origine_url: any;
    setUserId(uid: any): void;
    /**
     * Tracks an event.
     * @param event the info of the event. (e.g. "Application Start" or "Click Button Create Project")
     * @param value optional additional information (e.g. the msec it took to start the app)
     */
    track(event: any, data: any): Promise<any>;
}
