import React from "react";
import { FormattedMessage } from "react-intl";
import { createAndRedirectToNewHub } from "../../utils/phoenix-utils";
import { Button } from "../input/Button";
import { useCssBreakpoints } from "react-use-css-breakpoints";

export function CreateRoomButton() {
  const breakpoint = useCssBreakpoints();

  return (
    <Button
      thick={breakpoint === "sm" || breakpoint === "md"}
      xl={breakpoint !== "sm" && breakpoint !== "md"}
<<<<<<< HEAD
      preset="primary"
      style={{width: '100%'}}
=======
      preset="landing"
>>>>>>> 5a4d3b54dea82f259cfa2e74517406a074ddf81a
      onClick={e => {
        e.preventDefault();
        createAndRedirectToNewHub(null, null, false);
      }}
    >
      <FormattedMessage id="create-room-button" defaultMessage="Create Room" />
    </Button>
  );
}
