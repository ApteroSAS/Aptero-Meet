import * as React from "react";
import { Avatar, Flex, Segment, Text } from "@fluentui/react-northstar";
import { getCredential } from "@aptero/axolotis-module-teams/modules/microsoft/service/TeamsLoginService";
import { useEffect, useState } from "react";

export function LightProfileCard() {
  const [userProfile, setUserProfile] = useState(null);
  useEffect(() => {
    getCredential()
      .getUserInfo()
      .then((value) => {
        setUserProfile(value);
      });
  });
  const userName = userProfile ? userProfile.data?.displayName : "Guest";
  //const preferedUserName = userProfile ? userProfile.data?.preferredUserName : "";
  return (
    <Segment style={{ padding: "3px 10px 3px 10px", width: "fit-content" }}>
      <Flex gap="gap.small">
        <Avatar
          name={userName}
          label={{
            variables: {
              backgroundColor: "pink",
            },
          }}
        />
        <Text
          content={userName}
          weight="bold"
          style={{ textAlign: "center", justifyContent: "center", height: "100%", marginTop: "auto", marginBottom: "auto" }}
        />
      </Flex>
    </Segment>
  );
}
