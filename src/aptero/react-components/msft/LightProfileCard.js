import { Avatar, Flex, Segment, Text } from "@fluentui/react-northstar";
import React from "react";
import { getCredential } from "../../service/MicrosoftIntegration/Auth";
import { useData } from "../../service/MicrosoftIntegration/lib/useData";

export function LightProfileCard() {
  const userProfile = useData(async () => {
    return await getCredential().getUserInfo();
  });
  const userName = userProfile ? userProfile.data?.displayName : "Guest";
  //const preferedUserName = userProfile ? userProfile.data?.preferredUserName : "";
  return (
    <Segment style={{padding:"3px 10px 3px 10px",width:"fit-content"}}>
      <Flex gap="gap.small"  >
        <Avatar
          name={userName}
          label={{
            variables: {
              backgroundColor: 'pink',
            },
          }}
        />
        <Text content={userName} weight="bold" style={{textAlign: 'center',justifyContent: 'center',height: '100%',marginTop:"auto",marginBottom:"auto"}}/>
      </Flex>
      </Segment>
  );
}
