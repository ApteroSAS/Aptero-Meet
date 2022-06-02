export class SearchService {
    resultAwaited: boolean;
    lastAction: () => void;
    cancelSearchWithResult(wait?: number): Promise<void>;
    sourceNavigateWithResult(source: any): Promise<any>;
}
export const searchService: SearchService;
