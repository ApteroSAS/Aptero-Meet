import React, { useEffect, useState }  from "react";
import PropTypes from "prop-types";
import { customMenuService } from "../service/CustomMenuService";
import { Sidebar } from "../../react-components/sidebar/Sidebar";
import { CloseButton } from "../../react-components/input/CloseButton";

var toggled = false;
export function CustomSidebarContainer({ onClose }) {
  const [currentButtonTitle, setcurrentButtonTitle] = useState(0);
  const [currentUrl, setCurrentUrl] = useState(0);

  const handleChangeOfSideBar = (event) => {
    setcurrentButtonTitle(event.detail.title? event.detail.title :  "viewer");
    setCurrentUrl(event.detail.url);
  }

  useEffect(() => {
    setcurrentButtonTitle(customMenuService.getButtonTitle());
    setCurrentUrl(customMenuService.getIframeContentURL());

    window.addEventListener("action_toggle_custom_sidebar_info", handleChangeOfSideBar)

    return function cleanup() {
      window.removeEventListener("action_toggle_custom_sidebar_info", handleChangeOfSideBar)
    }
  },[])

  return (
    <Sidebar
      title={currentButtonTitle}
      beforeTitle={<CloseButton onClick={onClose} />}
    >
        <iframe src={currentUrl} width="100%" height="100%"></iframe>
    </Sidebar>
  );
}

CustomSidebarContainer.propTypes = {
  onClose: PropTypes.func
};
