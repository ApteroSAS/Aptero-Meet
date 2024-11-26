import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import styles from "./Sidebar.scss";


export class Sidebar extends React.Component {
  // set initial state
  state = {
    fullmodeToggle: false
  };

  /*
    Method to toggle the state: The listener is meant to allow
    the sidebar to be toggled from external components/scripts
  */
  fullmodeClick = () => {
    // Trigger as an emit to sync other components that may need to update
    const sceneEl = document.querySelector("a-scene");
    sceneEl.emit("action_toggle_custom_sidebar_fullscreen");
  }
  handleFullmodeToggle = () => {
    this.setState(prevState => ({ fullmodeToggle: !prevState.fullmodeToggle }));
  };
  addEventListener = () => {
    window.addEventListener("action_toggle_custom_sidebar_fullscreen", this.handleFullmodeToggle);
  }
  removeEventListener = () => {
    window.removeEventListener("action_toggle_custom_sidebar_fullscreen", this.handleFullmodeToggle);
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
    const FullscreenLogo = fullmodeToggle ?
        <div style={{display: afterTitle ? "none" : "block",width:"38px"}}>
          <svg viewBox="0 0 24 24">
            <path d="M5 16h3v3h2v-5H5zm3-8H5v2h5V5H8zm6 11h2v-3h3v-2h-5zm2-11V5h-2v5h5V8z"></path>
          </svg>
        </div>
        :
        <div style={{display: afterTitle ? "none" : "block", width: "38px"}}>
          <svg viewBox="0 0 24 24">
            <path d="M7 14H5v5h5v-2H7zm-2-4h2V7h3V5H5zm12 7h-3v2h5v-5h-2zM14 5v2h3v3h2V5z"></path>
          </svg>
        </div>;

    //Display on the title that we are embedding a Hyperbeam link
    let hyperbeamPrefix = "";
    if (children && children.props) { //ONLY if we are using a URL as a child
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
              onClick={this.fullmodeClick}
              //Make blue on hover
              onMouseEnter={e => (e.currentTarget.style.color = "#00a0ff")}
              onMouseLeave={e => (e.currentTarget.style.color = "")} 
            >
              {FullscreenLogo}
            </button>
            <h5>{hyperbeamPrefix}{title}</h5>
            <div className={styles.afterTitle}>{afterTitle}</div>
          </div>
        )}
        <div className={classNames("psidebar",styles.content, disableOverflowScroll ? "" : styles.overflowY, contentClassName)}>
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