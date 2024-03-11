import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import styles from './Sidebar.scss'; // Assuming you're using CSS modules
import { Fullscreen, FullscreenExit } from '@material-ui/icons';

interface SidebarProps {
  title?: React.ReactNode;
  beforeTitle?: React.ReactNode;
  afterTitle?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  disableOverflowScroll?: boolean;
  fullmodeButton?: boolean;
  fullmode?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
                                           title,
                                           beforeTitle,
                                           afterTitle,
                                           children,
                                           className,
                                           contentClassName,
                                           disableOverflowScroll = false,
                                           fullmodeButton,
                                           fullmode,
                                         }) => {
  const [fullmodeToggle, setFullmodeToggle] = useState(false);
  const FullscreenLogo = fullmodeToggle ? FullscreenExit : Fullscreen;

  useEffect(() => {
    const handleFullmodeToggle = () => setFullmodeToggle(!fullmodeToggle);
    window.addEventListener("action_toggle_custom_sidebar_fullscreen", handleFullmodeToggle);
    return () => window.removeEventListener("action_toggle_custom_sidebar_fullscreen", handleFullmodeToggle);
  }, [fullmodeToggle]);

  const fullmodeClick = () => {
    (document.querySelector("a-scene") as any)?.emit("action_toggle_custom_sidebar_fullscreen");
  };

  let hyperbeamPrefix = "";
  if (children && 'props' in children && children.props.src?.startsWith("https://hyperbeam")) {
    hyperbeamPrefix = "Hyperbeam: ";
  }

  return (
      <div className={classNames(styles.sidebar, className, { [styles.fullmode]: fullmodeToggle })}>
        {(title || beforeTitle || afterTitle || fullmodeButton || fullmode) && (
            <div className={styles.header}>
              <div className={styles.beforeTitle}>{beforeTitle}</div>
              <button
                  className={styles.fullmodeButton}
                  onClick={fullmodeClick}
                  onMouseEnter={e => (e.currentTarget.style.color = "#00a0ff")}
                  onMouseLeave={e => (e.currentTarget.style.color = "")}
              >
                <FullscreenLogo size="24" style={{ display: afterTitle ? "none" : "block" }} />
              </button>
              <h5>{hyperbeamPrefix}{title}</h5>
              <div className={styles.afterTitle}>{afterTitle}</div>
            </div>
        )}
        <div className={classNames("psidebar", styles.content, { [styles.overflowY]: !disableOverflowScroll }, contentClassName)}>
          {children}
        </div>
      </div>
  );
};

