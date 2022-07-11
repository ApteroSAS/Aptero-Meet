import * as React from "react";
import {useCallback, useContext, useState} from "react";
import {FormattedMessage} from "react-intl";

import {Button, Input} from "@fluentui/react-northstar";
import {MediaGrid} from "./hubs/react-components/room/MediaGrid";
import {usePaginatedAPI} from "./hubs/react-components/home/usePaginatedAPI";
import {Container} from "./hubs/react-components/layout/Container";
import {Column} from "./hubs/react-components/layout/Column";
import {roomService} from "@aptero/axolotis-module-basic";
import {AuthContext} from "../../../../react-components/auth/AuthContext";
import {MediaTile} from "../../../../react-components/room/MediaTiles";
import {msTeamsAPI} from "../../../../../../common/modules/teams-module";

//https://fluentsite.z22.web.core.windows.net/0.60.1

declare const window;

function useSpokeProject() {
  const auth: any = useContext(AuthContext); // Re-render when you log in/out.
  if (auth) {
    const getMoreRooms = useCallback(roomService().fetchSpokeProject(auth.userId), [auth.userId]);
    return usePaginatedAPI(getMoreRooms);
  } else {
    return {results:[]}
  }
}

function useFavoriteRooms() {
  const auth:any = useContext(AuthContext); // Re-render when you log in/out.
  if (auth) {
    const getMoreRooms = useCallback(roomService().fetchFavoriteRoom(auth.userId), [auth.userId]);
    return usePaginatedAPI(getMoreRooms);
  } else {
    return {results:[]}
  }
}

export function RoomSection(props: {
  roomUrl: string;
  suggestedDisplayName: string;
  onChangeSuggestedDisplayName: (text: string) => void;
  onChangeRoomUrl: (text: string) => void;
}) {
  const [currentTab, setTab] = useState("featured");
  const {results: favoriteRooms} = useFavoriteRooms();
  const {results: spokeProject} = useSpokeProject();

  const sortedFeaturedScene = [
    roomService().createRoomEntry("Room 1", "pywjaKD", "https://meet.aptero.co/files/20c63c61-0eb1-4945-a0dc-82e041983d17.jpg"),
    roomService().createRoomEntry("Room 2", "ttQn7dJ", "https://meet.aptero.co/files/b3b8c2c8-3508-4916-a70e-4928eb23d380.jpg"),
    roomService().createRoomEntry("Room 3", "HkZhZjU", "https://meet.aptero.co/files/9574cccb-5241-4900-b2f5-4af780ec714d.jpg"),
  ];
  const sortedFavoriteRooms = Array.from(favoriteRooms).sort((a, b) => b.member_count - a.member_count);
  const sortedSpokeProject = Array.from(spokeProject).sort((a, b) => b.member_count - a.member_count);

  const mySceneDisplay = sortedSpokeProject.length > 0;
  const myRoomDisplay = sortedFavoriteRooms.length > 0;
  const featuredDisplay = myRoomDisplay || mySceneDisplay;
  const Column2: any = Column;
  return (<>
          <h2>
            <FormattedMessage id="microsoft.settings.room" defaultMessage="Room"/>
          </h2>
          {props.roomUrl && (
            <>
              <Input
                label={<FormattedMessage id="microsoft.settings.room-display-name" defaultMessage="Room Display Name"/>}
                fluid
                value={props.suggestedDisplayName}
                onChange={(value) => {
                  props.onChangeSuggestedDisplayName((value.target as any).value);
                }}
              />
              <Input
                label={<FormattedMessage id="microsoft.settings.selected-room" defaultMessage="Selected Room"/>}
                fluid
                value={props.roomUrl}
                onChange={(value) => {
                  props.onChangeRoomUrl((value.target as any).value);
                }}
              />
              <Button
                fluid
                onClick={() => {
                  props.onChangeRoomUrl("");
                }}
              >
                <FormattedMessage id="microsoft.settings.change-scene" defaultMessage="Change Scene"/>
              </Button>
            </>
          )}
          {!props.roomUrl && (
            <>
              <div style={{padding: 10, display: "flex", justifyContent: "space-evenly"}}>
                {featuredDisplay && (
                  <Button
                    style={{margin: 10}}
                    primary={currentTab === "featured"}
                    onClick={() => {
                      setTab("featured");
                    }}
                  >
                    <FormattedMessage id="microsoft-settings-page.featured" defaultMessage="Featured"/>
                  </Button>
                )}
                {mySceneDisplay && (
                  <Button
                    style={{margin: 10}}
                    primary={currentTab === "my-scene"}
                    onClick={() => {
                      setTab("my-scene");
                    }}
                  >
                    <FormattedMessage id="microsoft-settings-page.create" defaultMessage="My Scene"/>
                  </Button>
                )}
                {myRoomDisplay && (
                  <Button
                    style={{margin: 10}}
                    primary={currentTab === "my-room"}
                    onClick={() => {
                      setTab("my-room");
                    }}
                  >
                    <FormattedMessage id="microsoft-settings-page.my-scene" defaultMessage="My Room"/>
                  </Button>
                )}
              </div>
              {currentTab === "featured" && sortedFeaturedScene.length > 0 && (
                <Container as={undefined} className={undefined}>
                  <Column2 grow padding>
                    <MediaGrid center className={undefined} isVariableWidth={undefined} sm={undefined}>
                      {sortedFeaturedScene.map((room) => {
                        return (
                          <MediaTile
                            onClick={async (event) => {
                              event.preventDefault();
                              let url = roomService().createAndSelect(room.id);
                              console.log("created room : " + url);
                              await (await msTeamsAPI()).changeUrlSettings(url);
                            }}
                            onEdit={(event) => {
                              event.preventDefault();
                              console.log("edit : " + room.id);
                            }}
                            key={room.id}
                            entry={room}
                            processThumbnailUrl={(entry, width, height) => {
                              //TODO add a thumbnail service here
                              return entry.images.preview.url;
                            }}
                            onShowSimilar={undefined}
                            onCopy={undefined}
                            onInfo={undefined}
                          />
                        );
                      })}
                    </MediaGrid>
                  </Column2>
                </Container>
              )}
              {currentTab === "my-scene" && sortedSpokeProject.length > 0 && (
                <Container as={undefined} className={undefined}>
                  <Column2 grow padding>
                    <MediaGrid center className={undefined} isVariableWidth={undefined} sm={undefined}>
                      {sortedSpokeProject.map((room) => {
                        return (
                          <MediaTile
                            onClick={async (event) => {
                              event.preventDefault();
                              let url = roomService().createAndSelect(room.id);
                              console.log("created room : " + url);
                              await (await msTeamsAPI()).changeUrlSettings(url);
                            }}
                            onEdit={(event) => {
                              event.preventDefault();
                              console.log("edit : " + room.id);
                            }}
                            key={room.id}
                            entry={room}
                            processThumbnailUrl={(entry, width, height) => entry.images.preview.url}
                            onShowSimilar={undefined}
                            onCopy={undefined}
                            onInfo={undefined}
                          />
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
                      {sortedFavoriteRooms.map((room) => {
                        return (
                          <MediaTile
                            onClick={async (event) => {
                              event.preventDefault();
                              let roomurl = window.location.origin + "/" + room.id;
                              if (window.location.origin.startsWith("https://localhost")) {
                                roomurl = window.location.origin + "/hub.html?hub_id=" + room.id;
                              }
                              console.log(roomurl);
                              await (await msTeamsAPI()).changeUrlSettings(roomurl);
                            }}
                            key={room.id}
                            entry={room}
                            processThumbnailUrl={(entry, width, height) => entry.images.preview.url}
                            onEdit={undefined}
                            onShowSimilar={undefined}
                            onCopy={undefined}
                            onInfo={undefined}
                          />
                        );
                      })}
                    </MediaGrid>
                  </Column2>
                </Container>
              )}
            </>
          )}
    </>
  );
}
