import * as React from "react";
/**
 * The 'Config' component is used to display your group tabs
 * user configuration options.  Here you will allow the user to
 * make their choices and once they are done you will need to validate
 * their choices and communicate that to Teams to enable the save button.
 */
export declare class TabConfig extends React.Component {
    state: {
        url: string;
        size: {
            width: string;
            height: string;
        };
        initialized: any;
        suggestedDisplayName: string;
    };
    removeListeners: () => void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): JSX.Element;
}
