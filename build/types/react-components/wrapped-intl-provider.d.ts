export class WrappedIntlProvider extends React.Component<any, any, any> {
    static propTypes: {
        children: PropTypes.Validator<PropTypes.ReactNodeLike>;
    };
    constructor(props: any);
    constructor(props: any, context: any);
    state: {
        locale: string;
        messages: any;
    };
    updateLocale: () => void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): JSX.Element;
}
import React from "react";
import PropTypes from "prop-types";
