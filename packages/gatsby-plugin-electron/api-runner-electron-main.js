const glob = require(`glob`);
const path = require('path')
const fs = require('fs')
const {
  store,
  emitter,
  loadNodeContent,
  getNodes,
  getNode,
  hasNodeChanged,
  getNodeAndSavePathDependency
} = require(`gatsby/dist/redux`);
const apiList = require("./api-runner-electron-main-docs.js");

const hasAPIFile = plugin =>
  glob.sync(`${plugin.resolve}/gatsby-electron-main*`)[0];

const reduxStateFile = fs.readFileSync(path.resolve('./', '.cache', 'electron-redux-state.json'), 'utf-8')
const reduxState = JSON.parse(reduxStateFile)
let filteredPlugins;
module.exports = async (api, args = {}, pluginSource) => {
  // Check that the API is documented.
  if (!apiList[api]) {
    reporter.error(
      `api: "${api}" is not a valid Gatsby-plugin-electron api; called from ${pluginSource}`
    );
    process.exit();
  }

  // TODO: Patch into Gatsby to access redux store?
  // TODO: when is the redux store content valid? do we need to ship the .cache for now?
  const plugins = reduxState.flattenedPlugins;
  console.log("plugins", plugins.length);
  // Get the list of plugins that implement gatsby-electron-main
  if (!filteredPlugins) {
    filteredPlugins = plugins
      .filter(plugin => hasAPIFile(plugin))
      .map(plugin => require(`${plugin.resolve}/gatsby-electron-main`));
  }
  // args can include a callback that probably needs to be sync'd
  filteredPlugins.map(plugin => runAPI(plugin, api, args));
};

const toObject = (arr, args) => {
  return arr.reduce(
    (acc, arg) => ({
      ...acc,
      [arg]: args[arg]
    }),
    {}
  );
};

const apiPos = {
  onReady: ["launchInfo"],
  onBeforeQuit: ["event"],
  onWillQuit: ["event"],
  onQuit: ["event", "exitCode"],
  onOpenFile: ["event", "path"],
  onOpenUrl: ["event", "url"],
  onActivate: ["event", "hasVisibleWindows"],
  onContinueActivity: ["event", "type", "userInfo"],
  onWillContinueActivity: ["event", "type"],
  onContinueActivityError: ["event", "type", "error"],
  onActivityWasContinued: ["event", "type", "userInfo"],
  onUpdateActivityState: ["event", "type", "userInfo"],
  onNewWindowForTab: ["event"],
  onBrowserWindowBlur: ["event", "window"],
  onBrowserWindowFocus: ["event", "window"],
  onBrowserWindowCreated: ["event", "window"],
  onWebContentsCreated: ["event", "webContents"],

  onCertificateError: [
    "event",
    "webContents",
    "url",
    "error",
    "certificate",
    "callback"
  ],
  onSelectClientCertificate: [
    "event",
    "webContents",
    "url",
    "list",
    "callback"
  ],
  onLogin: ["event", "webContents", "request", "authInfo", "callback"],
  onGpuProcessCrashed: ["event", "killed"],
  onAccessibilitySupportChanged: ["event", "accessibilitySupportEnabled"],
  onSessionCreated: ["session"],
  onSecondInstance: ["event", "argv", "workingDirectory"],
  onDesktopCapturerGetSources: ["event", "webContents"],
  onRemoteRequire: ["event", "webContents", "moduleName"],
  onRemoteGetGlobal: ["event", "webContents", "globalName"],
  onRemoteGetBuiltin: ["event", "webContents", "moduleName"],
  onRemoteGetCurrentWindow: ["event", "webContents"],
  onRemoteGetCurrentWebContents: ["event", "webContents"],
  onRemoteGetGuestWebContents: ["event", "webContents", "guestWebContents"]
};

const runAPI = async (plugin, api, positionalArgs) => {
  let args = apiPos[api] ? toObject(apiPos[api], positionalArgs) : undefined;

  const apiCallArgs = [args, plugin.pluginOptions];

  if (plugin[api]) {
    await plugin[api](apiCallArgs);
  }
};
