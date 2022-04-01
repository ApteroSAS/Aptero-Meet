export function getDefaultOrigin() {
    return window.location.hostname !== "localhost" ? "https://meet.aptero.co" : "https://alphahub.aptero.co";
}