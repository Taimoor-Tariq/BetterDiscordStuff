/**
 * @name DiscordCommandPalette
 * @version 1.0.2
 * @description Add a command palette to discord.
 * @author Taimoor
 * @authorId 220161488516546561
 * @authorLink https://github.com/Taimoor-Tariq
 * @source https://github.com/Taimoor-Tariq/BetterDiscordStuff/blob/main/Plugins/DiscordCommandPalette/DiscordCommandPalette.plugin.js
 * @github_raw https://raw.githubusercontent.com/Taimoor-Tariq/BetterDiscordStuff/main/Plugins/DiscordCommandPalette/DiscordCommandPalette.plugin.js
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
    const config = {
        info: { name: 'DiscordCommandPalette', version: '1.0.2', description: 'Add a command palette to discord.', author: 'Taimoor', authorId: '220161488516546561', authorLink: 'https://github.com/Taimoor-Tariq', source: 'https://github.com/Taimoor-Tariq/BetterDiscordStuff/blob/main/Plugins/DiscordCommandPalette/DiscordCommandPalette.plugin.js', github_raw: 'https://raw.githubusercontent.com/Taimoor-Tariq/BetterDiscordStuff/main/Plugins/DiscordCommandPalette/DiscordCommandPalette.plugin.js', donate: 'https://ko-fi.com/TaimoorTariq', authors: [{ name: 'Taimoor', discord_id: '220161488516546561' }] },
        changelog: [
            { title: 'v1.0.2 - New Stuff!!!', items: ['Missing Icons.', 'Added help command.'] },
            { title: 'v1.0.1 - New Stuff!!!', type: 'improved', items: ['Added DMs and GDMs to the command palette.', 'Added option to disconnect from a VC.', 'Added command aliases such as "#" for channels and "dm" for DMs and GDMs.', 'Fixed channels with accents not working.', 'Fixed command palette closing for no reason.'] },
            { title: 'v1.0.0 - Release', type: 'improved', items: ['Plugin Released!!!.'] },
        ],
        main: 'index.js',
    };

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
                      DOMTools,
                      Modals,
                      DiscordModules: { React, ReactDOM, GuildChannelsStore, GuildStore, Keybind, NavigationUtils, ChannelActions, ChannelStore },
                  } = Api;
                  const css = `.command-palette-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999999;
}

.command-palette-input-wrapper {
    position: absolute;
    top: 10rem;
    left: 50%;
    width: 70%;
    transform: translate(-50%, 0);
    border-radius: 5px;
    border: 1px solid var(--background-secondary);
    background-color: var(--channeltextarea-background);
    color: var(--text-normal);
    font-size: 1rem;
    display: flex;
    place-items: center;
    overflow: hidden;
}

.command-palette-input-wrapper > span {
    padding-left: 16px;
}

.command-palette-input {
    padding: 12px 16px;
    background-color: var(--channeltextarea-background);
    color: var(--text-normal);
    font-size: 1rem;
    flex-grow: 1;
    border: none;
}

.command-palette-suggestions {
    position: absolute;
    top: 15rem;
    left: 50%;
    width: 70%;
    transform: translate(-50%, 0);
    border-radius: 5px;
    border: 1px solid var(--background-secondary);
    background-color: var(--channeltextarea-background);
    color: var(--text-normal);
    font-size: 1rem;
    display: flex;
    flex-direction: column;
}

.command-palette-suggestion {
    padding: 12px 16px;
    display: flex;
    gap: 16px;
    align-items: center;
}
.command-palette-suggestion.hovered,
.command-palette-suggestion:hover {
    background-color: var(--background-secondary);
    color: var(--text-normal);
}
.command-palette-suggestion-match {
    font-weight: bold;
}

.command-palette-help {
    display: flex;
    flex-direction: column;
    color: var(--text-normal);
}

.command-palette-help-title {
    padding: 12px 0;
    font-weight: bold;
    font-size: 1.2rem;
}

.command-palette-help-item {
    display: block;
    padding: 4px 0;
    font-size: 1rem;
}
`;

                  return class DiscordCommandPalette extends Plugin {
                      constructor() {
                          super();

                          this.defaultSettings = {
                              keybind: [162, 32],
                              recentCommands: [],
                          };

                          this.keybuffer = [];

                          this.disableListener = false;

                          this.getIcon = (type) => {
                              let paths = {
                                  CHANNEL: 'M5.88657 21C5.57547 21 5.3399 20.7189 5.39427 20.4126L6.00001 17H2.59511C2.28449 17 2.04905 16.7198 2.10259 16.4138L2.27759 15.4138C2.31946 15.1746 2.52722 15 2.77011 15H6.35001L7.41001 9H4.00511C3.69449 9 3.45905 8.71977 3.51259 8.41381L3.68759 7.41381C3.72946 7.17456 3.93722 7 4.18011 7H7.76001L8.39677 3.41262C8.43914 3.17391 8.64664 3 8.88907 3H9.87344C10.1845 3 10.4201 3.28107 10.3657 3.58738L9.76001 7H15.76L16.3968 3.41262C16.4391 3.17391 16.6466 3 16.8891 3H17.8734C18.1845 3 18.4201 3.28107 18.3657 3.58738L17.76 7H21.1649C21.4755 7 21.711 7.28023 21.6574 7.58619L21.4824 8.58619C21.4406 8.82544 21.2328 9 20.9899 9H17.41L16.35 15H19.7549C20.0655 15 20.301 15.2802 20.2474 15.5862L20.0724 16.5862C20.0306 16.8254 19.8228 17 19.5799 17H16L15.3632 20.5874C15.3209 20.8261 15.1134 21 14.8709 21H13.8866C13.5755 21 13.3399 20.7189 13.3943 20.4126L14 17H8.00001L7.36325 20.5874C7.32088 20.8261 7.11337 21 6.87094 21H5.88657ZM9.41045 9L8.35045 15H14.3504L15.4104 9H9.41045Z',
                                  VOICE: 'M11.383 3.07904C11.009 2.92504 10.579 3.01004 10.293 3.29604L6 8.00204H3C2.45 8.00204 2 8.45304 2 9.00204V15.002C2 15.552 2.45 16.002 3 16.002H6L10.293 20.71C10.579 20.996 11.009 21.082 11.383 20.927C11.757 20.772 12 20.407 12 20.002V4.00204C12 3.59904 11.757 3.23204 11.383 3.07904ZM14 5.00195V7.00195C16.757 7.00195 19 9.24595 19 12.002C19 14.759 16.757 17.002 14 17.002V19.002C17.86 19.002 21 15.863 21 12.002C21 8.14295 17.86 5.00195 14 5.00195ZM14 9.00195C15.654 9.00195 17 10.349 17 12.002C17 13.657 15.654 15.002 14 15.002V13.002C14.551 13.002 15 12.553 15 12.002C15 11.451 14.551 11.002 14 11.002V9.00195Z',
                                  PLUGIN: 'M21.143 11.429h-1.714V6.857a2.292 2.292 0 00-2.286-2.286H12.57V2.857a2.858 2.858 0 00-5.714 0v1.714H2.286A2.283 2.283 0 00.01 6.857V11.2h1.703A3.087 3.087 0 014.8 14.286a3.087 3.087 0 01-3.086 3.085H0v4.343A2.292 2.292 0 002.286 24h4.343v-1.714A3.087 3.087 0 019.714 19.2a3.087 3.087 0 013.086 3.086V24h4.343a2.292 2.292 0 002.286-2.286v-4.571h1.714a2.858 2.858 0 000-5.714z',
                                  THEME: 'M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12c1.107 0 2-.893 2-2 0-.52-.2-.987-.52-1.347a2.003 2.003 0 01-.507-1.32c0-1.106.894-2 2-2h2.36A6.67 6.67 0 0024 10.667C24 4.773 18.627 0 12 0zM4.667 12c-1.107 0-2-.893-2-2s.893-2 2-2c1.106 0 2 .893 2 2s-.894 2-2 2zm4-5.333c-1.107 0-2-.894-2-2 0-1.107.893-2 2-2 1.106 0 2 .893 2 2 0 1.106-.894 2-2 2zm6.666 0c-1.106 0-2-.894-2-2 0-1.107.894-2 2-2 1.107 0 2 .893 2 2 0 1.106-.893 2-2 2zm4 5.333c-1.106 0-2-.893-2-2s.894-2 2-2c1.107 0 2 .893 2 2s-.893 2-2 2z',
                                  DM: 'M4.79805 3C3.80445 3 2.99805 3.8055 2.99805 4.8V15.6C2.99805 16.5936 3.80445 17.4 4.79805 17.4H7.49805V21L11.098 17.4H19.198C20.1925 17.4 20.998 16.5936 20.998 15.6V4.8C20.998 3.8055 20.1925 3 19.198 3H4.79805Z',
                                  LEAVE_VOICE: 'M21.1169 1.11603L22.8839 2.88403L19.7679 6.00003L22.8839 9.11603L21.1169 10.884L17.9999 7.76803L14.8839 10.884L13.1169 9.11603L16.2329 6.00003L13.1169 2.88403L14.8839 1.11603L17.9999 4.23203L21.1169 1.11603ZM18 22H13C6.925 22 2 17.075 2 11V6C2 5.447 2.448 5 3 5H7C7.553 5 8 5.447 8 6V10C8 10.553 7.553 11 7 11H6C6.063 14.938 9 18 13 18V17C13 16.447 13.447 16 14 16H18C18.553 16 19 16.447 19 17V21C19 21.553 18.553 22 18 22Z',
                                  HELP: 'M12 2C6.486 2 2 6.487 2 12C2 17.515 6.486 22 12 22C17.514 22 22 17.515 22 12C22 6.487 17.514 2 12 2ZM12 18.25C11.31 18.25 10.75 17.691 10.75 17C10.75 16.31 11.31 15.75 12 15.75C12.69 15.75 13.25 16.31 13.25 17C13.25 17.691 12.69 18.25 12 18.25ZM13 13.875V15H11V12H12C13.104 12 14 11.103 14 10C14 8.896 13.104 8 12 8C10.896 8 10 8.896 10 10H8C8 7.795 9.795 6 12 6C14.205 6 16 7.795 16 10C16 11.861 14.723 13.429 13 13.875Z',
                              };

                              return React.createElement('svg', {
                                  width: '24',
                                  height: '24',
                                  viewBox: '0 0 24 24',
                                  style: {
                                      margin: '6px',
                                  },
                                  children: [
                                      React.createElement('path', {
                                          fill: 'currentColor',
                                          d: paths[type],
                                      }),
                                  ],
                              });
                          };

                          this.COMMAND_TYPES = {
                              0: () => this.showHelpModal(),
                              1: (data) => NavigationUtils.transitionTo(`/channels/${data.gID}/${data.cID}`), // Channel
                              2: (data) => ChannelActions.selectVoiceChannel(data.cID), // Voice Channel
                              3: (data) => BdApi.Plugins.toggle(data.pID), // Plugin
                              4: (data) => BdApi.Themes.toggle(data.tID), // Theme
                          };

                          this.listener = (e) => {
                              if (e.keyCode == 27) return this.closePalette();
                              if (this.disableListener) return;
                              switch (e.code) {
                                  case 'ShiftLeft':
                                      if (this.keybuffer[this.keybuffer.length - 1] == 160) return;
                                      this.keybuffer.push(160);
                                      break;
                                  case 'ShiftRight':
                                      if (this.keybuffer[this.keybuffer.length - 1] == 161) return;
                                      this.keybuffer.push(161);
                                      break;
                                  case 'ControlLeft':
                                      if (this.keybuffer[this.keybuffer.length - 1] == 162) return;
                                      this.keybuffer.push(162);
                                      break;
                                  case 'ControlRight':
                                      if (this.keybuffer[this.keybuffer.length - 1] == 163) return;
                                      this.keybuffer.push(163);
                                      break;
                                  case 'AltLeft':
                                      if (this.keybuffer[this.keybuffer.length - 1] == 164) return;
                                      this.keybuffer.push(164);
                                      break;
                                  case 'AltRight':
                                      if (this.keybuffer[this.keybuffer.length - 1] == 165) return;
                                      this.keybuffer.push(165);
                                      break;
                                  default:
                                      if (this.keybuffer[this.keybuffer.length - 1] == e.keyCode) return;
                                      this.keybuffer.push(e.keyCode);
                              }

                              if (this.keybuffer.length > 10) this.keybuffer.shift();
                              if (JSON.stringify(this.keybuffer.slice(-this.settings.keybind.length)) == JSON.stringify(this.settings.keybind)) this.openPalette();
                          };
                      }

                      async onStart() {
                          PluginUtilities.addStyle(this.getName(), css);
                          document.addEventListener('keydown', this.listener, true);

                          // Load settings again as it messes up sometimes
                          await new Promise((r) => {
                              require('fs').readFile(require('path').join(BdApi.Plugins.folder, 'DiscordCommandPalette.config.json'), 'utf8', (err, data) => {
                                  if (err) return r();
                                  this.settings = JSON.parse(data).settings;
                                  r();
                              });
                          });

                          this.cacheCommands();

                          if (!document.querySelector(`#DiscordCommandPaletteWrapper`)) {
                              const CommandPaletterWrapper = document.createElement('div');
                              CommandPaletterWrapper.id = `DiscordCommandPaletteWrapper`;
                              document.body.appendChild(CommandPaletterWrapper);
                          }
                      }

                      onStop() {
                          this.domObserver?.unsubscribeAll();
                          document.removeEventListener('keydown', this.listener, true);

                          document.querySelector(`#DiscordCommandPaletteWrapper`)?.remove();
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

                      getSettingsPanel() {
                          class PlugdisableListener extends React.Component {
                              constructor(props) {
                                  super(props);
                                  this.plugin = this.props.plugin;
                                  this.state = this.plugin.settings;
                              }

                              componentDidMount() {
                                  this.plugin.disableListener = true;
                              }

                              componentDidUpdate() {
                                  this.plugin.saveSettings();
                              }

                              componentWillUnmount() {
                                  this.plugin.disableListener = false;
                              }

                              render() {
                                  console.log(this.state);
                                  const KeybindInput = React.createElement(Keybind, {
                                      defaultValue: this.state.keybind.map((a) => [0, a || 0, 1]),
                                      onChange: (e) => {
                                          this.plugin.settings.keybind = e.map((a) => a[1]);
                                          this.setState({ keybind: e.map((a) => a[1]) });
                                      },
                                  });

                                  return React.createElement('div', { children: [KeybindInput] });
                              }
                          }

                          return React.createElement(PlugdisableListener, { plugin: this });
                      }

                      cacheCommands() {
                          const GUILDS = GuildStore.getGuilds();
                          const PLUGINS = BdApi.Plugins.getAll();
                          const THEMES = BdApi.Themes.getAll();
                          const DMs = ChannelStore.getSortedPrivateChannels()
                              .filter((c) => c.type === 1)
                              .map((c) => {
                                  return {
                                      id: c.id,
                                      recipient: c.rawRecipients.map((r) => {
                                          return {
                                              id: r.id,
                                              username: r.username,
                                              discriminator: r.discriminator,
                                          };
                                      })[0],
                                  };
                              });
                          const GDMs = ChannelStore.getSortedPrivateChannels()
                              .filter((c) => c.type === 3)
                              .map((c) => {
                                  return {
                                      id: c.id,
                                      name: c.name,
                                      recipients: c.rawRecipients.map((r) => {
                                          return {
                                              id: r.id,
                                              username: r.username,
                                              discriminator: r.discriminator,
                                          };
                                      }),
                                  };
                              });

                          let CHANNELS = [];

                          Object.keys(GUILDS).forEach((g) => {
                              const guildChannels = GuildChannelsStore.getChannels(g);
                              CHANNELS.push({
                                  guild: {
                                      id: g,
                                      name: GUILDS[g].name,
                                  },
                                  channels: {
                                      text: guildChannels.SELECTABLE?.map((c) => {
                                          return {
                                              id: c.channel.id,
                                              name: c.channel.name,
                                          };
                                      }),
                                      voice: guildChannels.VOCAL?.map((c) => {
                                          return {
                                              id: c.channel.id,
                                              name: c.channel.name,
                                          };
                                      }),
                                  },
                              });
                          });

                          this.chachedCommands = [
                              {
                                  label: 'Plugin Help',
                                  alias: `
                        DiscordCommandPalette Help
                        Discord Command Palette Help
                    `,
                                  type: 0,
                                  icon: 'HELP',
                              },
                              ...DMs.map((dm) => {
                                  let aliasString = `
                        Open dm with ${dm.recipient.username}#${dm.recipient.discriminator}
                        DM ${dm.recipient.username}#${dm.recipient.discriminator}
                    `;
                                  return {
                                      label: `Open direct message with ${dm.recipient.username}#${dm.recipient.discriminator}`,
                                      alias: `${aliasString} ${aliasString.normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`,
                                      type: 1,
                                      data: {
                                          gID: '@me',
                                          cID: dm.id,
                                      },
                                      icon: 'DM',
                                  };
                              }),
                              ...GDMs.map((dm) => {
                                  let aliasString = `
                        Open group messages ${dm.name ? `in ${dm.name}` : `with ${dm.recipients.map((r) => `${r.username}#${r.discriminator}`).join(', ')}`}
                        Open gdm ${dm.name ? `in ${dm.name}` : `with ${dm.recipients.map((r) => `${r.username}#${r.discriminator}`).join(', ')}`}
                        Open gdm ${dm.name ? `in ${dm.name}` : `with ${dm.recipients.map((r) => r.username).join(', ')}`}
                        GDM ${dm.name ? dm.name : dm.recipients.map((r) => `${r.username}#${r.discriminator}`).join(', ')}}
                        GDM ${dm.name ? dm.name : dm.recipients.map((r) => `${r.username}#${r.discriminator}`).join(', ')}}
                        DM ${dm.name ? dm.name : dm.recipients.map((r) => r.username).join(', ')}}
                        DM ${dm.name ? dm.name : dm.recipients.map((r) => r.username).join(', ')}}
                    `;
                                  return {
                                      label: `Open group messages ${dm.name ? `in ${dm.name} (${dm.recipients.map((r) => r.username).join(', ')})` : `with ${dm.recipients.map((r) => r.username).join(', ')}`}`,
                                      alias: `${aliasString} ${aliasString.normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`,
                                      type: 1,
                                      data: {
                                          gID: '@me',
                                          cID: dm.id,
                                      },
                                      icon: 'DM',
                                  };
                              }),
                              ...PLUGINS.filter((p) => p.name != this.getName()).map((p) => {
                                  return {
                                      label: `Toggle plugin ${p.id}`,
                                      type: 3,
                                      data: {
                                          pID: p.id,
                                      },
                                      icon: 'PLUGIN',
                                  };
                              }),
                              ...THEMES.map((t) => {
                                  return {
                                      label: `Toggle theme ${t.id}`,
                                      type: 4,
                                      data: {
                                          tID: t.id,
                                      },
                                      icon: 'THEME',
                                  };
                              }),
                              ...CHANNELS.map((g) => {
                                  return [
                                      ...g.channels.text.map((c) => {
                                          let aliasString = `
                                Switch to ${c.name.replace(/-/g, ' ')} in ${g.guild.name}
                                #${c.name}
                                #${c.name.replace(/-/g, ' ')}
                            `;
                                          return {
                                              label: `Switch to ${c.name} in ${g.guild.name}`,
                                              alias: `${aliasString} ${aliasString.normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`,
                                              type: 1,
                                              data: {
                                                  gID: g.guild.id,
                                                  cID: c.id,
                                              },
                                              icon: 'CHANNEL',
                                          };
                                      }),
                                      ...g.channels.voice.map((c) => {
                                          return {
                                              label: `Join ${c.name} in ${g.guild.name}`,
                                              type: 2,
                                              data: {
                                                  cID: c.id,
                                              },
                                              icon: 'VOICE',
                                          };
                                      }),
                                  ];
                              }).flat(),
                              {
                                  label: `Disconnect from voice channel`,
                                  alias: `
                        Leave voice channel
                        Disconnect
                        DC
                    `,
                                  type: 2,
                                  data: {
                                      cID: null,
                                  },
                                  icon: 'LEAVE_VOICE',
                              },
                          ];
                      }

                      showHelpModal() {
                          Modals.showModal(
                              'DiscordCommandPalette Help',
                              [
                                  React.createElement('div', {
                                      className: 'command-palette-help',
                                      children: [
                                          React.createElement('span', { className: 'command-palette-help-title' }, 'Messages and Channels'),
                                          React.createElement('span', { className: 'command-palette-help-item' }, '• You can switch to a DM by typing "Open DM with Username".'),
                                          React.createElement('span', { className: 'command-palette-help-item' }, '• You can also switch to a DM by typing "DM Username".'),
                                          React.createElement('span', { className: 'command-palette-help-item' }, ' '),
                                          React.createElement('span', { className: 'command-palette-help-item' }, '• You can switch to a group DM by typing "Open Group Messages with Usernames".'),
                                          React.createElement('span', { className: 'command-palette-help-item' }, '• You can also switch to a group DM by typing "GDM Usernames".'),
                                          React.createElement('span', { className: 'command-palette-help-item' }, ' '),
                                          React.createElement('span', { className: 'command-palette-help-item' }, '• You can switch to a channel by typing "Switch to ChannelName in ServerName".'),
                                          React.createElement('span', { className: 'command-palette-help-item' }, '• You can also switch to a channel by typing "#ChannelName".'),
                                          React.createElement('span', { className: 'command-palette-help-item' }, ' '),

                                          React.createElement('span', { className: 'command-palette-help-title' }, 'Voice'),
                                          React.createElement('span', { className: 'command-palette-help-item' }, '• You can join a voice channel by typing "Join ChannelName in ServerName".'),
                                          React.createElement('span', { className: 'command-palette-help-item' }, '• You can disconnect from a voice channel by typing "Disconnect from voice channel".'),
                                          React.createElement('span', { className: 'command-palette-help-item' }, ' '),

                                          React.createElement('span', { className: 'command-palette-help-title' }, 'Plugins and Themes'),
                                          React.createElement('span', { className: 'command-palette-help-item' }, '• You can toggle a plugin by typing "Toggle plugin PluginName".'),
                                          React.createElement('span', { className: 'command-palette-help-item' }, '• You can toggle a theme by typing "Toggle theme ThemeName".'),
                                          React.createElement('span', { className: 'command-palette-help-item' }, ' '),
                                      ],
                                  }),
                              ],
                              {
                                  confirmText: 'Cool!',
                                  cancelText: '',
                              }
                          );
                      }

                      addRecentCommand(command) {
                          if (this.settings.recentCommands.includes(command.label)) this.settings.recentCommands.splice(this.settings.recentCommands.indexOf(command.label), 1);

                          this.settings.recentCommands.unshift(command.label);
                          if (this.settings.recentCommands.length > 10) this.settings.recentCommands.pop();
                          this.saveSettings();
                      }

                      openPalette() {
                          class CommandPalette extends React.Component {
                              constructor(props) {
                                  super(props);
                                  this.plugin = this.props.plugin;
                                  this.state = {
                                      command: '',
                                      regex: new RegExp('', 'ig'),
                                      highlightRegex: new RegExp('', 'ig'),
                                      hoveredCommand: 1,
                                      suggestions: [...this.plugin.settings.recentCommands.map((rc) => this.plugin.chachedCommands.filter((c) => c.label === rc)[0]), ...this.plugin.chachedCommands.filter((c) => !this.plugin.settings.recentCommands.includes(c.label))],
                                  };

                                  this.commandInput = React.createRef();
                              }

                              componentDidMount() {
                                  this.plugin.disableListener = true;
                                  this.commandInput.current.focus();
                                  setImmediate(() => {
                                      this.setState({ command: '' });
                                  });
                              }

                              componentDidUpdate(prevProps, prevState) {
                                  if (prevState.command !== this.state.command) {
                                      let rexp = this.state.command.toLowerCase();
                                      if (rexp[0] === '#') rexp = rexp.substring(1);
                                      rexp = rexp.split(' ').join('|').split('-').join('|');
                                      this.setState({ regex: new RegExp(this.state.command.toLowerCase(), 'ig'), highlightRegex: new RegExp(rexp, 'ig'), hoveredCommand: 1 });
                                      if (
                                          this.state.suggestions
                                              .filter((c) => {
                                                  return c.label.match(this.state.regex) || c.alias?.match(this.state.regex);
                                              })
                                              .slice(0, 10).length === 0
                                      )
                                          this.setState({ hoveredCommand: 0 });
                                  }
                              }

                              componentWillUnmount() {
                                  this.plugin.disableListener = false;
                              }

                              render() {
                                  return React.createElement('div', {
                                      children: [
                                          React.createElement('div', {
                                              className: 'command-palette-input-wrapper',
                                              children: [
                                                  React.createElement('span', null, '>'),
                                                  React.createElement('input', {
                                                      type: 'text',
                                                      className: 'command-palette-input',
                                                      placeholder: 'Type a command...',
                                                      value: this.state.command,
                                                      ref: this.commandInput,
                                                      onChange: (e) => {
                                                          this.setState({ command: e.target.value });
                                                      },
                                                      onKeyDown: (e) => {
                                                          switch (e.key) {
                                                              case 'ArrowUp':
                                                                  if (this.state.hoveredCommand > 0) this.setState({ hoveredCommand: this.state.hoveredCommand - 1 });
                                                                  break;
                                                              case 'ArrowDown':
                                                                  if (this.state.hoveredCommand < 10) this.setState({ hoveredCommand: this.state.hoveredCommand + 1 });
                                                                  break;
                                                          }
                                                      },
                                                      onKeyUp: (e) => {
                                                          switch (e.key) {
                                                              case 'Enter':
                                                                  if (this.state.hoveredCommand != 0) {
                                                                      let command = this.state.suggestions
                                                                          .filter((c) => {
                                                                              return c.label.match(this.state.regex) || c.alias?.match(this.state.regex);
                                                                          })
                                                                          .slice(0, 10)[this.state.hoveredCommand - 1];
                                                                      if (!command) return;
                                                                      this.plugin.COMMAND_TYPES[command.type](command.data);
                                                                      this.plugin.addRecentCommand(command);
                                                                      this.plugin.closePalette();
                                                                  }
                                                                  break;
                                                          }
                                                      },
                                                  }),
                                              ],
                                          }),
                                          this.state.suggestions.length > 0
                                              ? React.createElement('div', {
                                                    className: 'command-palette-suggestions',
                                                    children: this.state.suggestions
                                                        .filter((c) => {
                                                            return c.label.match(this.state.regex) || c.alias?.match(this.state.regex);
                                                        })
                                                        .slice(0, 10)
                                                        .map((s, i) => {
                                                            return React.createElement('div', {
                                                                className: `command-palette-suggestion ${i + 1 === this.state.hoveredCommand ? 'hovered' : ''}`,
                                                                children: [
                                                                    this.plugin.getIcon(s.icon),
                                                                    React.createElement('span', {
                                                                        dangerouslySetInnerHTML: {
                                                                            __html: s.label.replace(this.state.highlightRegex, (match) => {
                                                                                return `<span class="command-palette-suggestion-match">${match}</span>`;
                                                                            }),
                                                                        },
                                                                    }),
                                                                ],
                                                                onClick: () => {
                                                                    this.plugin.COMMAND_TYPES[s.type](s.data);
                                                                    this.plugin.addRecentCommand(s);
                                                                    this.plugin.closePalette();
                                                                },
                                                            });
                                                        }),
                                                })
                                              : null,
                                      ],
                                  });
                              }
                          }

                          ReactDOM.render(
                              React.createElement('div', {
                                  className: 'command-palette-bg',
                                  children: React.createElement(CommandPalette, { plugin: this }),
                                  onClick: (e) => {
                                      if (e.target.classList.contains('command-palette-bg')) this.closePalette();
                                  },
                              }),
                              document.querySelector(`#DiscordCommandPaletteWrapper`)
                          );
                      }

                      closePalette() {
                          ReactDOM.unmountComponentAtNode(document.querySelector(`#DiscordCommandPaletteWrapper`));
                          this.keybuffer = [];
                      }
                  };
              };
              return plugin(Plugin, Api);
          })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
