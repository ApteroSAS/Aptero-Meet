import React from "react";
import PropTypes from "prop-types";
export declare const AuthContext: React.Context<any>;
export declare function StorybookAuthContextProvider({ children }: {
    children: any;
}): JSX.Element;
export declare namespace StorybookAuthContextProvider {
    var propTypes: {
        children: PropTypes.Requireable<PropTypes.ReactNodeLike>;
        store: PropTypes.Validator<object>;
    };
}
export declare function AuthContextProvider({ children, store }: {
    children: any;
    store: any;
}): JSX.Element;
export declare namespace AuthContextProvider {
    var propTypes: {
        children: PropTypes.Requireable<PropTypes.ReactNodeLike>;
        store: PropTypes.Validator<object>;
    };
}
