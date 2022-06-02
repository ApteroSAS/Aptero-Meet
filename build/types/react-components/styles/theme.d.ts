export function useTheme(themeId: any): void;
export function useThemeFromStore(store: any): void;
export function ThemeProvider({ store, children }: {
    store: any;
    children: any;
}): any;
export namespace ThemeProvider {
    namespace propTypes {
        const store: PropTypes.Requireable<object>;
        const children: PropTypes.Requireable<PropTypes.ReactNodeLike>;
    }
}
export const defaultTheme: "default";
export const themes: any;
import PropTypes from "prop-types";
