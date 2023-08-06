import * as React from "react";
import { Loader } from "@fluentui/react-northstar";
import { FormattedMessage } from "react-intl";
import { useState, useEffect } from "react";
import { MsTeamsAPI } from "@aptero/axolotis-module-teams";
import { msTeamsAPI } from "../../../axolotis/modules/basic/ImportHelper";
import { License } from "./License";
import { Authorize } from "./Authorize";
import Popover from '@material-ui/core/Popover';
import MenuItem from '@material-ui/core/MenuItem';
import { UserAvatar } from "./UserAvatar";

export function IdentitySmall(props) {
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<MsTeamsAPI>(null);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    if(!anchorEl) {
      setAnchorEl(event.currentTarget);
    }
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
      handleClose();
    } catch (e) {
      setError(e);
      setLoading(false);
    }
  };

  return (
      <>
        {!loading && (
            <div onClick={handleClick}>
              <UserAvatar />
              {!!anchorEl && <Popover
                  id={!!anchorEl ? 'simple-popover' : undefined}
                  open={!!anchorEl}
                  anchorEl={anchorEl}
                  onClose={handleClose} // added this line
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
              >
                {service && service.getLoginService().isSignedIn() && (
                    <MenuItem onClick={async () => {
                      try {
                        setLoading(true);
                        setError(null);
                        await service.getLoginService().logout();
                        setLoading(false);
                        handleClose();
                      } catch (e) {
                        setError(e);
                        setLoading(false);
                      }
                    }}>
                      Sign Out
                    </MenuItem>
                )}
                {service && !service.getLoginService().isSignedIn() && (
                    <MenuItem onClick={requestAuth}>
                      Sign In
                    </MenuItem>
                )}
                <MenuItem>
                  <License />
                </MenuItem>
                <Authorize label={"Authorize"}/>
              </Popover>}
              {error && (
                  <p>
                    <FormattedMessage
                        id="microsoft.settings.account-auth.authorize1"
                        defaultMessage="Failed to authorize. Please contact the support at support@aptero.co and past the following error detail:"
                    />
                    <br/> {error.toString()}
                  </p>
              )}
            </div>
        )}
        {loading && <Loader />}
      </>
  );
}
