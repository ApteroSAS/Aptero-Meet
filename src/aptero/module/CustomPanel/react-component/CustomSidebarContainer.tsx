import React, { useEffect, useState }  from "react";
import PropTypes from "prop-types";
import { customMenuService } from "../CustomMenuService";
import { CloseButton } from "../../../../react-components/input/CloseButton";
import {container} from "../../axolotis/IOCConfig";
import {CustomURL, CustomURLName} from "../../customURL/CustomURL";
import {Sidebar} from "../Sidebar/Sidebar";

export function CustomSidebarContainer({ onClose }) {
  const [currentButtonTitle, setcurrentButtonTitle] = useState(0);
  const [currentUrl, setCurrentUrl] = useState<string>();

  const handleChangeOfSideBar = (event) => {
    setcurrentButtonTitle(event.detail.title? event.detail.title :  "viewer");
    const url = container.get<CustomURL>(CustomURLName).processURL(event.detail.url);
    setCurrentUrl(url);
  }

  useEffect(() => {
    setcurrentButtonTitle(customMenuService.getButtonTitle());
    const url = container.get<CustomURL>(CustomURLName).processURL(customMenuService.getIframeContentURL());
    setCurrentUrl(url);

    window.addEventListener("action_toggle_custom_sidebar_info", handleChangeOfSideBar)

    return function cleanup() {
      window.removeEventListener("action_toggle_custom_sidebar_info", handleChangeOfSideBar)
    }
  },[])

  return (
    <Sidebar
      title={currentButtonTitle}
      beforeTitle={<CloseButton onClick={onClose} lg={undefined} className={undefined} />}
    >
      {/* https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy#directives */}
      {currentUrl !== "psidebar" && (
        <iframe src={currentUrl} width="100%" height="100%" allow="camera; fullscreen; vr; xr; xr-spatial-tracking;"></iframe>
      )}
    </Sidebar>
  );
}

CustomSidebarContainer.propTypes = {
  onClose: PropTypes.func
};
