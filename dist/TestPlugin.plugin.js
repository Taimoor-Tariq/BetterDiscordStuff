/**
 * @name TestPlugin
 * @id TestPlugin
 */

"use strict";
// #region manifest.json
const manifest = Object.freeze({
    "name": "Test Plugin",
    "id": "TestPlugin"
});
// #endregion manifest.json

// #region @patcher
function after(module, method, callback) {
    return BdApi.Patcher.after(manifest.name, module, method, callback);
}

function unpatchAll() {
    BdApi.Patcher.unpatchAll(manifest.name);
}

// #endregion @patcher

// #region react
var React = BdApi.React;
// #endregion react

// #region @structs
class Plugin {
    _settings = null;
    onStart() {}
    onStop() {}
    start() {
        if (typeof this.onStart === "function") {
            this.onStart();
        }
    }
    stop() {
        if (typeof this.onStop === "function") {
            this.onStop();
        }
    }
    registerSettings(settings) {
        this._settings = settings;
    }
    get getSettingsPanel() {
        if (!this._settings)
            return void 0;
        return () => this._settings;
    }
}

// #endregion @structs

// #region index.tsx
class Test extends Plugin {
    onStart() {
        console.log("Hey.", after);
        BdApi.alert("Hey.", /* @__PURE__ */ React.createElement("p", null, "Hello."));
    }
    onStop() {
        console.log("Bye.", unpatchAll);
    }
}

// #endregion index.tsx

module.exports = Test;
