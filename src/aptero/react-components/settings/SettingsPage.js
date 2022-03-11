import React, {useCallback, useContext, useEffect, useState} from "react";
import {FormattedMessage} from "react-intl";
import styles from "./SettingsPage.scss";
import {
    connectToReticulum,
    createAndRedirectToNewHub,
    fetchReticulumAuthenticated,
    getReticulumFetchUrl, isLocalClient
} from "../../../utils/phoenix-utils";
import {MediaGrid} from "../../../react-components/room/MediaGrid";
import {MediaTile} from "../../../react-components/room/MediaTiles";
import {PageContainer} from "../../../react-components/layout/PageContainer";
import {scaledThumbnailUrlFor} from "../../../utils/media-url-utils";
import {Column} from "../../../react-components/layout/Column";
import {Container} from "../../../react-components/layout/Container";
import {changeUrlSettings, declareFrameSize} from "../../service/MicrosoftIntegration/MsTeams";
import {AuthContext} from "../../../react-components/auth/AuthContext";
import {usePaginatedAPI} from "../../../react-components/home/usePaginatedAPI";
import Button from "@material-ui/core/Button";
import {generateHubName} from "../../../utils/name-generation";
import Store from "../../../storage/store";
import Cookies from "js-cookie";
import {createHubChannelParams} from "../../../utils/hub-utils";

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

async function setFavorite(hubId){
    const socket = await connectToReticulum(false);
    socket.onClose(e => {});
    // Reticulum global channel
    APP.retChannel = socket.channel(`ret`, { hub_id: hubId });
    APP.retChannel
        .join()
        .receive("ok", data => {
            const OAUTH_FLOW_PERMS_TOKEN_KEY = "ret-oauth-flow-perms-token";
            const oauthFlowPermsToken = Cookies.get(OAUTH_FLOW_PERMS_TOKEN_KEY);
            if (oauthFlowPermsToken) {
                Cookies.remove(OAUTH_FLOW_PERMS_TOKEN_KEY);
            }
            const hubChannelParamsForPermsToken = permsToken => {
                return createHubChannelParams({
                    profile: window.APP.store.state.profile,
                    pushSubscriptionEndpoint:null,
                    permsToken,
                    isMobile:false,
                    isMobileVR:false,
                    isEmbed:false,
                    hubInviteId: null,
                    authToken: window.APP.store.state.credentials && window.APP.store.state.credentials.token
                });
            };
            const hubPhxChannel = socket.channel(`hub:${hubId}`, hubChannelParamsForPermsToken(oauthFlowPermsToken));
            hubPhxChannel.join().receive("ok", async data => {
                hubPhxChannel.push("favorite", {});
            }).receive("error", res => {
                console.error(res);
            });
        })
        .receive("error", res => {
            console.error(res);
        });
}

export async function createAndSelect(sceneId, name) {
    const createUrl = getReticulumFetchUrl("/api/v1/hubs");
    const payload = { hub: { name: name || generateHubName() } };

    if (sceneId) {
        payload.hub.scene_id = sceneId;
    }

    const headers = { "content-type": "application/json" };
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
        url = window.location.origin+`/hub.html?hub_id=${hub.hub_id}`;
    }
    setFavorite(hub.hub_id);
    return url;
}

async function createRoom(sceneid){
    let url = await createAndSelect(sceneid);
    console.log("created room : "+url);
    changeUrlSettings(url);
}

function createRoomEntry(name,sceneid,imageUrl){
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
        "url": window.location.origin+"/"+sceneid
    }
}

export function SettingsPage() {
    const [currentTab, setTab] = useState("featured");
    const {results: favoriteRooms} = useFavoriteRooms();
    const {results: spokeProject} = useSpokeProject();

    //https://meet.aptero.co/scenes/pywjaKD
    //https://meet.aptero.co/files/b84ea235-b3cf-4d5c-a3bf-76f89d3f94c1.jpg
    //https://meet.aptero.co/scenes/ttQn7dJ
    //https://meet.aptero.co/files/5894d964-620c-4cc9-8376-1f243e5dcae4.jpg
    //https://meet.aptero.co/scenes/HkZhZjU
    //https://meet.aptero.co/files/352a32d7-f46f-4b8e-8c7b-555875e624e4.jpg
    const sortedFeaturedScene = [
        createRoomEntry("Room 1","pywjaKD","https://meet.aptero.co/files/b84ea235-b3cf-4d5c-a3bf-76f89d3f94c1.jpg"),
        createRoomEntry("Room 2","ttQn7dJ","https://meet.aptero.co/files/5894d964-620c-4cc9-8376-1f243e5dcae4.jpg"),
        createRoomEntry("Room 3","HkZhZjU","https://meet.aptero.co/files/352a32d7-f46f-4b8e-8c7b-555875e624e4.jpg"),
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

    setTimeout(()=>{
        const size = {height:window.document.body.scrollHeight,width:window.document.body.scrollWidth};
        console.log(size);
        declareFrameSize(size)
    },0)

    return (
        <PageContainer className={styles.homePage} style={{backgroundColor:"#f3f2f1"}}>
            <div style={{padding: 10, display: "flex", justifyContent: "space-evenly"}}>
                <Button style={{margin: 10}} variant="contained" disableElevation={currentTab === "featured"}
                        onClick={() => {
                            setTab("featured")
                        }}><FormattedMessage id="microsoft-settings-page.featured" defaultMessage="Featured"/></Button>
                <Button style={{margin: 10}} variant="contained" disableElevation={currentTab === "my-scene"}
                        onClick={() => {
                            setTab("my-scene")
                        }}><FormattedMessage id="microsoft-settings-page.create" defaultMessage="My Scene"/></Button>
                <Button style={{margin: 10}} variant="contained" disableElevation={currentTab === "my-room"}
                        onClick={() => {
                            setTab("my-room")
                        }}><FormattedMessage id="microsoft-settings-page.my-scene" defaultMessage="My Room"/></Button>
            </div>
            {currentTab === "featured" && sortedFeaturedScene.length > 0 && (
                <Container className={styles.roomsContainer}>
                    <Column grow padding className={styles.rooms}>
                        <MediaGrid center>
                            {sortedFeaturedScene.map(room => {
                                return (
                                    <MediaTile
                                        onClick={(event) => {
                                            event.preventDefault();
                                            createRoom(room.id);
                                        }}
                                        onEdit={(event) => {
                                            event.preventDefault();
                                            console.log("edit : "+room.id);
                                        }}
                                        key={room.id}
                                        entry={room}
                                        processThumbnailUrl={(entry, width, height) =>
                                            scaledThumbnailUrlFor(entry.images.preview.url, width, height)
                                        }
                                    />
                                );
                            })}
                        </MediaGrid>
                    </Column>
                </Container>
            )}
            {currentTab === "my-scene" && sortedSpokeProject.length > 0 && (
                <Container className={styles.roomsContainer}>
                    <Column grow padding className={styles.rooms}>
                        <MediaGrid center>
                            {sortedSpokeProject.map(room => {
                                return (
                                    <MediaTile
                                        onClick={(event) => {
                                            event.preventDefault();
                                            createRoom(room.id);
                                        }}
                                        onEdit={(event) => {
                                            event.preventDefault();
                                            console.log("edit : "+room.id);
                                        }}
                                        key={room.id}
                                        entry={room}
                                        processThumbnailUrl={(entry, width, height) =>
                                            scaledThumbnailUrlFor(entry.images.preview.url, width, height)
                                        }
                                    />
                                );
                            })}
                        </MediaGrid>
                    </Column>
                </Container>
            )}
            {currentTab === "my-room" && sortedFavoriteRooms.length > 0 && (
                <Container className={styles.roomsContainer}>
                    <Column grow padding className={styles.rooms}>
                        <MediaGrid center>
                            {sortedFavoriteRooms.map(room => {
                                return (
                                    <MediaTile
                                        onClick={(event) => {
                                            event.preventDefault();
                                            let roomurl = window.location.origin + "/" + room.id
                                            console.log(roomurl);
                                            changeUrlSettings(roomurl);
                                        }}
                                        key={room.id}
                                        entry={room}
                                        processThumbnailUrl={(entry, width, height) =>
                                            scaledThumbnailUrlFor(entry.images.preview.url, width, height)
                                        }
                                    />
                                );
                            })}
                        </MediaGrid>
                    </Column>
                </Container>
            )}
        </PageContainer>
    );
}
