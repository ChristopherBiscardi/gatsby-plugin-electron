const path = require("path");
const fs = require("fs");

exports.onCreateWebpackConfig = ({
  stage,
  getConfig,
  rules,
  loaders,
  actions
}) => {
  if (stage === "develop" || stage === "build-javascript") {
    const config = getConfig();

    actions.replaceWebpackConfig({ ...config, target: "electron-renderer" });
  }
};

exports.onPostBootstrap = ({ store, cache }) => {
  const {
    /*program,
        nodes,
        nodesByType,
        resolvedNodesCache,
        nodesTouched,
        lastAction,
        plugins,*/
    flattenedPlugins,
    // apiToPlugins,
    config,
    /*pages,
        schema,
        status,
        componentDataDependencies,
        components,
        staticQueryComponents,
        jobs,
        webpack,
        redirects,
        babelrc,
        jsonDataPaths,
        schemaCustomization,*/
    themes
  } = store.getState();
  const filename = fs.writeFileSync(
    path.join(".cache", "electron-redux-state.json"),
      JSON.stringify({
      flattenedPlugins,
      config
      })
  );
};
