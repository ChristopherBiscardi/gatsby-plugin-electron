const { session } = require("electron");
const recursive = require("recursive-readdir");
const path = require("path");

exports.onReady = async () => {
  try {
      console.log('>>>> onReady')
    const files = await recursive("public/").then(files =>
      files.map(filepath => filepath.slice("public/".length, filepath.length))
    );
    // intercept requests
    session.defaultSession.webRequest.onBeforeRequest(
      files.map(filepath => "*" + filepath + "*"),
      ({ url }, callback) => {
        const filepath = url.split("file:///")[1];
          console.log('>> intercept', filepath)
        if (files.includes(filepath)) {
          callback({
            cancel: false,
            redirectURL:
              "file://" + path.join(path.resolve('.'), "public", filepath)
          });
        } else {
          callback({ cancel: false });
        }
      }
    );
  } catch (e) {
    console.warn("gatsby network intercept failed", e);
  }
};
