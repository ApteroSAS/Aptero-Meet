/** Send Console API calls as Sentry Events */
export class CaptureConsoleSentry {
    /**
     * @inheritDoc
     */
    static id: string;
    /**
     * @inheritDoc
     */
    constructor(options?: {});
    /**
     * @inheritDoc
     */
    name: string;
    /**
     * @inheritDoc
     */
    _levels: readonly ["debug", "info", "warn", "error", "log", "assert"];
    /**
     * @inheritDoc
     */
    setupOnce(_: any, getCurrentHub: any): void;
}
