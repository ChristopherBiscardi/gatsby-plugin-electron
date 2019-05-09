const { app } = require("electron");
const _ = require("lodash");
const apiList = require("./api-runner-electron-main-docs.js");
const apiRunnerElectron = require("./api-runner-electron-main.js");

Object.keys(apiList).forEach(api => {
  // remove `on` from `onApiCall`
  // translate to `api-call` for electron's benefit
  const decamelizedAPI = _.kebabCase(api.slice("on".length));
  app.on(decamelizedAPI, args => {
    console.log("calling", api);

    apiRunnerElectron(api, args, "electron-main-entry");
  });
});
