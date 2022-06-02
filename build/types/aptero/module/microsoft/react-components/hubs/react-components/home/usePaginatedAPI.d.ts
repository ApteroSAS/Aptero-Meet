export declare function usePaginatedAPI(apiCallback: any): {
    loadMore: () => void;
    isLoading: boolean;
    hasMore: boolean;
    results: any[];
    suggestions: any[];
    error: any;
    cursor: number;
    nextCursor: any;
};
