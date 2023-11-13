import * as React from "react";
import { Button, Loader } from "@fluentui/react-northstar";
import { LightProfileCard } from "./LightProfileCard";
import { FormattedMessage } from "react-intl";
import { useEffect, useState, useRef } from "react";
import { MsTeamsAPI } from "@aptero/axolotis-module-teams";
import { msTeamsAPI } from "../../../axolotis/modules/basic/ImportHelper";
import { License } from "./License";
import { Authorize } from "./Authorize";
import Popover from '@material-ui/core/Popover';
import MenuItem from '@material-ui/core/MenuItem';

export function Identity(props) {
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<MsTeamsAPI>(null);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    (async () => {
      setService(await msTeamsAPI());
      setLoading(false);
    })();
  }, []);

  const requestAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      await service.getLoginService().login(false);
      setLoading(false);
    } catch (e) {
      setError(e);
      setLoading(false);
    }
  };

  return (
      <>
        {!loading && (
            <span style={{margin: "0"}}>
                    <span style={{
                      margin: "0",
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      gap: "8px"
                    }}>
                        {service && service.getLoginService().isSignedIn() && (
                            <>
                              <div onClick={handleClick}>
                                <LightProfileCard />
                              </div>
                              <Popover
                                  id={id}
                                  open={open}
                                  anchorEl={anchorEl}
                                  onClose={handleClose}
                                  anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'center',
                                  }}
                                  transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'center',
                                  }}
                              >
                                <MenuItem onClick={async () => {
                                  try {
                                    setLoading(true);
                                    setError(null);
                                    await service.getLoginService().logout();
                                    setLoading(false);
                                  } catch (e) {
                                    setError(e);
                                    setLoading(false);
                                  }
                                }}>
                                  Sign Out
                                </MenuItem>
                              </Popover>
                            </>
                        )}
                      {service && !service.getLoginService().isSignedIn() && (
                          <Button
                              primary
                              content="Sign In"
                              disabled={loading}
                              onClick={async () => {
                                await requestAuth();
                              }}
                              style={{height: "auto"}}
                          />
                      )}
                      <License />{/*<Authorize label={"Check License"}/>*/}
                    </span>
              {error && (
                  <p>
                    <FormattedMessage
                        id="microsoft.settings.account-auth.authorize1"
                        defaultMessage="Failed to authorize. Please contact the support at support@aptero.co and past the following error detail:"
                    />
                    <br/> {error.toString()}
                  </p>
              )}
                </span>
        )}
        {loading && <Loader />}
      </>
  );
}
