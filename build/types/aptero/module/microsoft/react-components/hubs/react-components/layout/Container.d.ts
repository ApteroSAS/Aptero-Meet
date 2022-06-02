/// <reference types="react" />
import PropTypes from "prop-types";
export declare function Container({ as: Component, children, className, ...rest }: {
    [x: string]: any;
    as: any;
    children: any;
    className: any;
}): JSX.Element;
export declare namespace Container {
    var defaultProps: {
        as: string;
    };
    var propTypes: {
        as: PropTypes.Requireable<PropTypes.ReactComponentLike>;
        children: PropTypes.Requireable<PropTypes.ReactNodeLike>;
        className: PropTypes.Requireable<string>;
    };
}
