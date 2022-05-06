/**
 * @name DiscordCommandPalette
 * @version 1.0.0
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
    const config = { info: { name: 'DiscordCommandPalette', version: '1.0.0', description: 'Add a command palette to discord.', author: 'Taimoor', authorId: '220161488516546561', authorLink: 'https://github.com/Taimoor-Tariq', source: 'https://github.com/Taimoor-Tariq/BetterDiscordStuff/blob/main/Plugins/DiscordCommandPalette/DiscordCommandPalette.plugin.js', github_raw: 'https://raw.githubusercontent.com/Taimoor-Tariq/BetterDiscordStuff/main/Plugins/DiscordCommandPalette/DiscordCommandPalette.plugin.js', donate: 'https://ko-fi.com/TaimoorTariq', authors: [{ name: 'Taimoor', discord_id: '220161488516546561' }] }, main: 'index.js' };

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
                      DiscordModules: { React, ReactDOM, GuildChannelsStore, GuildStore, Keybind, NavigationUtils, ChannelActions },
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
                                  1: 'M5.88657 21C5.57547 21 5.3399 20.7189 5.39427 20.4126L6.00001 17H2.59511C2.28449 17 2.04905 16.7198 2.10259 16.4138L2.27759 15.4138C2.31946 15.1746 2.52722 15 2.77011 15H6.35001L7.41001 9H4.00511C3.69449 9 3.45905 8.71977 3.51259 8.41381L3.68759 7.41381C3.72946 7.17456 3.93722 7 4.18011 7H7.76001L8.39677 3.41262C8.43914 3.17391 8.64664 3 8.88907 3H9.87344C10.1845 3 10.4201 3.28107 10.3657 3.58738L9.76001 7H15.76L16.3968 3.41262C16.4391 3.17391 16.6466 3 16.8891 3H17.8734C18.1845 3 18.4201 3.28107 18.3657 3.58738L17.76 7H21.1649C21.4755 7 21.711 7.28023 21.6574 7.58619L21.4824 8.58619C21.4406 8.82544 21.2328 9 20.9899 9H17.41L16.35 15H19.7549C20.0655 15 20.301 15.2802 20.2474 15.5862L20.0724 16.5862C20.0306 16.8254 19.8228 17 19.5799 17H16L15.3632 20.5874C15.3209 20.8261 15.1134 21 14.8709 21H13.8866C13.5755 21 13.3399 20.7189 13.3943 20.4126L14 17H8.00001L7.36325 20.5874C7.32088 20.8261 7.11337 21 6.87094 21H5.88657ZM9.41045 9L8.35045 15H14.3504L15.4104 9H9.41045Z',
                                  2: 'M11.383 3.07904C11.009 2.92504 10.579 3.01004 10.293 3.29604L6 8.00204H3C2.45 8.00204 2 8.45304 2 9.00204V15.002C2 15.552 2.45 16.002 3 16.002H6L10.293 20.71C10.579 20.996 11.009 21.082 11.383 20.927C11.757 20.772 12 20.407 12 20.002V4.00204C12 3.59904 11.757 3.23204 11.383 3.07904ZM14 5.00195V7.00195C16.757 7.00195 19 9.24595 19 12.002C19 14.759 16.757 17.002 14 17.002V19.002C17.86 19.002 21 15.863 21 12.002C21 8.14295 17.86 5.00195 14 5.00195ZM14 9.00195C15.654 9.00195 17 10.349 17 12.002C17 13.657 15.654 15.002 14 15.002V13.002C14.551 13.002 15 12.553 15 12.002C15 11.451 14.551 11.002 14 11.002V9.00195Z',
                                  3: 'M21.143 11.429h-1.714V6.857a2.292 2.292 0 00-2.286-2.286H12.57V2.857a2.858 2.858 0 00-5.714 0v1.714H2.286A2.283 2.283 0 00.01 6.857V11.2h1.703A3.087 3.087 0 014.8 14.286a3.087 3.087 0 01-3.086 3.085H0v4.343A2.292 2.292 0 002.286 24h4.343v-1.714A3.087 3.087 0 019.714 19.2a3.087 3.087 0 013.086 3.086V24h4.343a2.292 2.292 0 002.286-2.286v-4.571h1.714a2.858 2.858 0 000-5.714z',
                                  4: 'M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12c1.107 0 2-.893 2-2 0-.52-.2-.987-.52-1.347a2.003 2.003 0 01-.507-1.32c0-1.106.894-2 2-2h2.36A6.67 6.67 0 0024 10.667C24 4.773 18.627 0 12 0zM4.667 12c-1.107 0-2-.893-2-2s.893-2 2-2c1.106 0 2 .893 2 2s-.894 2-2 2zm4-5.333c-1.107 0-2-.894-2-2 0-1.107.893-2 2-2 1.106 0 2 .893 2 2 0 1.106-.894 2-2 2zm6.666 0c-1.106 0-2-.894-2-2 0-1.107.894-2 2-2 1.107 0 2 .893 2 2 0 1.106-.893 2-2 2zm4 5.333c-1.106 0-2-.893-2-2s.894-2 2-2c1.107 0 2 .893 2 2s-.893 2-2 2z',
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
                              1: (data) => NavigationUtils.transitionTo(`/channels/${data.gID}/${data.cID}`),
                              2: (data) => ChannelActions.selectVoiceChannel(data.cID),
                              3: (data) => BdApi.Plugins.toggle(data.pID),
                              4: (data) => BdApi.Themes.toggle(data.tID),
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

                          this.cacheChannelsAndAddons();

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

                      cacheChannelsAndAddons() {
                          const GUILDS = GuildStore.getGuilds();
                          const PLUGINS = BdApi.Plugins.getAll();
                          const THEMES = BdApi.Themes.getAll();

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
                              ...PLUGINS.filter((p) => p.name != this.getName()).map((p) => {
                                  return {
                                      label: `Toggle plugin ${p.id}`,
                                      type: 3,
                                      data: {
                                          pID: p.id,
                                      },
                                  };
                              }),
                              ...THEMES.map((t) => {
                                  return {
                                      label: `Toggle theme ${t.id}`,
                                      type: 4,
                                      data: {
                                          tID: t.id,
                                      },
                                  };
                              }),
                              ...CHANNELS.map((g) => {
                                  return [
                                      ...g.channels.text.map((c) => {
                                          return {
                                              label: `Switch to ${c.name} in ${g.guild.name}`,
                                              type: 1,
                                              data: {
                                                  gID: g.guild.id,
                                                  cID: c.id,
                                              },
                                          };
                                      }),
                                      ...g.channels.voice.map((c) => {
                                          return {
                                              label: `Join ${c.name} in ${g.guild.name}`,
                                              type: 2,
                                              data: {
                                                  cID: c.id,
                                              },
                                          };
                                      }),
                                  ];
                              }).flat(),
                          ];
                      }

                      addRecentCommand(command) {
                          if (this.settings.recentCommands.includes(command)) this.settings.recentCommands.splice(this.settings.recentCommands.indexOf(command), 1);

                          this.settings.recentCommands.unshift(command);
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
                                      hoveredCommand: 0,
                                      suggestions: [
                                          ...this.plugin.settings.recentCommands,
                                          ...this.plugin.chachedCommands.filter((c) => {
                                              let flag = true;
                                              this.plugin.settings.recentCommands.forEach((r) => {
                                                  if (r.label === c.label) flag = false;
                                              });
                                              return flag;
                                          }),
                                      ],
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
                                      this.setState({ regex: new RegExp(this.state.command.toLowerCase(), 'ig'), hoveredCommand: 1 });
                                      if (
                                          this.state.suggestions
                                              .filter((c) => {
                                                  return c.label.match(this.state.regex);
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
                                                              case 'Enter':
                                                                  if (this.state.hoveredCommand != 0) {
                                                                      let command = this.state.suggestions
                                                                          .filter((c) => {
                                                                              return c.label.match(this.state.regex);
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
                                                            return c.label.match(this.state.regex);
                                                        })
                                                        .slice(0, 10)
                                                        .map((s, i) => {
                                                            return React.createElement('div', {
                                                                className: `command-palette-suggestion ${i + 1 === this.state.hoveredCommand ? 'hovered' : ''}`,
                                                                children: [
                                                                    this.plugin.getIcon(s.type),
                                                                    React.createElement('span', {
                                                                        dangerouslySetInnerHTML: {
                                                                            __html: s.label.replace(this.state.regex, (match) => {
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
                          ReactDOM.render(React.createElement(React.Fragment), document.querySelector(`#DiscordCommandPaletteWrapper`));
                          this.keybuffer = [];
                      }
                  };
              };
              return plugin(Plugin, Api);
          })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
