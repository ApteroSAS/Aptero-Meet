export function StorybookAuthContextProvider({ children }: {
    children: any;
}): JSX.Element;
export namespace StorybookAuthContextProvider {
    namespace propTypes {
        const children: PropTypes.Requireable<PropTypes.ReactNodeLike>;
        const store: PropTypes.Validator<object>;
    }
}
export function AuthContextProvider({ children, store }: {
    children: any;
    store: any;
}): JSX.Element;
export namespace AuthContextProvider {
    export namespace propTypes_1 {
        const children_1: PropTypes.Requireable<PropTypes.ReactNodeLike>;
        export { children_1 as children };
        const store_1: PropTypes.Validator<object>;
        export { store_1 as store };
    }
    export { propTypes_1 as propTypes };
}
export const AuthContext: React.Context<any>;
import PropTypes from "prop-types";
import React from "react";
