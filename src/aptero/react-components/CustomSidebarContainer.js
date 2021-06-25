import React from "react";
import PropTypes from "prop-types";
import { customMenuService } from "../service/CustomMenuService";
import { Sidebar } from "../../react-components/sidebar/Sidebar";
import { CloseButton } from "../../react-components/input/CloseButton";

export function CustomSidebarContainer({ onClose }) {
  return (
    <Sidebar
      title={customMenuService.getButtonTitle()}
      beforeTitle={<CloseButton onClick={onClose} />}
    >
        <iframe src={customMenuService.getIframeContentURL()} width="100%" height="100%"></iframe>
    </Sidebar>
  );
}

CustomSidebarContainer.propTypes = {
  onClose: PropTypes.func
};
