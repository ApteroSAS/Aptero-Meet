export const CustomURLName = Symbol.for("CustomURLName");

declare const APP:any;

export class CustomURL {
    constructor() {
        //TO test
        //const url = "https://www.aptero.co/room/{ROOM_ID}/{ROOM_NAME}?user={USER_ID}&displayName={USER_DISPLAY_NAME}&user_token={USER_TOKEN}&user_email={USER_EMAIL}&qs_toto={QS_TOTO}";
        //const processedUrl = this.processURL(url);
        //console.log(processedUrl);
    }

    /**
     * Processes a URL by replacing predefined placeholders with actual values and
     * custom query string parameters.
     *
     * The function replaces placeholders for room_sid, room_name, user_id, and user_displayname.
     * It also dynamically replaces placeholders for query string parameters.
     * These query string placeholders are expected to be in the format {QS_PARAM},
     * where 'PARAM' is the uppercase version of the query parameter name.
     *
     * @param {string} url - The URL with placeholders to be processed.
     * room_sid - The room SID to replace the {ROOM_SID} placeholder.
     * room_name - The room name to replace the {ROOM_NAME} placeholder.
     * user_id - The user ID to replace the {USER_ID} placeholder.
     * user_displayname - The user display name to replace the {USER_DISPLAYNAME} placeholder.
     *
     * @returns {string} - The processed URL with all placeholders replaced with actual values.
     */
    processURL(url: string): string {
        if (!url) {
            return url;
        }

        const { email, token } = APP.store?.state?.credentials;
        const { displayName } = APP.store?.state?.profile;
        const { hub_id, name: room_name } = APP.hub;
        const credentialsAccountId = APP.store?.credentialsAccountId;

        // Function to escape regular expression special characters
        const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Encode URL components
        const encodedRoomName = encodeURIComponent(room_name || 'default');
        const encodedDisplayName = encodeURIComponent(displayName || 'Anonymous');
        const encodedEmail = encodeURIComponent(email || 'anonymous');

        // Replace predefined placeholders
        url = url.replace('{ROOM_ID}', hub_id || 'default')
            .replace('{ROOM_NAME}', encodedRoomName)
            .replace('{USER_ID}', credentialsAccountId || 0)
            .replace('{USER_TOKEN}', token || 'anonymous')
            .replace('{USER_EMAIL}', encodedEmail)
            .replace('{USER_DISPLAY_NAME}', encodedDisplayName);

        // Parse and replace custom query string parameters
        const queryString = window.location.search;
        if (queryString) {
            const params = new URLSearchParams(queryString);
            for (const [key, value] of params.entries()) {
                const placeholder = `{QS_${key.toUpperCase()}}`;
                const escapedPlaceholder = escapeRegExp(placeholder);
                url = url.replace(new RegExp(escapedPlaceholder, 'g'), value?encodeURIComponent(value):"undefined");
            }
        }

        // Remove any remaining QS placeholders
        url = url.replace(/\{QS_[A-Z_]+\}/g, 'undefined');

        return url;
    }


}
