export class LoggerClass {
    additionalData: {};
    logstashAudit: any;
    properties: any;
    setProperties(data: any): void;
    start(): void;
    attachUnhandledRejection(): void;
    setAdditionalData(key: any, data: any): void;
    setUserId(uid: any): void;
    track(event: any, data: any): void;
    activated(): boolean;
    deactivated(): boolean;
    replaceErrors: (key: any, value: any) => any;
    report(event: any, ...data: any[]): void;
    reportError(...data: any[]): void;
    error(...data: any[]): void;
    warn(...data: any[]): void;
    log(...data: any[]): void;
}
