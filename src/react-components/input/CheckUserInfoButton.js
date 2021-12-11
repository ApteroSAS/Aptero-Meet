import React, { forwardRef, memo } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { Button } from "./Button";
import { FormattedMessage} from "react-intl";
export function CheckUserInfoButton() {
    return (
        <Button preset="basic">
        <FormattedMessage id="user-profile-sidebar.check-other-user-info-button" defaultMessage="User Information" />
      </Button>
    );
}