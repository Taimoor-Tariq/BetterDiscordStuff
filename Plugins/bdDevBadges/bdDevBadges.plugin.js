/**
 * @name bdDevBadges
 * @author Taimoor
 * @authorId 220161488516546561
 * @version 1.0.3
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
            version: "1.0.3",
            description:
                "Show badges for BetterDiscord Plugin and Theme Developers.",
            github: "https://github.com/Taimoor-Tariq/BetterDiscordStuff/blob/main/Plugins/bdDevBadges/bdDevBadges.plugin.js",
            github_raw: "https://raw.githubusercontent.com/Taimoor-Tariq/BetterDiscordStuff/main/Plugins/bdDevBadges/bdDevBadges.plugin.js",
        },
        changelog: [
            {title: "Improvements", type: "improved", items: [
                "Clicking on badges now take you to the developer's page.",
            ]}
        ],
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
        css = `.bd-theme-dev-badge,
.bd-plugin-dev-badge { margin-top: 5px; margin-left: 5px; }

.bd-dev-badge-tooltip {
    visibility: hidden;
    position: absolute;
    background-color: var(--background-floating);
    box-shadow: var(--elevation-high);
    color: var(--text-normal);
    border-radius: 5px;
    font-size: 14px;
    line-height: 16px;
    white-space: nowrap;
    font-weight: 500;
    padding: 8px 12px;
    top: -7px;
    left: 50%;
    z-index: 999999;
    transform: translate(-50%, -100%);
}

div[class^="userPopout-"] .bd-dev-badge-tooltip { top: -24px; }
div[aria-label="User Profile Modal"] .bd-dev-badge-tooltip { top: -23px; }

.bd-dev-badge-tooltip:after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -3px;
    border-width: 3x;
    border-style: solid;
    border-color: var(--background-floating) transparent transparent transparent;
}

.bd-dev-badge { position: relative; }
.bd-dev-badge:hover .bd-dev-badge-tooltip { visibility: visible; }


.userPopout-2j1gM4,
.headerTop-3GPUSF,
.header-2jRmjb { overflow: unset !important; }
.header-2jRmjb,
.headerText-2z4IhQ { display: flex !important; align-items: center !important; }

.headerNormal-3Zn_yu {
    border-radius: 8px 8px 0 0;
    overflow: hidden;
}`,
        { PluginUtilities, Logger, Patcher, DiscordModules, WebpackModules } =
            Api,
        { React } = DiscordModules;

    return class bdDevBadges extends Plugin {
        constructor() {
            super();
            this.themeDevs = [];
            this.pluginDevs = [];
            this.authorNames = {};

            this.badgesConfig = {
                'theme': {
                    'tooltip': 'Theme Developer',
                    'aria-label': 'BD Theme Developer',
                    'color': 'f1c40f'
                },
                'plugin': {
                    'tooltip': 'Plugin Developer',
                    'aria-label': 'BD Plugin Developer',
                    'color': 'c93f73'
                }
            }

            this.createDevBadge = (type, name) => {
                return React.createElement("div", {
                    className: "bd-dev-badge",
                    "aria-label": this.badgesConfig[type]['aria-label'],
                    tabIndex: 0,
                    children: [
                        React.createElement(
                            "span",
                            {
                                className: "bd-dev-badge-tooltip",
                            },
                            this.badgesConfig[type]['tooltip']
                        ),
                        React.createElement("a", {
                            href: `https://betterdiscord.app/developer/${name}`,
                            target: "_blank",
                        }, React.createElement("img", {
                            alt: " ",
                            ariaHidden: true,
                            src: `data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' height='100%25' width='16' viewBox='0 0 2000 2000'%3e%3cg%3e%3cpath fill='%23${this.badgesConfig[type]['color']}' d='M1402.2%2c631.7c-9.7-353.4-286.2-496-642.6-496H68.4v714.1l442%2c398V490.7h257c274.5%2c0%2c274.5%2c344.9%2c0%2c344.9H597.6v329.5h169.8c274.5%2c0%2c274.5%2c344.8%2c0%2c344.8h-699v354.9h691.2c356.3%2c0%2c632.8-142.6%2c642.6-496c0-162.6-44.5-284.1-122.9-368.6C1357.7%2c915.8%2c1402.2%2c794.3%2c1402.2%2c631.7z'/%3e%3cpath fill='white' d='M1262.5%2c135.2L1262.5%2c135.2l-76.8%2c0c26.6%2c13.3%2c51.7%2c28.1%2c75%2c44.3c70.7%2c49.1%2c126.1%2c111.5%2c164.6%2c185.3c39.9%2c76.6%2c61.5%2c165.6%2c64.3%2c264.6l0%2c1.2v1.2c0%2c141.1%2c0%2c596.1%2c0%2c737.1v1.2l0%2c1.2c-2.7%2c99-24.3%2c188-64.3%2c264.6c-38.5%2c73.8-93.8%2c136.2-164.6%2c185.3c-22.6%2c15.7-46.9%2c30.1-72.6%2c43.1h72.5c346.2%2c1.9%2c671-171.2%2c671-567.9V716.7C1933.5%2c312.2%2c1608.7%2c135.2%2c1262.5%2c135.2z'/%3e%3c/g%3e%3c/svg%3e`,
                            className: `bd-${type}-dev-badge`,
                        }))
                    ],
                });
            };
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
            this.patchMessages();
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
                        data.forEach((d) => { this.authorNames[d.author.discord_snowflake] = d.author.display_name; });

                        resolve();
                    }
                );
            });
        }

        patchMessages() {
            let MessageHeader = BdApi.findAllModules((m) =>
                m?.default?.displayName.includes("MessageHeader")
            )[0];
            Patcher.after(MessageHeader, "default", (_, [props], ret) => {
                const { message } = props;
                let user = message.author;

                if (this.pluginDevs.includes(user.id))
                    ret.props.username.props.children[1].props.children.push(this.createDevBadge('plugin', this.authorNames[user.id]));
                if (this.themeDevs.includes(user.id))
                    ret.props.username.props.children[1].props.children.push(this.createDevBadge('theme', this.authorNames[user.id]));
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

                    if (this.pluginDevs.includes(user.id))
                        ret.props.children.push(this.createDevBadge('plugin', this.authorNames[user.id]));
                    if (this.themeDevs.includes(user.id))
                        ret.props.children.push(this.createDevBadge('theme', this.authorNames[user.id]));
                }
            );
        }
    };
};
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/