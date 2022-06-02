export class MediaLimiter {
    removeOrder: any[];
    limit: number;
    pushMedia(el: any): void;
    setLimit(limite: any): void;
    process(jsondata: any): void;
}
export const mediaLimiter: MediaLimiter;
