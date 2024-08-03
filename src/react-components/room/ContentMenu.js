import React, { useState, useEffect } from "react";
import className from "classnames";
import PropTypes from "prop-types";
import { joinChildren } from "../misc/joinChildren";
//import styles from "./ContentMenu.scss";
import styles from "../input/ToolbarButton.scss";

import { ReactComponent as ObjectsIcon } from "../icons/Objects.svg";
import { ReactComponent as PeopleIcon } from "../icons/People.svg";
import { FormattedMessage } from "react-intl";

// Apply inline styles to enforce color depending on theme (dark/light)
// Used for the IconComponent
let themeMode = "";
/*if (document.body.classList.contains("dark-theme")) {
  themeMode = "brightness(0) invert(1)"
} else {
  themeMode = "brightness(0)"
}*/
themeMode = "brightness(0)";

const iconStyle = {
  borderRadius: '20%',
  filter: themeMode,
};

// Dynamically import the icon based on the iconName prop
function IconComponent({ iconName }) {
  const [Icon, setIcon] = useState(null);

  useEffect(() => {
    if (!iconName) {
      return;
    }

    // Dynamically import the icon based on the iconName prop
    import(`../icons/${iconName}.svg`)
      .then((importedIcon) => {
        // The default export of the SVG will be used as the component
        setIcon(() => importedIcon.ReactComponent);
      })
      .catch(error => {
        // Handle any errors in loading the icon
        console.error('Error loading icon:', error);
      });
  }, [iconName]);
  // Render the icon if it's loaded
  return Icon ? <Icon style={iconStyle} /> : null;
}

export function ContentMenuButton({ active, disabled, children, ...props }) {
  return (
    <button
      className={className(styles.contentMenuButton, { [styles.active]: active, [styles.disabled]: disabled })}
      {...props}
    >
      {children}
    </button>
  );
}

ContentMenuButton.propTypes = {
  children: PropTypes.node,
  active: PropTypes.bool,
  disabled: PropTypes.bool
};

export function ECSDebugMenuButton(props) {
  return (
    <ContentMenuButton {...props}>
      <ObjectsIcon />
      <span>
        <FormattedMessage id="content-menu.ecs-debug-menu-button" defaultMessage="ECS Debug" />
      </span>
    </ContentMenuButton>
  );
}

export function ObjectsMenuButton(props) {
  return (
    <ContentMenuButton {...props}>
      <ObjectsIcon />
      <span>
        <FormattedMessage id="content-menu.objects-menu-button" defaultMessage="Objects" />
      </span>
    </ContentMenuButton>
  );
}

export function PeopleMenuButton(props) {
  return (
    <ContentMenuButton {...props}>
      <PeopleIcon />
      <span>
        <FormattedMessage
          id="content-menu.people-menu-button"
          defaultMessage="People ({presenceCount})"
          values={{ presenceCount: props.presencecount }}
        />
      </span>
    </ContentMenuButton>
  );
}
PeopleMenuButton.propTypes = {
  presencecount: PropTypes.number
};

export function ContentMenu({ children }) {
  return (
    <div className={styles.contentMenu}>
      {joinChildren(children, () => (
        <div />
      ))}
    </div>
  );
}

ContentMenu.propTypes = {
  children: PropTypes.node
};

// Add a new button for the P-Sidebar
export function PSidebarButton(props) {
  return (
    <ContentMenuButton {...props}>
      <div 
        style={{ marginRight: '0' }}
      >
        <IconComponent iconName={props.icon} />
      </div>
      <span>
        <FormattedMessage id="content-menu.psidebar-menu-button" defaultMessage="Sidebar" />
      </span>
    </ContentMenuButton>
  );
}
PSidebarButton.propTypes = {
  children: PropTypes.node,
  active: PropTypes.bool,
  icon: PropTypes.node
};