import * as React from "react";
import { Avatar } from "@fluentui/react-northstar";
import { useEffect, useState } from "react";
import { msTeamsAPI } from "../../../axolotis/modules/basic/ImportHelper";

export function UserAvatar() {
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        if (!userProfile) {
            (async () => {
                let value = await (await msTeamsAPI()).getLoginService().getTeamsLoginService().getUserInfo();
                setUserProfile(value);
            })()
        }
    }, [userProfile]);

    const userName = userProfile ? userProfile.displayName : "Guest";

    return (
        <Avatar
            name={userName}
            label={{
                variables: {
                    backgroundColor: "pink",
                },
            }}
            size="small"
        />
    );
}
