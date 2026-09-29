/**
 * The page that lists every demo. On demo.leuria.dev each demo lives in a
 * folder under it; a dev server serves the demo at its root, so the link
 * goes to the live showroom instead.
 */
export const SHOWROOM_URL = location.pathname.split("/").filter(Boolean).length > 0 ? new URL("../", location.href).pathname : "https://demo.leuria.dev/";
