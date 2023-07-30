/// <reference path="../../Builder/types.d.ts" />

import { after, unpatchAll } from "@patcher";
import { Plugin } from "@structs";
import React from "react";

export default class Test extends Plugin {
    onStart() {
        console.log("Hey.", after);

        BdApi.alert("Hey.", <p>Hello.</p>);
    }

    onStop() {
        console.log("Bye.", unpatchAll);
    }
}
