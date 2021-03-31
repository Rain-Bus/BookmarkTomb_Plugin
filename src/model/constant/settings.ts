export default {
  timeout: 10000,
  tokenName: "BookmarkTombToken",
  baseURL: localStorage.getItem("baseURL"),
  updateInterval: 900000,  // Default is 15 minutes.
  historySaveDays: 60,
  syncAfterStartUp: 5000,
  version: "v0.1"
};