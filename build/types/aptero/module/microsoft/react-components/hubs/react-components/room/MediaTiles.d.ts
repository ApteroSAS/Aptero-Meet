/// <reference types="react" />
import PropTypes from "prop-types";
export declare function CreateTile({ label, type, ...rest }: {
    [x: string]: any;
    label: any;
    type: any;
}): JSX.Element;
export declare namespace CreateTile {
    var propTypes: {
        label: PropTypes.Requireable<PropTypes.ReactNodeLike>;
        type: PropTypes.Requireable<string>;
    };
}
export declare function MediaTile({ entry, processThumbnailUrl, onClick, onEdit, onShowSimilar, onCopy, onInfo, ...rest }: {
    [x: string]: any;
    entry: any;
    processThumbnailUrl: any;
    onClick: any;
    onEdit: any;
    onShowSimilar: any;
    onCopy: any;
    onInfo: any;
}): JSX.Element;
export declare namespace MediaTile {
    var propTypes: {
        entry: PropTypes.Validator<object>;
        processThumbnailUrl: PropTypes.Requireable<(...args: any[]) => any>;
        onClick: PropTypes.Requireable<(...args: any[]) => any>;
        onEdit: PropTypes.Requireable<(...args: any[]) => any>;
        onShowSimilar: PropTypes.Requireable<(...args: any[]) => any>;
        onCopy: PropTypes.Requireable<(...args: any[]) => any>;
        onInfo: PropTypes.Requireable<(...args: any[]) => any>;
    };
}
