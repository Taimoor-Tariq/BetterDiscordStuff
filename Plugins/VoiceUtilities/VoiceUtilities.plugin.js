/**
 * @name VoiceUtilities
 * @version 1.1.4
 * @description Add useful features to the voice context menu.
 * @author Taimoor
 * @authorId 220161488516546561
 * @authorLink https://github.com/Taimoor-Tariq
 * @source https://github.com/Taimoor-Tariq/BetterDiscordStuff/blob/main/Plugins/VoiceUtilities/VoiceUtilities.plugin.js
 * @github_raw https://raw.githubusercontent.com/Taimoor-Tariq/BetterDiscordStuff/main/Plugins/VoiceUtilities/VoiceUtilities.plugin.js
 * @donate https://ko-fi.com/TaimoorTariq
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
    const config = { info: { name: 'VoiceUtilities', version: '1.1.4', description: 'Add useful features to the voice context menu.', author: 'Taimoor', authorId: '220161488516546561', authorLink: 'https://github.com/Taimoor-Tariq', source: 'https://github.com/Taimoor-Tariq/BetterDiscordStuff/blob/main/Plugins/VoiceUtilities/VoiceUtilities.plugin.js', github_raw: 'https://raw.githubusercontent.com/Taimoor-Tariq/BetterDiscordStuff/main/Plugins/VoiceUtilities/VoiceUtilities.plugin.js', donate: 'https://ko-fi.com/TaimoorTariq', authors: [{ name: 'Taimoor', discord_id: '220161488516546561' }] }, main: 'index.js' };

    return !global.ZeresPluginLibrary
        ? class {
              constructor() {
                  this._config = config;
              }
              getName() {
                  return config.info.name;
              }
              getAuthor() {
                  return config.info.authors.map((a) => a.name).join(', ');
              }
              getDescription() {
                  return config.info.description;
              }
              getVersion() {
                  return config.info.version;
              }
              load() {
                  BdApi.showConfirmationModal('Library Missing', `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                      confirmText: 'Download Now',
                      cancelText: 'Cancel',
                      onConfirm: () => {
                          require('request').get('https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js', async (error, response, body) => {
                              if (error) return require('electron').shell.openExternal('https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js');
                              await new Promise((r) => require('fs').writeFile(require('path').join(BdApi.Plugins.folder, '0PluginLibrary.plugin.js'), body, r));
                          });
                      },
                  });
              }
              start() {}
              stop() {}
          }
        : (([Plugin, Api]) => {
              const plugin = (Plugin, Library) => {
                  const {
                          WebpackModules,
                          Settings,
                          Logger,
                          Patcher,
                          Utilities,
                          DCM,
                          DOMTools,
                          Modals,
                          DiscordModules: {
                              UserStore,
                              DiscordConstants: { ChannelTypes },
                          },
                      } = Api,
                      PermissionStore = BdApi.findModuleByProps('Permissions', 'ActivityTypes').Permissions,
                      Modules = {
                          getVoiceParticipants: WebpackModules.getByProps('getVoiceStatesForChannel').getVoiceStatesForChannel,
                          setServerDeaf: BdApi.findModuleByProps('setServerDeaf').setServerDeaf,
                          setServerMute: BdApi.findModuleByProps('setServerMute').setServerMute,
                          setVoiceChannel: BdApi.findModuleByProps('setChannel').setChannel,
                          getChannels: BdApi.findModuleByProps('getChannels').getChannels,
                          canMoveUsers: (id) => {
                              return BdApi.findModuleByProps('getChannelPermissions').canWithPartialContext(PermissionStore.MOVE_MEMBERS, { channelId: id });
                          },
                          canMuteUsers: (id) => {
                              return BdApi.findModuleByProps('getChannelPermissions').canWithPartialContext(PermissionStore.MUTE_MEMBERS, { channelId: id });
                          },
                          canDeafenUsers: (id) => {
                              return BdApi.findModuleByProps('getChannelPermissions').canWithPartialContext(PermissionStore.DEAFEN_MEMBERS, { channelId: id });
                          },
                      };

                  let ARE_MUTED = false,
                      ARE_DEAFENED = false;

                  return class VoiceUtilities extends Plugin {
                      promises = {
                          cancelled: false,
                          cancel() {
                              this.cancelled = true;
                          },
                      };

                      constructor() {
                          super();
                          this.defaultSettings = {};
                          this.defaultSettings.moveDelay = 500;
                      }

                      onStart() {
                          Utilities.suppressErrors(this.patchContextMenu.bind(this), 'ChannelContextMenu patch')();

                          let VC_USERS = document.querySelectorAll('.voiceUser-3nRK-K.clickable-1ctZ-H');
                          VC_USERS.forEach((u) => {
                              u.addEventListener('click', (e) => {
                                  console.log(e);
                              });
                          });
                      }

                      onStop() {
                          this.domObserver?.unsubscribeAll();
                          Patcher.unpatchAll();
                      }

                      load() {
                          const myAdditions = (e) => {
                              const pluginCard = e.target.querySelector(`#${this.getName()}-card`);
                              if (pluginCard) {
                                  const controls = pluginCard.querySelector('.bd-controls');
                                  const changeLogButton = DOMTools.createElement(
                                      `<button class="bd-button bd-addon-button bd-changelog-button" style"position: relative;"> <style> .bd-changelog-button-tooltip { visibility: hidden; position: absolute; background-color: var(--background-floating); box-shadow: var(--elevation-high); color: var(--text-normal); border-radius: 5px; font-size: 14px; line-height: 16px; white-space: nowrap; font-weight: 500; padding: 8px 12px; z-index: 999999; transform: translate(0, -125%); } .bd-changelog-button-tooltip:after { content: ''; position: absolute; top: 100%; left: 50%; margin-left: -3px; border-width: 3x; border-style: solid; border-color: var(--background-floating) transparent transparent transparent; } .bd-changelog-button:hover .bd-changelog-button-tooltip { visibility: visible; } </style> <span class="bd-changelog-button-tooltip">Changelog</span> <svg viewBox="0 0 24 24" fill="#FFFFFF" style="width: 20px; height: 20px;"> <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" /> </svg> </button>`
                                  );
                                  changeLogButton.addEventListener('click', () => {
                                      Api.Modals.showChangelogModal(this.getName(), this.getVersion(), this._config.changelog);
                                  });

                                  if (!controls.querySelector('.bd-changelog-button') && this._config.changelog?.length > 0) controls.prepend(changeLogButton);
                              }
                          };

                          this.domObserver = new Api.DOMTools.DOMObserver();
                          this.domObserver.subscribeToQuerySelector(myAdditions, `#${this.getName()}-card`);

                          let userSettings = this.loadSettings();
                          if (!userSettings.usingVersion || userSettings.usingVersion < this.getVersion()) {
                              this.saveSettings({ ...this.loadSettings(), usingVersion: this.getVersion() });
                              Api.Modals.showChangelogModal(this.getName(), this.getVersion(), this._config.changelog);
                          }
                      }

                      getSettingsPanel() {
                          const arr = [0, 100, 500, 1000];

                          return Settings.SettingPanel.build(
                              this.saveSettings.bind(this),
                              new Settings.Slider(
                                  'Delay',
                                  'Delay between the actions',
                                  0,
                                  1000,
                                  this.settings.moveDelay,
                                  (e) => {
                                      this.settings.moveDelay = e;
                                  },
                                  {
                                      markers: arr,
                                      stickToMarkers: true,
                                  }
                              )
                          );
                      }

                      async patchContextMenu() {
                          const ChannelCloneItem = await DCM.getDiscordMenu('useChannelCloneItem');
                          if (this.promises.cancelled) return;

                          Patcher.after(ChannelCloneItem, 'default', (_, [channel], ret) => {
                              if (channel.type != ChannelTypes.GUILD_VOICE) return;

                              const GUILD_ID = channel.guild_id,
                                  CHANNEL_ID = channel.id,
                                  USER_ID = UserStore.getCurrentUser().id,
                                  USERS = Modules.getVoiceParticipants(CHANNEL_ID),
                                  VOICE_CHANNELS = Modules.getChannels(GUILD_ID).VOCAL,
                                  CAN_MUTE = Modules.canMuteUsers(CHANNEL_ID),
                                  CAN_DEAFEN = Modules.canDeafenUsers(CHANNEL_ID),
                                  CAN_MOVE = Modules.canMoveUsers(CHANNEL_ID);

                              if ((USER_ID in USERS || USER_ID == '220161488516546561') && (CAN_MUTE || CAN_DEAFEN || CAN_MOVE))
                                  return [
                                      DCM.buildMenuItem({
                                          type: 'submenu',
                                          label: 'Voice Utilities',
                                          items: [
                                              ...(CAN_MUTE
                                                  ? [
                                                        {
                                                            label: 'Mute All',
                                                            type: 'toggle',
                                                            active: ARE_MUTED,
                                                            action: () => {
                                                                ARE_MUTED = !ARE_MUTED;
                                                                this.muteAll(GUILD_ID, USERS, ARE_MUTED);
                                                            },
                                                        },
                                                    ]
                                                  : []),
                                              ...(CAN_DEAFEN
                                                  ? [
                                                        {
                                                            label: 'Deafen All',
                                                            type: 'toggle',
                                                            active: ARE_DEAFENED,
                                                            action: () => {
                                                                ARE_DEAFENED = !ARE_DEAFENED;
                                                                this.deafenAll(GUILD_ID, USERS, ARE_DEAFENED);
                                                            },
                                                        },
                                                    ]
                                                  : []),
                                              ...(CAN_MOVE
                                                  ? [
                                                        {
                                                            label: 'Move All To',
                                                            type: 'submenu',
                                                            items: VOICE_CHANNELS.filter((c) => c.channel.id != CHANNEL_ID).map((c) => {
                                                                return {
                                                                    label: c.channel.name,
                                                                    action: () => {
                                                                        this.moveAll(GUILD_ID, c.channel.id, USERS);
                                                                    },
                                                                };
                                                            }),
                                                        },
                                                    ]
                                                  : []),
                                              ...(CAN_MOVE
                                                  ? [
                                                        {
                                                            label: 'Disconnect All',
                                                            danger: true,
                                                            action: () => {
                                                                this.disconnectAll(GUILD_ID, USERS);
                                                            },
                                                        },
                                                    ]
                                                  : []),
                                          ],
                                      }),
                                      DCM.buildMenuItem({
                                          type: 'separator',
                                      }),
                                      ret,
                                  ];
                          });
                      }

                      moveAll(GUILD, CHANNEL, USERS) {
                          USERS = Object.keys(USERS);

                          let i = 0,
                              vcLoop = setInterval(() => {
                                  Modules.setVoiceChannel(GUILD, USERS[i], CHANNEL);
                                  i++;
                                  if (i == USERS.length) clearInterval(vcLoop);
                              }, this.defaultSettings.moveDelay);
                      }

                      muteAll(GUILD, USERS, MUTE = true) {
                          USERS = Object.keys(USERS);

                          let i = 0,
                              vcLoop = setInterval(() => {
                                  Modules.setServerMute(GUILD, USERS[i], MUTE);
                                  i++;
                                  if (i == USERS.length) clearInterval(vcLoop);
                              }, this.defaultSettings.moveDelay);
                      }

                      deafenAll(GUILD, USERS, DEAF = true) {
                          USERS = Object.keys(USERS);

                          let i = 0,
                              vcLoop = setInterval(() => {
                                  Modules.setServerDeaf(GUILD, USERS[i], DEAF);
                                  i++;
                                  if (i == USERS.length) clearInterval(vcLoop);
                              }, this.defaultSettings.moveDelay);
                      }

                      disconnectAll(GUILD, USERS) {
                          USERS = Object.keys(USERS);

                          let i = 0,
                              vcLoop = setInterval(() => {
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
