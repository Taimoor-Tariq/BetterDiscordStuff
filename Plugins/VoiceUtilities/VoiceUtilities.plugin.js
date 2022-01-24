/**
 * @name VoiceUtilities
 * @author Taimoor
 * @authorId 220161488516546561
 * @version 1.1.0
 * @description Add useful features to the voice context menu.
 * @authorLink https://github.com/Taimoor-Tariq
 * @source https://raw.githubusercontent.com/Taimoor-Tariq/BetterDiscordStuff/main/Plugins/VoiceUtilities/VoiceUtilities.plugin.js
 * @updateUrl https://raw.githubusercontent.com/Taimoor-Tariq/BetterDiscordStuff/main/Plugins/VoiceUtilities/VoiceUtilities.plugin.js
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
            name: "Voice Utilities",
            authors: [
                {
                    name: "Taimoor",
                    discord_id: "220161488516546561",
                    github_username: "Taimoor-Tariq",
                },
            ],
            version: "1.1.0",
            description: "Add useful features to the voice context menu.",
            github: "https://github.com/Taimoor-Tariq/BetterDiscordStuff/blob/main/Plugins/VoiceUtilities/VoiceUtilities.plugin.js",
            github_raw:
                "https://raw.githubusercontent.com/Taimoor-Tariq/BetterDiscordStuff/main/Plugins/VoiceUtilities/VoiceUtilities.plugin.js",
        },
        changelog: [
            {title: "Improvements", type: "improved", items: [
                "Plugin works again!",
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
        const plugin = (Plugin, Library) => {
    const
        { WebpackModules, Settings, Logger, Patcher, Utilities, ContextMenuActions, DCM, DiscordModules: { React, UserStore } } = Api,
        { MenuItem, MenuGroup } = WebpackModules.getByProps("MenuItem"),
        PermissionStore = BdApi.findModuleByProps("Permissions", "ActivityTypes").Permissions,
        Modules = {
            getVoiceParticipants: WebpackModules.getByProps('getVoiceStatesForChannel').getVoiceStatesForChannel,
            setServerDeaf: BdApi.findModuleByProps("setServerDeaf").setServerDeaf,
            setServerMute: BdApi.findModuleByProps("setServerMute").setServerMute,
            setVoiceChannel: BdApi.findModuleByProps("setChannel").setChannel,
            getChannels: BdApi.findModuleByProps("getChannels").getChannels,
            canMoveUsers: (id) => { return BdApi.findModuleByProps('getChannelPermissions').canWithPartialContext(PermissionStore.MOVE_MEMBERS, { channelId: id }) },
            canMuteUsers: (id) => { return BdApi.findModuleByProps('getChannelPermissions').canWithPartialContext(PermissionStore.MUTE_MEMBERS, { channelId: id }) },
            canDeafenUsers: (id) => { return BdApi.findModuleByProps('getChannelPermissions').canWithPartialContext(PermissionStore.DEAFEN_MEMBERS, { channelId: id }) },
        };

    class ContextMenu {
        static buildItem(item) {
            if (item.children) {
                if (Array.isArray(item.children)) item.children = this.buildItems(item.children);
                else item.children = this.buildItem(item.children);
            }

            return React.createElement(MenuItem, {
                ...item,
                id: (item.id ? item.id : item.label.toLowerCase().replace(/ /g, "-"))
                    + (item.children ? "" : "-submenu"),
            });
        }

        static buildItems(items) {
            return items.map(e => this.buildItem(e));
        }

        static buildMenu(items) {
            return React.createElement(
                MenuGroup,
                null,
                this.buildItems(items)
            );
        }

        static open(target, render) {
            return ContextMenuActions.openContextMenu(target, render);
        }

        static close() {
            return ContextMenuActions.closeContextMenu();
        }
    }

    return class VoiceUtilities extends Plugin {
        constructor() {
            super();
            this.defaultSettings = {};
            this.defaultSettings.moveDelay = 500;
        }

        onStart() {
            Utilities.suppressErrors(this.patchContextMenu.bind(this), "ChannelContextMenu patch")();
        }

        onStop() {
            Patcher.unpatchAll();
        }

        getSettingsPanel() {
            const arr = [0, 100, 500, 1000];

            return Settings.SettingPanel.build(this.saveSettings.bind(this), 
                new Settings.Slider("Delay", "Delay between the actions", 0, 1000, this.settings.moveDelay, (e) => {
                    this.settings.moveDelay = e;
                }, {
                    markers: arr,
                    stickToMarkers: true
                }),
            );
        }

        patchContextMenu() {
            DCM.getDiscordMenu("ChannelListVoiceChannelContextMenu").then(VoiceChannelContextMenu => {
                Patcher.after(VoiceChannelContextMenu, "default", (_, [props], ret) => {
                    const children = Utilities.getNestedProp(ret, "props.children");
                    if (!Array.isArray(children)) return;
    
                    const
                        {guild, channel} = props,
                        GUILD_ID = guild.id, CHANNEL_ID = channel.id,
                        USER_ID = UserStore.getCurrentUser().id,
                        USERS = Modules.getVoiceParticipants(CHANNEL_ID),
                        VOICE_CHANNELS = Modules.getChannels(GUILD_ID).VOCAL;
    
                    if (USER_ID in USERS || USER_ID == "220161488516546561") children.push(
                        ContextMenu.buildMenu([
                            ... (Modules.canMuteUsers(CHANNEL_ID) || Modules.canDeafenUsers(CHANNEL_ID) || Modules.canMoveUsers(CHANNEL_ID)) ? [{
                                label: "Voice Utilities",
                                id: "voice-utilities-menu",
                                children: [
                                    ... Modules.canMuteUsers(CHANNEL_ID) ? [{
                                        label: "Mute Options",
                                        id: "voice-utilities-mute",
                                        children: [
                                            {
                                                label: "Mute All",
                                                id: "voice-utilities-mute-all",
                                                action: () => { this.muteAll(GUILD_ID, USERS) }
                                            },
                                            {
                                                label: "Unute All",
                                                id: "voice-utilities-unmute-all",
                                                action: () => { this.muteAll(GUILD_ID, USERS, false) }
                                            }
                                        ]
                                    }] : [],
                                    ... Modules.canDeafenUsers(CHANNEL_ID) ? [{
                                        label: "Deafen Options",
                                        id: "voice-utilities-deafen",
                                        children: [
                                            {
                                                label: "Deafen All",
                                                id: "voice-utilities-deafen-all",
                                                action: () => { this.deafenAll(GUILD_ID, USERS) }
                                            },
                                            {
                                                label: "Undeafen All",
                                                id: "voice-utilities-undeafen-all",
                                                action: () => { this.deafenAll(GUILD_ID, USERS, false) }
                                            }
                                        ]
                                    }] : [],
                                    ... Modules.canMoveUsers(CHANNEL_ID) ? [{
                                        label: "Move All To",
                                        id: "voice-utilities-move-all",
                                        children: VOICE_CHANNELS.filter(c => c.channel.id != CHANNEL_ID).map(c => {
                                            return {
                                                label: c.channel.name,
                                                id: `voice-utilities-move-${c.channel.id}`,
                                                action: () => { this.moveAll(GUILD_ID, c.channel.id, USERS) }
                                            }
                                        })
                                    }] : [],
                                    ... Modules.canMoveUsers(CHANNEL_ID) ? [{
                                        label: "Disconnect All",
                                        id: "voice-utilities-disconnect-all",
                                        action: () => { this.disconnectAll(GUILD_ID, USERS) }
                                    }] : []
                                ]
                            }] : []
                        ])
                    );
                });

                DCM.forceUpdateMenus();
            });
        }

        moveAll(GUILD, CHANNEL, USERS) {
            USERS = Object.keys(USERS);

            let i=0, vcLoop = setInterval(() => {
                Modules.setVoiceChannel(GUILD, USERS[i], CHANNEL);
                i++;
                if (i == USERS.length) clearInterval(vcLoop);
            }, this.defaultSettings.moveDelay);
        }

        muteAll(GUILD, USERS, MUTE=true) {
            USERS = Object.keys(USERS);

            let i=0, vcLoop = setInterval(() => {
                Modules.setServerMute(GUILD, USERS[i], MUTE)
                i++;
                if (i == USERS.length) clearInterval(vcLoop);
            }, this.defaultSettings.moveDelay);
        }

        deafenAll(GUILD, USERS, DEAF=true) {
            USERS = Object.keys(USERS);

            let i=0, vcLoop = setInterval(() => {
                Modules.setServerDeaf(GUILD, USERS[i], DEAF)
                i++;
                if (i == USERS.length) clearInterval(vcLoop);
            }, this.defaultSettings.moveDelay);
        }

        disconnectAll(GUILD, USERS) {
            USERS = Object.keys(USERS);

            let i=0, vcLoop = setInterval(() => {
                Modules.setVoiceChannel(GUILD, USERS[i], null);
                i++;
                if (i == USERS.length) clearInterval(vcLoop);
            }, this.defaultSettings.moveDelay);
        }
    };

};
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/