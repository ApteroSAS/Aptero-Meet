import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import styles from "./Sidebar.scss";

import { FullscreenEnter } from '@styled-icons/open-iconic/FullscreenEnter';
import { FullscreenExit } from '@styled-icons/open-iconic/FullscreenExit';
import { startsWith } from "core-js/core/string";


export class Sidebar extends React.Component {
  // set initial state
  state = {
    fullmodeToggle: false
  };

  // method to toggle the state
  handleToggle = () => {
    this.setState(prevState => ({ fullmodeToggle: !prevState.fullmodeToggle }));
  };

  render() {
    const { title, beforeTitle, afterTitle, children, contentClassName, className, disableOverflowScroll, fullmodeButton, fullmode} = this.props;
    const { fullmodeToggle } = this.state;
    const FullscreenIcon = fullmodeToggle ? FullscreenExit : FullscreenEnter;

    //Display on the title that we are embedding a Hyperbeam link
    const url = children.props.src;
    let hyperbeamPrefix = "";
    if (url && url.toString().startsWith("https://hyperbeam"))
    {hyperbeamPrefix = "Hyperbeam: ";}

    return (
      <div className={classNames(styles.sidebar, className, fullmodeToggle ? styles.fullmode : "")}>
        {(title || beforeTitle || afterTitle || fullmodeButton || fullmode) && (
          <div className={styles.header}>
            <div className={styles.beforeTitle}>{beforeTitle}</div>
            <button className={styles.fullmodeButton} onClick={this.handleToggle}>
              <FullscreenIcon size="24" /> {/*Note: React-icons accept the size prop (in px) for icon size */}
            </button>
            <h5>{hyperbeamPrefix+title}</h5>
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