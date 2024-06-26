import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import configs from "../../utils/configs";
import { tryGetTheme, getCurrentTheme, registerDarkModeQuery } from "../../utils/theme";

let config = process.env.APP_CONFIG;
// Storybook includes environment variables as a string
// https://storybook.js.org/docs/react/configure/environment-variables
if (!config && process.env.STORYBOOK_APP_CONFIG) {
  config = JSON.parse(process.env.STORYBOOK_APP_CONFIG);
}

if (!config) {
  config = window.APP_CONFIG;
}

if (config?.theme?.error) {
  console.error(
    `Custom themes failed to load.\n${config.theme.error}\nIf you are an admin, reconfigure your themes in the admin panel.`
  );
}

export let currentTheme = "default";

export const themes = config?.theme?.themes || [];
console.log("theme", themes);

function useDarkMode() {
  const [darkMode, setDarkMode] = useState(false);

  const changeListener = useCallback(
    event => {
      setDarkMode(event.matches);
    },
    [setDarkMode]
  );

  useEffect(() => {
    const [darkModeQuery, removeListener] = registerDarkModeQuery(changeListener);

    setDarkMode(darkModeQuery.matches);

    return removeListener;
  }, [changeListener]);

  return darkMode;
}

export function useTheme(themeId) {
  const darkMode = useDarkMode();

  useEffect(() => {
    const theme = tryGetTheme(themeId);
    console.log("theme", theme);

    if (!theme) {
      return;
    }

    const variables = [];

    for (const key in theme.variables) {
      if (!Object.prototype.hasOwnProperty.call(theme.variables, key)) continue;
      variables.push(`--${key}: ${theme.variables[key]};`);
    }

    const styleTag = document.createElement("style");

    styleTag.innerHTML = `:root {
        ${variables.join("\n")}
      }`;

    document.head.appendChild(styleTag);

    return () => {
      document.head.removeChild(styleTag);
    };
  }, [themeId, darkMode]);
}

function getAppLogo(darkMode) {
  const theme = getCurrentTheme();
  const shouldUseDarkLogo = theme ? theme.darkModeDefault || theme.id.includes("dark-mode") : darkMode;
  return (shouldUseDarkLogo && configs.image("logo_dark")) || configs.image("logo");
}

export function useLogo() {
  const darkMode = useDarkMode();
  return getAppLogo(darkMode);
}

export function changeTheme(newThemeId) {
  currentTheme = newThemeId;
  window.theme.requestChangeTheme(newThemeId);
}

export function useThemeFromStore(store) {
  const [themeId, setThemeId] = useState(store?.state?.preferences?.theme || currentTheme);
  console.log("themeId from store", themeId);

  useEffect(() => {
    window.theme = {
      requestChangeTheme: newThemeId => {
        setThemeId(newThemeId);
      }
    };

    function onStoreChanged() {
      const nextThemeId = store.state?.preferences?.theme || currentTheme;
      if (themeId !== nextThemeId) {
        setThemeId(nextThemeId);
      }
    }

    if (store) {
      store.addEventListener("statechanged", onStoreChanged);
    }

    return () => {
      if (store) {
        store.removeEventListener("statechanged", onStoreChanged);
      }
    };
  });

  useTheme(themeId);
}

export function ThemeProvider({ store, children }) {
  useThemeFromStore(store);
  return children;
}

ThemeProvider.propTypes = {
  store: PropTypes.object,
  children: PropTypes.node
};
