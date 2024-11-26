import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import styles from './Sidebar.scss'; // Assuming you're using CSS modules

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

  useEffect(() => {
    const handleFullmodeToggle = () => setFullmodeToggle(!fullmodeToggle);
    window.addEventListener("action_toggle_custom_sidebar_fullscreen", handleFullmodeToggle);
    return () => window.removeEventListener("action_toggle_custom_sidebar_fullscreen", handleFullmodeToggle);
  }, [fullmodeToggle]);

  const fullmodeClick = () => {
    (document.querySelector("a-scene") as any)?.emit("action_toggle_custom_sidebar_fullscreen");
  };

  let hyperbeamPrefix = "";
  if (children && 'props' in (children as any) && (children as any).props.src?.startsWith("https://hyperbeam")) {
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
                {FullscreenLogo}
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

