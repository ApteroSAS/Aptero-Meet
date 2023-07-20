import React from "react";
import {Identity} from "../components/Identity";
import {RoomEditor} from "../components/RoomEditor";
import {WelcomePage} from "../components/WelcomePage";
import {Button, Flex, Segment} from "@fluentui/react-northstar";
import {useContext, useDeviceType} from "../components/useContext";
import {OpenAppMenu} from "../components/OpenAppMenu";
import {FAQ} from "../components/FAQ";

export const AdminPanel: React.FC<any> = (props) => {
    const [tab, setTab] = React.useState("welcome");

    return (
        <>
            <Flex gap="gap.medium" style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                padding: "3px 10px 3px 10px",
            }}>
                <Button
                    primary
                    content="Welcome"
                    disabled={tab === "welcome"}
                    onClick={async () => {
                        setTab("welcome");
                    }}
                    style={{height: "auto", flex: '1 1 auto'}}
                />
                <Button
                    primary
                    content="Editor"
                    disabled={tab === "editor"}
                    onClick={async () => {
                        setTab("editor");
                    }}
                    style={{height: "auto", flex: '1 1 auto'}}
                />
                <OpenAppMenu style={{height: "auto", flex: '1 1 auto'}}/>
                <Button
                    primary
                    content="How To"
                    disabled={tab === "faq"}
                    onClick={async () => {
                        setTab("faq");
                    }}
                    style={{height: "auto", flex: '1 1 auto'}}
                />
                <Identity/>
            </Flex>
            {tab === "welcome" && <WelcomePage startEditor={() => {
                setTab("editor");
            }}/>}
            {tab === "editor" && <RoomEditor/>}
            {tab === "faq" && <FAQ/>}
        </>
    );
}
