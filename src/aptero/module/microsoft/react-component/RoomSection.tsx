import * as React from "react";
import { useCallback, useContext, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

import {
  connectToReticulum,
  createAndRedirectToNewHub,
  fetchReticulumAuthenticated,
  getReticulumFetchUrl, isLocalClient
} from "../../../../utils/phoenix-utils";
import { MediaGrid } from "../../../../react-components/room/MediaGrid";
import { MediaTile } from "../../../../react-components/room/MediaTiles";
import { PageContainer } from "../../../../react-components/layout/PageContainer";
import { scaledThumbnailUrlFor } from "../../../../utils/media-url-utils";
import { Column } from "../../../../react-components/layout/Column";
import { Container } from "../../../../react-components/layout/Container";
import { changeUrlSettings } from "../service/MsTeams";
import { AuthContext } from "../../../../react-components/auth/AuthContext";
import { usePaginatedAPI } from "../../../../react-components/home/usePaginatedAPI";
import { generateHubName } from "../../../../utils/name-generation";
import Store from "../../../../storage/store";
import Cookies from "js-cookie";
import { createHubChannelParams } from "../../../../utils/hub-utils";
import { propertiesService } from "../../properties/propertiesService";
import { Button, Input } from "@fluentui/react-northstar";//https://fluentsite.z22.web.core.windows.net/0.60.1

declare const window;

export function useSpokeProject() {
  const auth = useContext(AuthContext); // Re-render when you log in/out.
  const getMoreRooms = useCallback(
    cursor => {
      if (auth.userId) {
        //https://alphahub.aptero.co/api/v1/media/search?filter=my-scenes&source=scenes&user=640407050966269961
        return fetchReticulumAuthenticated(
          `/api/v1/media/search?filter=my-scenes&source=scenes&user=${auth.userId}&cursor=${cursor}`
        );
      } else {
        return Promise.reject(new Error("Not signed in"));
      }
    },
    [auth.userId]
  );
  return usePaginatedAPI(getMoreRooms);
}

export function useFavoriteRooms() {
  const auth = useContext(AuthContext); // Re-render when you log in/out.
  const getMoreRooms = useCallback(
    cursor => {
      if (auth.userId) {
        return fetchReticulumAuthenticated(
          `/api/v1/media/search?source=favorites&type=rooms&user=${auth.userId}&cursor=${cursor}`
        );
      } else {
        return Promise.reject(new Error("Not signed in"));
      }
    },
    [auth.userId]
  );
  return usePaginatedAPI(getMoreRooms);
}

async function setFavorite(hubId) {
  const socket = await connectToReticulum(false);
  socket.onClose(() => {
  });
  // Reticulum global channel
  window.APP.retChannel = socket.channel(`ret`, { hub_id: hubId });
  window.APP.retChannel
    .join()
    .receive("ok", () => {
      const OAUTH_FLOW_PERMS_TOKEN_KEY = "ret-oauth-flow-perms-token";
      const oauthFlowPermsToken = Cookies.get(OAUTH_FLOW_PERMS_TOKEN_KEY);
      if (oauthFlowPermsToken) {
        Cookies.remove(OAUTH_FLOW_PERMS_TOKEN_KEY);
      }
      const hubChannelParamsForPermsToken = permsToken => {
        return createHubChannelParams({
          profile: window.APP.store.state.profile,
          pushSubscriptionEndpoint: null,
          permsToken,
          isMobile: false,
          isMobileVR: false,
          isEmbed: false,
          hubInviteId: null,
          authToken: window.APP.store.state.credentials && window.APP.store.state.credentials.token
        });
      };
      const hubPhxChannel = socket.channel(`hub:${hubId}`, hubChannelParamsForPermsToken(oauthFlowPermsToken));
      hubPhxChannel.join().receive("ok", async () => {
        hubPhxChannel.push("favorite", {});
      }).receive("error", res => {
        console.error(res);
      });
    })
    .receive("error", res => {
      console.error(res);
    });
}

export async function createAndSelect(sceneId, name = undefined) {
  const createUrl = getReticulumFetchUrl("/api/v1/hubs");
  const payload: any = { hub: { name: name || generateHubName() } };

  if (sceneId) {
    payload.hub.scene_id = sceneId;
  }

  const headers: any = { "content-type": "application/json" };
  const store = new Store();
  if (store.state && store.state.credentials.token) {
    headers.authorization = `bearer ${store.state.credentials.token}`;
  }

  let res = await fetch(createUrl, {
    body: JSON.stringify(payload),
    headers,
    method: "POST"
  }).then(r => r.json());

  if (res.error === "invalid_token") {
    // Clear the invalid token from store.
    store.update({ credentials: { token: null, email: null } });

    // Create hub anonymously
    delete headers.authorization;
    res = await fetch(createUrl, {
      body: JSON.stringify(payload),
      headers,
      method: "POST"
    }).then(r => r.json());
  }

  const hub = res;
  let url = hub.url;

  const creatorAssignmentToken = hub.creator_assignment_token;
  if (creatorAssignmentToken) {
    store.update({ creatorAssignmentTokens: [{ hubId: hub.hub_id, creatorAssignmentToken: creatorAssignmentToken }] });

    // Don't need to store the embed token if there's no creator assignment token, since that means
    // we are the owner and will get the embed token on page load.
    const embedToken = hub.embed_token;

    if (embedToken) {
      store.update({ embedTokens: [{ hubId: hub.hub_id, embedToken: embedToken }] });
    }
  }

  if (isLocalClient()) {
    url = window.location.origin + `/hub.html?hub_id=${hub.hub_id}`;
  }
  setFavorite(hub.hub_id);
  return url;
}

async function createRoom(sceneid) {
  let url = await createAndSelect(sceneid);
  console.log("created room : " + url);
  changeUrlSettings(url);
}

function createRoomEntry(name, sceneid, imageUrl) {
  return {
    "allow_remixing": false,
    "attributions": {
      "content": [
        {
          "title": "Salle"
        },
        {
          "title": "Image"
        },
        {
          "title": "Image 1"
        },
        {
          "title": "Video"
        }
      ],
      "creator": ""
    },
    "description": null,
    "id": sceneid,//"EW4e3CG"
    "images": {
      "preview": {
        "url": imageUrl //"https://alphahub.aptero.co/files/cb50c02d-585a-4feb-8461-e6d8cd34b656.jpg"
      }
    },
    "name": name,
    "project_id": "XXXXX",
    "type": "scene",
    "url": window.location.origin + "/" + sceneid
  };
}

export function RoomSection(props:{
  roomUrl:string,
  suggestedDisplayName:string,
  onChangeSuggestedDisplayName:(text:string)=>void
  onChangeRoomUrl:(text:string)=>void
}) {
  const auth = useContext(AuthContext); // Re-render when you log in/out.
  const [currentTab, setTab] = useState("featured");
  const { results: favoriteRooms } = useFavoriteRooms();
  const { results: spokeProject } = useSpokeProject();

  const sortedFeaturedScene = [
    createRoomEntry("Room 1", "pywjaKD", "https://meet.aptero.co/files/20c63c61-0eb1-4945-a0dc-82e041983d17.jpg"),
    createRoomEntry("Room 2", "ttQn7dJ", "https://meet.aptero.co/files/b3b8c2c8-3508-4916-a70e-4928eb23d380.jpg"),
    createRoomEntry("Room 3", "HkZhZjU", "https://meet.aptero.co/files/9574cccb-5241-4900-b2f5-4af780ec714d.jpg")
  ];
  const sortedFavoriteRooms = Array.from(favoriteRooms).sort((a, b) => b.member_count - a.member_count);
  const sortedSpokeProject = Array.from(spokeProject).sort((a, b) => b.member_count - a.member_count);

  useEffect(() => {
    const qs = new URLSearchParams(location.search);

    // Support legacy sign in urls.
    if (qs.has("sign_in")) {
      const redirectUrl = new URL("/signin", window.location);
      redirectUrl.search = location.search;
      window.location = redirectUrl;
    } else if (qs.has("auth_topic")) {
      const redirectUrl = new URL("/verify", window.location);
      redirectUrl.search = location.search;
      window.location = redirectUrl;
    }

    if (qs.has("new")) {
      createAndRedirectToNewHub(null, null, true);
    }
  }, []);

  const mySceneDisplay = sortedSpokeProject.length > 0;
  const myRoomDisplay = sortedFavoriteRooms.length > 0;
  const featuredDisplay = myRoomDisplay || mySceneDisplay;
  const Column2: any = Column;
  return (<>
    {!auth.userId && <p>Please Sign In to create your first 3d space.</p>}
    {auth.userId && <>
      <h2><FormattedMessage id="microsoft.settings.room" defaultMessage="Room"/></h2>
      {props.roomUrl && <>
        <Input
          label={<FormattedMessage id="microsoft.settings.room-display-name"
                                   defaultMessage="Room Display Name"/>}
          fluid
          value={props.suggestedDisplayName}
          onChange={(value) => {
            props.onChangeSuggestedDisplayName((value.target as any).value);
          }}
        />
        <Input
          label={<FormattedMessage id="microsoft.settings.selected-room"
                                   defaultMessage="Selected Room"/>}
          fluid
          value={props.roomUrl}
          onChange={(value) => {
            props.onChangeRoomUrl((value.target as any).value);
          }}
        />
        <Button fluid onClick={()=>{props.onChangeRoomUrl("")}}><FormattedMessage id="microsoft.settings.change-scene"
                                                           defaultMessage="Change Scene"/></Button>
      </>
      }
      {!props.roomUrl &&
        <>
          <div style={{ padding: 10, display: "flex", justifyContent: "space-evenly" }}>
            {featuredDisplay &&
              <Button style={{ margin: 10 }} primary={currentTab === "featured"}
                      onClick={() => {
                        setTab("featured");
                      }}><FormattedMessage id="microsoft-settings-page.featured"
                                           defaultMessage="Featured"/>
              </Button>
            }
            {mySceneDisplay &&
              <Button style={{ margin: 10 }} primary={currentTab === "my-scene"}
                      onClick={() => {
                        setTab("my-scene");
                      }}><FormattedMessage id="microsoft-settings-page.create"
                                           defaultMessage="My Scene"/>
              </Button>
            }
            {myRoomDisplay &&
              <Button style={{ margin: 10 }} primary={currentTab === "my-room"}
                      onClick={() => {
                        setTab("my-room");
                      }}><FormattedMessage id="microsoft-settings-page.my-scene"
                                           defaultMessage="My Room"/>
              </Button>
            }
          </div>
          {currentTab === "featured" && sortedFeaturedScene.length > 0 && (
            <Container as={undefined} className={undefined}>
              <Column2 grow padding>
                <MediaGrid center className={undefined} isVariableWidth={undefined} sm={undefined}>
                  {sortedFeaturedScene.map(room => {
                    return (
                      <MediaTile
                        onClick={(event) => {
                          event.preventDefault();
                          createRoom(room.id);
                        }}
                        onEdit={(event) => {
                          event.preventDefault();
                          console.log("edit : " + room.id);
                        }}
                        key={room.id}
                        entry={room}
                        processThumbnailUrl={(entry, width, height) => scaledThumbnailUrlFor(entry.images.preview.url, width, height)}
                        onShowSimilar={undefined} onCopy={undefined} onInfo={undefined}/>
                    );
                  })}
                </MediaGrid>
              </Column2>
            </Container>
          )}
          {currentTab === "my-scene" && sortedSpokeProject.length > 0 && (
            <Container as={undefined} className={undefined}>
              <Column2 grow padding >
                <MediaGrid center className={undefined} isVariableWidth={undefined} sm={undefined}>
                  {sortedSpokeProject.map(room => {
                    return (
                      <MediaTile
                        onClick={(event) => {
                          event.preventDefault();
                          createRoom(room.id);
                        }}
                        onEdit={(event) => {
                          event.preventDefault();
                          console.log("edit : " + room.id);
                        }}
                        key={room.id}
                        entry={room}
                        processThumbnailUrl={(entry, width, height) => scaledThumbnailUrlFor(entry.images.preview.url, width, height)}
                        onShowSimilar={undefined} onCopy={undefined} onInfo={undefined}/>
                    );
                  })}
                </MediaGrid>
              </Column2>
            </Container>
          )}
          {currentTab === "my-room" && sortedFavoriteRooms.length > 0 && (
            <Container className={undefined} as={undefined}>
              <Column2 grow padding>
                <MediaGrid center className={undefined} isVariableWidth={undefined} sm={undefined}>
                  {sortedFavoriteRooms.map(room => {
                    return (
                      <MediaTile
                        onClick={(event) => {
                          event.preventDefault();
                          let roomurl = ((propertiesService.PROTOCOL + propertiesService.RETICULUM_SERVER) || window.location.origin) + "/" + room.id;
                          if (window.location.origin.startsWith("https://localhost")) {
                            roomurl = window.location.origin + "/hub.html?hub_id=" + room.id;
                          }
                          console.log(roomurl);
                          changeUrlSettings(roomurl);
                        }}
                        key={room.id}
                        entry={room}
                        processThumbnailUrl={(entry, width, height) => scaledThumbnailUrlFor(entry.images.preview.url, width, height)}
                        onEdit={undefined} onShowSimilar={undefined} onCopy={undefined}
                        onInfo={undefined}/>
                    );
                  })}
                </MediaGrid>
              </Column2>
            </Container>
          )}
          <PageContainer className={undefined} style={{ backgroundColor: "#f3f2f1" }}>
          </PageContainer>
        </>
      }
    </>}</>);
}
