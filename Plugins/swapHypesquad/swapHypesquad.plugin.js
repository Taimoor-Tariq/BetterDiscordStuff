/**
 * @name SwapHypesquad
 * @version 1.0.0
 * @description Swap Hypersquad Houses using slash commands
 * @author Taimoor
 * @authorId 220161488516546561
 * @authorLink https://github.com/Taimoor-Tariq
 * @source https://github.com/Taimoor-Tariq/BetterDiscordStuff/blob/main/Plugins/SwapHypesquad/SwapHypesquad.plugin.js
 * @github_raw https://raw.githubusercontent.com/Taimoor-Tariq/BetterDiscordStuff/main/Plugins/SwapHypesquad/SwapHypesquad.plugin.js
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
    const config = { info: { name: 'SwapHypesquad', version: '1.0.0', description: 'Swap Hypersquad Houses using slash commands', author: 'Taimoor', authorId: '220161488516546561', authorLink: 'https://github.com/Taimoor-Tariq', source: 'https://github.com/Taimoor-Tariq/BetterDiscordStuff/blob/main/Plugins/SwapHypesquad/SwapHypesquad.plugin.js', github_raw: 'https://raw.githubusercontent.com/Taimoor-Tariq/BetterDiscordStuff/main/Plugins/SwapHypesquad/SwapHypesquad.plugin.js', donate: 'https://ko-fi.com/TaimoorTariq', authors: [{ name: 'Taimoor', discord_id: '220161488516546561' }] }, main: 'index.js' };

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
                      Modals,
                      DiscordModules: { React },
                  } = Api;
                  const css = `.hypesquad-swap-modal {
    color: var(--text-normal);
}
`;

                  return class SwapHypesquad extends Plugin {
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
                          PluginUtilities.removeStyle(this.getName());
                          Patcher.unpatchAll();
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
                                      Modals.showModal('Hypesquad Swap', React.createElement('p', { className: 'hypesquad-swap-modal' }, `You have joined the ${this.houses[houseID]} Hypesquad.`), {
                                          cancelText: null,
                                      });
                                  })
                                  .catch(() => {
                                      Modals.showModal('Hypesquad Swap', React.createElement('p', { className: 'hypesquad-swap-modal' }, 'Something went wrong. Please try again later.'), {
                                          cancelText: null,
                                      });
                                  });
                          } else {
                              Modals.showModal('Hypesquad Swap', React.createElement('p', { className: 'hypesquad-swap-modal' }, `You need to wait ${this.cooldown} seconds before you can switch your Hypesquad again.`), {
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
