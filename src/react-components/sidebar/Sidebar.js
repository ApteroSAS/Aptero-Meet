import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import styles from "./Sidebar.scss";

import {Fullscreen, FullscreenExit} from "@material-ui/icons/"

import { startsWith } from "core-js/core/string";


export class Sidebar extends React.Component {
  // set initial state
  state = {
    fullmodeToggle: false
  };

  /*
    Method to toggle the state: The listener is meant to allow
    the sidebar to be toggled from external components/scripts
  */
  handleToggle = () => {
    this.setState(prevState => ({ fullmodeToggle: !prevState.fullmodeToggle }));
  };
  addEventListener = () => {
    window.addEventListener("action_toggle_custom_sidebar_fullscreen", this.handleToggle);
  }
  removeEventListener = () => {
    window.removeEventListener("action_toggle_custom_sidebar_fullscreen", this.handleToggle);
  }
  componentDidMount() {
    this.addEventListener();
  }
  componentWillUnmount() {
    this.removeEventListener();
  }

  // Render component
  render() {
    const { title, beforeTitle, afterTitle, children, contentClassName, className, disableOverflowScroll, fullmodeButton, fullmode} = this.props;
    const { fullmodeToggle } = this.state;
    const FullscreenLogo = fullmodeToggle ? FullscreenExit : Fullscreen;

    //Display on the title that we are embedding a Hyperbeam link
    let hyperbeamPrefix = "";
    if (children.props) //ONLY if we are using a URL as a child
    {
      const url = children.props.src;
      if (url && url.toString().startsWith("https://hyperbeam"))
      {hyperbeamPrefix = "Hyperbeam: ";}
    }

    return (
      <div className={classNames(styles.sidebar, className, fullmodeToggle ? styles.fullmode : "")}>
        {(title || beforeTitle || afterTitle || fullmodeButton || fullmode) && (
          <div className={styles.header}>
            <div className={styles.beforeTitle}>{beforeTitle}</div>
            <button 
              className={styles.fullmodeButton} 
              onClick={this.handleToggle}
              //Make blue on hover
              onMouseEnter={e => (e.currentTarget.style.color = "#00a0ff")}
              onMouseLeave={e => (e.currentTarget.style.color = "")} 
            >
              <FullscreenLogo size="24" style={{display: afterTitle ? "none" : "block"}}/>
            </button>
            <h5>{hyperbeamPrefix}{title}</h5>
            <div className={styles.afterTitle}>{afterTitle}</div>
          </div>
        )}
        <div className={classNames(styles.content, disableOverflowScroll ? "" : styles.overflowY, contentClassName)}>
          {children}
        </div>
      </div>
    );
  }
}

Sidebar.propTypes = {
  title: PropTypes.node,
  beforeTitle: PropTypes.node,
  afterTitle: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
  contentClassName: PropTypes.string,
  disableOverflowScroll: PropTypes.bool
};

Sidebar.defaultProps = {
  disableOverflowScroll: false
};