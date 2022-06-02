/**
 * @name SwitchHypesquad
 * @version 1.0.1
 * @description Switch Hypersquad Houses using slash command
 * @author Taimoor
 * @authorId 220161488516546561
 * @authorLink https://github.com/Taimoor-Tariq
 * @source https://github.com/Taimoor-Tariq/BetterDiscordStuff/blob/main/Plugins/SwitchHypesquad/SwitchHypesquad.plugin.js
 * @github_raw https://raw.githubusercontent.com/Taimoor-Tariq/BetterDiscordStuff/main/Plugins/SwitchHypesquad/SwitchHypesquad.plugin.js
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
    const config = { info: { name: 'SwitchHypesquad', version: '1.0.1', description: 'Switch Hypersquad Houses using slash command', author: 'Taimoor', authorId: '220161488516546561', authorLink: 'https://github.com/Taimoor-Tariq', source: 'https://github.com/Taimoor-Tariq/BetterDiscordStuff/blob/main/Plugins/SwitchHypesquad/SwitchHypesquad.plugin.js', github_raw: 'https://raw.githubusercontent.com/Taimoor-Tariq/BetterDiscordStuff/main/Plugins/SwitchHypesquad/SwitchHypesquad.plugin.js', donate: 'https://ko-fi.com/TaimoorTariq', authors: [{ name: 'Taimoor', discord_id: '220161488516546561' }] }, main: 'index.js' };

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
              const plugin = (Plugin, Api) => {
                  const {
                      PluginUtilities,
                      Patcher,
                      WebpackModules,
                      DOMTools,
                      Modals,
                      DiscordModules: { React },
                  } = Api;
                  const css = `.hypesquad-swap-modal {
    color: var(--text-normal);
}
`;

                  return class SwitchHypesquad extends Plugin {
                      constructor() {
                          super();

                          this.cooldown = 0;
                          this.houses = {
                              HOUSE_1: 'Bravery',
                              HOUSE_2: 'Brilliance',
                              HOUSE_3: 'Balance',
                          };
                      }

                      onStart() {
                          PluginUtilities.addStyle(this.getName(), css);
                          this.patchCommand();
                      }

                      onStop() {
                          this.domObserver?.unsubscribeAll();
                          PluginUtilities.removeStyle(this.getName());
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

                      switchSquad(houseID) {
                          if (this.cooldown == 0) {
                              const hypeSquad = WebpackModules.getByProps('joinHypeSquadOnline');
                              hypeSquad
                                  .joinHypeSquadOnline({
                                      houseID: houseID,
                                  })
                                  .then(() => {
                                      this.cooldown = 60;
                                      this.updateCooldown();
                                      Modals.showModal('Hypesquad Switch', React.createElement('p', { className: 'hypesquad-swap-modal' }, `You have joined the ${this.houses[houseID]} Hypesquad.`), {
                                          cancelText: null,
                                      });
                                  })
                                  .catch(() => {
                                      Modals.showModal('Hypesquad Switch', React.createElement('p', { className: 'hypesquad-swap-modal' }, 'Something went wrong. Please try again later.'), {
                                          cancelText: null,
                                      });
                                  });
                          } else {
                              Modals.showModal('Hypesquad Switch', React.createElement('p', { className: 'hypesquad-swap-modal' }, `You need to wait ${this.cooldown} seconds before you can switch your Hypesquad again.`), {
                                  cancelText: null,
                              });
                          }
                      }

                      updateCooldown() {
                          if (this.cooldown > 0) {
                              this.cooldown--;
                              setTimeout(() => {
                                  this.updateCooldown();
                              }, 1000);
                          }
                      }

                      patchCommand() {
                          Patcher.after(BdApi.findModuleByProps('BUILT_IN_COMMANDS'), 'getBuiltInCommands', (_, type, ret) => {
                              if (type[0] == 1)
                                  ret.push({
                                      id: 'bd-hypesquad-swap',
                                      applicationId: '-1',
                                      name: 'hypesquad',
                                      displayName: 'hypesquad',
                                      description: 'Change your Hypesquad',
                                      displayDescription: 'Change your Hypesquad',
                                      inputType: 0,
                                      options: [
                                          {
                                              name: 'squad',
                                              displayName: 'squad',
                                              description: 'Name of the Hypesquad to join',
                                              displayDescription: 'Name of the Hypesquad to join',
                                              required: true,
                                              type: 3,
                                              choices: [
                                                  {
                                                      name: 'Bravery',
                                                      displayName: 'Bravery',
                                                      value: 'HOUSE_1',
                                                  },
                                                  {
                                                      name: 'Brilliance',
                                                      displayName: 'Brilliance',
                                                      value: 'HOUSE_2',
                                                  },
                                                  {
                                                      name: 'Balance',
                                                      displayName: 'Balance',
                                                      value: 'HOUSE_3',
                                                  },
                                              ],
                                          },
                                      ],
                                      type: 1,
                                      execute: (cmd) => {
                                          this.switchSquad(cmd[0].value);
                                      },
                                  });
                          });
                      }
                  };
              };
              return plugin(Plugin, Api);
          })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
