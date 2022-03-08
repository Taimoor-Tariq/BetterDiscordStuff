/**
 * @name bdDevBadges
 * @author Taimoor
 * @authorId 220161488516546561
 * @version 1.0.0
 * @description Show badges for BetterDiscord Plugin and Theme Developers.
 * @authorLink https://github.com/Taimoor-Tariq
 * @source https://raw.githubusercontent.com/Taimoor-Tariq/BetterDiscordStuff/main/Plugins/bdDevBadges/bdDevBadges.plugin.js
 * @updateUrl https://raw.githubusercontent.com/Taimoor-Tariq/BetterDiscordStuff/main/Plugins/bdDevBadges/bdDevBadges.plugin.js
 */
/*@cc_on
@if (@_jscript)
    
    // Offer to self-install for clueless users that try to run this directly.
    var shell = WScript.CreateObject("WScript.Shell");
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
    var pathSelf = WScript.ScriptFullName;
    // Put the user at ease by addressing them in the first person
    shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
    if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
        shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
    } else if (!fs.FolderExists(pathPlugins)) {
        shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
    } else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
        fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
        // Show the user where to put plugins in the future
        shell.Exec("explorer " + pathPlugins);
        shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
    }
    WScript.Quit();

@else@*/

module.exports = (() => {
    const config = {
        info: {
            name: "BD Dev Badges",
            authors: [
                {
                    name: "Taimoor",
                    discord_id: "220161488516546561",
                    github_username: "Taimoor-Tariq",
                },
            ],
            version: "1.0.0",
            description:
                "Show badges for BetterDiscord Plugin and Theme Developers.",
            github: "https://github.com/Taimoor-Tariq/BetterDiscordStuff/blob/main/Plugins/bdDevBadges/bdDevBadges.plugin.js",
            github_raw: "https://raw.githubusercontent.com/Taimoor-Tariq/BetterDiscordStuff/main/Plugins/bdDevBadges/bdDevBadges.plugin.js",
        },
        main: "index.js",
    };

    return !global.ZeresPluginLibrary ? class {
        constructor() {this._config = config;}
        getName() {return config.info.name;}
        getAuthor() {return config.info.authors.map(a => a.name).join(", ");}
        getDescription() {return config.info.description;}
        getVersion() {return config.info.version;}
        load() {
            BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onConfirm: () => {
                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                    });
                }
            });
        }
        start() {}
        stop() {}
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Api) => {
    const request = require("request"),
        css = `.bd-dev-badge {
    margin-left: 5px;
    margin-top: 5px;
}

.bd-dev-badge-tooltip {
    visibility: hidden;
    position: absolute;
    background-color: var(--background-floating);
    color: #fff;
    padding: 12px 10px;
    font-size: 12pt;
    top: 110%;
    right: 0;
    white-space: nowrap;
    font-weight: bold;
    border: 1px solid #fff;
    border-radius: 5px;
    filter: drop-shadow(5px 5px 10px #000);
    z-index: 999999;
}

.bd-theme-dev-badge:hover .bd-dev-badge-tooltip,
.bd-plugin-dev-badge:hover .bd-dev-badge-tooltip {
    visibility: visible;
}

.bd-theme-dev-badge,
.bd-plugin-dev-badge {
    position: relative;
}

.bd-theme-dev-badge .bd-dev-badge-tooltip { color: #f1c40f; border-color: #f1c40f; }
.bd-plugin-dev-badge .bd-dev-badge-tooltip { color: #c93f73; border-color: #c93f73; }
`,
        {
            PluginUtilities,
            Logger,
            Patcher,
            DiscordModules,
        } = Api,
        { React } = DiscordModules;

    return class bdDevBadges extends Plugin {
        constructor() {
            super();
            this.themeDevs = [];
            this.pluginDevs = [];

            this.themeDevBadge = React.createElement(
                "div",
                {
                    className: "bd-theme-dev-badge",
                    "aria-label": "BD theme Developer",
                    tabIndex: 0,
                    children: [
                        React.createElement(
                            "span",
                            {
                                className: "bd-dev-badge-tooltip",
                            },
                            "BD Theme Developer"
                        ),
                        React.createElement(
                            "img",
                            {
                                alt: " ",
                                ariaHidden: true,
                                // src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMTAwJSIgd2lkdGg9IjE2IiB2aWV3Qm94PSIwIDAgMjAwMCAyMDAwIj4NCiAgICA8Zz4NCiAgICAgICAgPHBhdGggZmlsbD0iIzNFODJFNSIgZD0iTTE0MDIuMiw2MzEuN2MtOS43LTM1My40LTI4Ni4yLTQ5Ni02NDIuNi00OTZINjguNHY3MTQuMWw0NDIsMzk4VjQ5MC43aDI1N2MyNzQuNSwwLDI3NC41LDM0NC45LDAsMzQ0LjlINTk3LjZ2MzI5LjVoMTY5LjhjMjc0LjUsMCwyNzQuNSwzNDQuOCwwLDM0NC44aC02OTl2MzU0LjloNjkxLjJjMzU2LjMsMCw2MzIuOC0xNDIuNiw2NDIuNi00OTZjMC0xNjIuNi00NC41LTI4NC4xLTEyMi45LTM2OC42QzEzNTcuNyw5MTUuOCwxNDAyLjIsNzk0LjMsMTQwMi4yLDYzMS43eiIgLz4NCiAgICAgICAgPHBhdGggZmlsbD0iI0ZGRkZGRiIgZD0iTTEyNjIuNSwxMzUuMkwxMjYyLjUsMTM1LjJsLTc2LjgsMGMyNi42LDEzLjMsNTEuNywyOC4xLDc1LDQ0LjNjNzAuNyw0OS4xLDEyNi4xLDExMS41LDE2NC42LDE4NS4zYzM5LjksNzYuNiw2MS41LDE2NS42LDY0LjMsMjY0LjZsMCwxLjJ2MS4yYzAsMTQxLjEsMCw1OTYuMSwwLDczNy4xdjEuMmwwLDEuMmMtMi43LDk5LTI0LjMsMTg4LTY0LjMsMjY0LjZjLTM4LjUsNzMuOC05My44LDEzNi4yLTE2NC42LDE4NS4zYy0yMi42LDE1LjctNDYuOSwzMC4xLTcyLjYsNDMuMWg3Mi41YzM0Ni4yLDEuOSw2NzEtMTcxLjIsNjcxLTU2Ny45VjcxNi43QzE5MzMuNSwzMTIuMiwxNjA4LjcsMTM1LjIsMTI2Mi41LDEzNS4yeiIgLz4NCiAgICA8L2c+DQo8L3N2Zz4=",
                                src: "data:image/svg+xml;base64,PHN2ZyBkYXRhLW5hbWU9IkFwcGVhcmFuY2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiB2aWV3Qm94PSIwIDAgMjQgMjQiPg0KICAgIDxwYXRoIGZpbGw9IiNmMWM0MGYiIGQ9Ik0xMiAwQzUuMzczIDAgMCA1LjM3MyAwIDEyczUuMzczIDEyIDEyIDEyYzEuMTA3IDAgMi0uODkzIDItMiAwLS41Mi0uMi0uOTg3LS41Mi0xLjM0N2EyLjAwMyAyLjAwMyAwIDAxLS41MDctMS4zMmMwLTEuMTA2Ljg5NC0yIDItMmgyLjM2QTYuNjcgNi42NyAwIDAwMjQgMTAuNjY3QzI0IDQuNzczIDE4LjYyNyAwIDEyIDB6TTQuNjY3IDEyYy0xLjEwNyAwLTItLjg5My0yLTJzLjg5My0yIDItMmMxLjEwNiAwIDIgLjg5MyAyIDJzLS44OTQgMi0yIDJ6bTQtNS4zMzNjLTEuMTA3IDAtMi0uODk0LTItMiAwLTEuMTA3Ljg5My0yIDItMiAxLjEwNiAwIDIgLjg5MyAyIDIgMCAxLjEwNi0uODk0IDItMiAyem02LjY2NiAwYy0xLjEwNiAwLTItLjg5NC0yLTIgMC0xLjEwNy44OTQtMiAyLTIgMS4xMDcgMCAyIC44OTMgMiAyIDAgMS4xMDYtLjg5MyAyLTIgMnptNCA1LjMzM2MtMS4xMDYgMC0yLS44OTMtMi0ycy44OTQtMiAyLTJjMS4xMDcgMCAyIC44OTMgMiAycy0uODkzIDItMiAyeiIvPg0KPC9zdmc+",
                                className: "bd-dev-badge",
                            }
                        )
                    ]
                }
            );

            this.pluginDevBadge = React.createElement(
                "div",
                {
                    className: "bd-plugin-dev-badge",
                    "aria-label": "BD plugin Developer",
                    tabIndex: 0,
                    children: [
                        React.createElement(
                            "span",
                            {
                                className: "bd-dev-badge-tooltip",
                            },
                            "BD Plugin Developer"
                        ),
                        React.createElement(
                            "img",
                            {
                                alt: " ",
                                ariaHidden: true,
                                src: "data:image/svg+xml;base64,PHN2ZyBkYXRhLW5hbWU9IlBsdWdpbnMiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiB2aWV3Qm94PSIwIDAgMjQgMjQiPg0KICAgIDxwYXRoIGZpbGw9IiNjOTNmNzMiIGQ9Ik0yMS4xNDMgMTEuNDI5aC0xLjcxNFY2Ljg1N2EyLjI5MiAyLjI5MiAwIDAwLTIuMjg2LTIuMjg2SDEyLjU3VjIuODU3YTIuODU4IDIuODU4IDAgMDAtNS43MTQgMHYxLjcxNEgyLjI4NkEyLjI4MyAyLjI4MyAwIDAwLjAxIDYuODU3VjExLjJoMS43MDNBMy4wODcgMy4wODcgMCAwMTQuOCAxNC4yODZhMy4wODcgMy4wODcgMCAwMS0zLjA4NiAzLjA4NUgwdjQuMzQzQTIuMjkyIDIuMjkyIDAgMDAyLjI4NiAyNGg0LjM0M3YtMS43MTRBMy4wODcgMy4wODcgMCAwMTkuNzE0IDE5LjJhMy4wODcgMy4wODcgMCAwMTMuMDg2IDMuMDg2VjI0aDQuMzQzYTIuMjkyIDIuMjkyIDAgMDAyLjI4Ni0yLjI4NnYtNC41NzFoMS43MTRhMi44NTggMi44NTggMCAwMDAtNS43MTR6Ii8+DQo8L3N2Zz4=",
                                className: "bd-dev-badge",
                            }
                        )
                    ]
                }
            );
        }

        onStart() {
            this.initialize();
            PluginUtilities.addStyle(this.getName(), css);
        }

        onStop() {
            PluginUtilities.removeStyle(this.getName());
            Patcher.unpatchAll();
        }

        async initialize() {
            await this.getDevelopers();
            this.patchUserProfileBadgeList();
        }

        async getDevelopers() {
            return new Promise((resolve) => {
                request(
                    "https://api.betterdiscord.app/latest/store/addons",
                    (err, res, body) => {
                        if (err) return Logger.err(err);
                        let data = JSON.parse(body),
                            themeDevs = data
                                .filter((d) => d.type === "theme")
                                .map((d) => d.author.discord_snowflake),
                            pluginDevs = data
                                .filter((d) => d.type === "plugin")
                                .map((d) => d.author.discord_snowflake);

                        this.themeDevs = [...new Set(themeDevs)];
                        this.pluginDevs = [...new Set(pluginDevs)];

                        resolve();
                    }
                );
            });
        }

        patchUserProfileBadgeList() {
            let userProfileBadgeList = BdApi.findAllModules((m) =>
                m?.default?.displayName.includes("UserProfileBadgeList")
            )[0];
            Patcher.after(
                userProfileBadgeList,
                "default",
                (_, [props], ret) => {
                    const { user } = props;

                    if (this.themeDevs.includes(user.id)) ret.props.children.push(this.themeDevBadge);
                    if (this.pluginDevs.includes(user.id)) ret.props.children.push(this.pluginDevBadge);
                }
            );
        }
    };
};
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/