import {Button, Segment, Text} from "@fluentui/react-northstar";
import React from "react";
import YouTube from "react-youtube";
import ResponsiveYouTube from "./ResponsiveYoutube";

export function FAQ() {
    return (
        <Segment style={{padding: "3px 10px 3px 10px", width:"100%", height:"100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
            <Text content="Looking for help? Check our frequently asked questions or watch the guide video below." style={{ margin: "20px 0" }} />
            <Button
                primary
                content="Open FAQ"
                onClick={()=>{window.open("https://www.aptero.co/fr/help.html")}}
                style={{ marginBottom: "20px" }}
            />
            <ResponsiveYouTube videoId={"0o4CC4k6dZQ"}/>
        </Segment>
    );
}
