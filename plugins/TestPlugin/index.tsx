/// <reference path="../../types.d.ts" />
/// <reference path="../../Builder/types.d.ts" />

import { unpatchAll } from "@patcher";
import { Plugin } from "@structs";
// import {} from "@webpack";
// import {} from "@settings";

import React from "react";

export default class Test extends Plugin {
    onStart() {
        // BdApi.alert("Hey.", <p>Hello.</p>);
    }

    onStop() {
        unpatchAll();
    }
}
