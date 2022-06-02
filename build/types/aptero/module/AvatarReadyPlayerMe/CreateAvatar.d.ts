export default class CreateAvatar extends React.Component<any, any, any> {
    static propTypes: {
        onAvatar: PropTypes.Requireable<(...args: any[]) => any>;
    };
    constructor(props: any);
    constructor(props: any, context: any);
    state: {
        done: boolean;
    };
    listener: (event: any) => void;
    componentDidMount: () => Promise<void>;
    componentWillUnmount(): void;
    render(): JSX.Element;
}
import React from "react";
import PropTypes from "prop-types";
