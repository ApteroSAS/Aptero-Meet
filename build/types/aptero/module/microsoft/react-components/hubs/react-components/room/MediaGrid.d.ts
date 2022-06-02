/// <reference types="react" />
import PropTypes from "prop-types";
export declare function MediaGrid({ children, className, center, isVariableWidth, sm, ...rest }: {
    [x: string]: any;
    children: any;
    className: any;
    center: any;
    isVariableWidth: any;
    sm: any;
}): JSX.Element;
export declare namespace MediaGrid {
    var propTypes: {
        center: PropTypes.Requireable<boolean>;
        isVariableWidth: PropTypes.Requireable<boolean>;
        sm: PropTypes.Requireable<boolean>;
        className: PropTypes.Requireable<string>;
        children: PropTypes.Requireable<PropTypes.ReactNodeLike>;
    };
}
