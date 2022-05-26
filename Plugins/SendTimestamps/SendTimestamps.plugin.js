/**
 * @name SendTimestamps
 * @version 2.1.6
 * @description Send timestamps in your messages easily by adding them in {{...}} or using the button.
 * @author Taimoor
 * @authorId 220161488516546561
 * @authorLink https://github.com/Taimoor-Tariq
 * @source https://github.com/Taimoor-Tariq/BetterDiscordStuff/blob/main/Plugins/SendTimestamps/SendTimestamps.plugin.js
 * @github_raw https://raw.githubusercontent.com/Taimoor-Tariq/BetterDiscordStuff/main/Plugins/SendTimestamps/SendTimestamps.plugin.js
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
        info: { name: 'SendTimestamps', version: '2.1.6', description: 'Send timestamps in your messages easily by adding them in {{...}} or using the button.', author: 'Taimoor', authorId: '220161488516546561', authorLink: 'https://github.com/Taimoor-Tariq', source: 'https://github.com/Taimoor-Tariq/BetterDiscordStuff/blob/main/Plugins/SendTimestamps/SendTimestamps.plugin.js', github_raw: 'https://raw.githubusercontent.com/Taimoor-Tariq/BetterDiscordStuff/main/Plugins/SendTimestamps/SendTimestamps.plugin.js', donate: 'https://ko-fi.com/TaimoorTariq', authors: [{ name: 'Taimoor', discord_id: '220161488516546561' }] },
        changelog: [
            { title: 'v2.1.6 - Bug Fixes', items: ['Fixed seconds reseting to 00.'] },
            { title: 'v2.1.5 - Improvements and Bug Fixes', type: 'improved', items: ['Timestamp format dropdowns now also show up for the `<t:xxxxxxxxxx:f>` format!', 'Fixed options not working when editing messages.'] },
            { title: 'v2.1.4 - Bug Fixes', type: 'improved', items: ['Plugin now properly remembers last used timestamp fromat.', 'Fixed relative time not swoing right time in modal.', 'Fixed attach-menu hover errors.', 'Fixed typos in changelog.'] },
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
                      Modals,
                      DOMTools,
                      WebpackModules,
                      DiscordModules: { React, MessageActions, Slider, Dropdown, SwitchRow, UserSettingsStore },
                  } = Api;
                  const ComponentDispatch = WebpackModules.getByProps('ComponentDispatch').ComponentDispatch;
                  const ComponentActions = WebpackModules.getByProps('ComponentActions').ComponentActions;
                  const PermissionStore = BdApi.findModuleByProps('Permissions', 'ActivityTypes').Permissions;
                  const css = `.timestamp-button {
    margin-top: 4px;
    max-height: 40px;
    justify-content: center;
    background-color: transparent;
}

.timestamp-button button {
    min-height: 32px;
    min-width: 32px;
    background-color: transparent;
}
.timestamp-button svg {
    width: 20px;
    height: 20px;
    color: var(--interactive-normal);
}
.timestamp-button svg:hover {
    color: var(--interactive-hover);
}

.channel-attach-button {
    display: flex;
    margin-right: 8px;
}

.channel-attach-button .attachButton-_ACFSu {
    padding: 10px 4px;
}

.timestamp-input-label {
    font-size: 16px;
    color: var(--text-normal);
    margin-left: 4px;
}

.timestamp-input {
    font-size: 16px;
    box-sizing: border-box;
    width: 100%;
    border-radius: 3px;
    color: var(--text-normal);
    background-color: var(--deprecated-text-input-bg);
    border: 1px solid var(--deprecated-text-input-border);
    transition: border-color 0.2s ease-in-out;
    padding: 10px;
    margin: 8px 0 12px 0px;
}

.timestamp-input-dropdown {
    font-size: 16px;
    border-radius: 3px;
    color: var(--text-normal);
    background-color: var(--deprecated-text-input-bg);
    border: 1px solid var(--deprecated-text-input-border);
    transition: border-color 0.2s ease-in-out;
    margin: 8px 0 12px 0px;
}

input::-webkit-calendar-picker-indicator {
    width: 16px;
    height: 16px;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    filter: invert(80%);
    cursor: pointer;
}

input[type='time']::-webkit-calendar-picker-indicator {
    background-image: url("data:image/svg+xml,%3Csvg role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='currentColor' d='M256,8C119,8,8,119,8,256S119,504,256,504,504,393,504,256,393,8,256,8Zm92.49,313h0l-20,25a16,16,0,0,1-22.49,2.5h0l-67-49.72a40,40,0,0,1-15-31.23V112a16,16,0,0,1,16-16h32a16,16,0,0,1,16,16V256l58,42.5A16,16,0,0,1,348.49,321Z'%3E%3C/path%3E%3C/svg%3E");
}
input[type='date']::-webkit-calendar-picker-indicator {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7v-5z'/%3E%3C/svg%3E");
}

.timestamp-formats-wrapper {
    position: absolute;
    top: 0;
    width: 90%;
}

.timestamp-formats-selector {
    position: absolute;
    bottom: 0;
    width: 100%;
    background-color: var(--background-tertiary);
    box-shadow: var(--elevation-high);
    color: var(--text-normal);
    border-radius: 5px;
    padding: 8px 12px;
}

.timestamp-formats-selects {
    display: flex;
    flex-direction: row;
    padding: 8px 12px;
    gap: 8px;
    flex-wrap: wrap;
}

.timestamp-formats-selects select {
    padding: 8px 12px;
    border-radius: 5px;
    border: 1px solid var(--background-secondary);
    background-color: var(--channeltextarea-background);
    color: var(--text-normal);
    font-size: 1rem;
    flex-grow: 1;
}
`;

                  const Button = WebpackModules.getByProps('Button').Button;

                  const canSendMessages = (channelId) => {
                      return BdApi.findModuleByProps('getChannelPermissions').canWithPartialContext(PermissionStore.SEND_MESSAGES, { channelId });
                  };

                  return class SendTimestamp extends Plugin {
                      constructor() {
                          super();

                          this.defaultSettings = {
                              buttonOnRight: true,
                              buttonIndex: 0,
                              chatButtonsLength: 1,
                              timestampFormat: 'f',
                              replaceInMessages: true,
                              showInAttachMenu: false,
                          };

                          this.forceOnRight = false;
                          this.locale = UserSettingsStore.locale;

                          this.sendFomrmatOptions = {
                              0: 'F',
                          };

                          this.replaceTextAreaText = (text) => {
                              ComponentDispatch.dispatchToLastSubscribed(ComponentActions.CLEAR_TEXT);
                              setImmediate(() => {
                                  ComponentDispatch.dispatchToLastSubscribed(ComponentActions.INSERT_TEXT, { content: text, plainText: text });
                              });
                          };
                      }

                      onStart() {
                          PluginUtilities.addStyle(this.getName(), css);
                          this.patchButton();
                          if (this.settings.replaceInMessages) this.patchMessageReplace();
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
                      }

                      getSettingsPanel() {
                          class PluginSettings extends React.Component {
                              constructor(props) {
                                  super(props);
                                  this.plugin = this.props.plugin;
                                  this.state = this.plugin.settings;
                              }

                              componentDidUpdate() {
                                  this.plugin.saveSettings();
                              }

                              render() {
                                  const ReplaceInMessages = React.createElement(
                                      SwitchRow,
                                      {
                                          value: this.state.replaceInMessages,
                                          onChange: (e) => {
                                              this.plugin.settings.replaceInMessages = e;
                                              this.setState({ replaceInMessages: e });
                                          },
                                          note: 'Enabling this option will convert all the date/time in you message before you send it. Example: "{{dec 2 2020}} or {{10:40am}}".',
                                      },
                                      'Replace on message send'
                                  );

                                  const ShowInAttachMenu = React.createElement('div', {
                                      children: [
                                          React.createElement(
                                              'span',
                                              {
                                                  className: 'title-2dsDLn',
                                                  style: {
                                                      marginTop: '-0.5rem',
                                                      marginBottom: '0.5rem',
                                                  },
                                              },
                                              'Button Location'
                                          ),
                                          React.createElement('div', {
                                              style: {
                                                  display: 'flex',
                                                  gap: '0.5rem',
                                              },
                                              children: [
                                                  React.createElement(
                                                      Button,
                                                      {
                                                          className: `${this.state.showInAttachMenu ? '' : Button.Colors.TRANSPARENT}`,
                                                          onClick: () => {
                                                              this.plugin.settings.showInAttachMenu = true;
                                                              this.setState({ showInAttachMenu: true });
                                                          },
                                                      },
                                                      'In attach menu'
                                                  ),
                                                  React.createElement(
                                                      Button,
                                                      {
                                                          className: `${this.state.showInAttachMenu ? Button.Colors.TRANSPARENT : ''}`,
                                                          onClick: () => {
                                                              this.plugin.settings.showInAttachMenu = false;
                                                              this.setState({ showInAttachMenu: false });
                                                          },
                                                      },
                                                      'In chatbar'
                                                  ),
                                              ],
                                          }),
                                          React.createElement('div', {
                                              className: 'divider-_0um2u dividerDefault-3C2-ws',
                                              style: {
                                                  marginBottom: '1rem',
                                              },
                                          }),
                                      ],
                                  });

                                  const ButtonInChat = React.createElement('div', {
                                      style: {
                                          display: `${this.state.showInAttachMenu ? 'none' : 'block'}`,
                                      },
                                      children: [
                                          React.createElement(
                                              SwitchRow,
                                              {
                                                  value: this.state.buttonOnRight,
                                                  onChange: (e) => {
                                                      this.plugin.settings.buttonOnRight = e;
                                                      this.setState({ buttonOnRight: e });
                                                  },
                                                  note: 'Enabling this option will put the button on the right side of the textarea.',
                                              },
                                              'Button on right'
                                          ),
                                          React.createElement(
                                              'span',
                                              {
                                                  className: 'title-2dsDLn',
                                                  style: {
                                                      marginTop: '-0.5rem',
                                                      marginBottom: '1.5rem',
                                                  },
                                              },
                                              'Button Postion from left (only works if button is on right)'
                                          ),
                                          React.createElement(Slider, {
                                              style: {
                                                  cursor: 'pointer',
                                              },
                                              initialValue: this.state.buttonIndex + 1,
                                              min: 0,
                                              max: this.state.chatButtonsLength - 1,
                                              onValueChange: (e) => {
                                                  this.plugin.settings.buttonIndex = e - 1;
                                                  this.setState({ buttonIndex: e - 1 });
                                              },
                                              markers: Array.apply(null, Array(this.state.chatButtonsLength)).map((_, i) => i + 1),
                                              stickToMarkers: true,
                                              disabled: !this.state.buttonOnRight,
                                          }),
                                      ],
                                  });

                                  return React.createElement('div', { children: [ReplaceInMessages, ShowInAttachMenu, ButtonInChat] });
                              }
                          }

                          return React.createElement(PluginSettings, { plugin: this });
                      }

                      showTimestampModal() {
                          const inputFormat = this.settings.timestampFormat;

                          const getRelativeTime = (timestamp) => {
                              const timeElapsed = timestamp - new Date(new Date().getTime() - new Date().getTimezoneOffset() * 180000);
                              const units = {
                                  year: 24 * 60 * 60 * 1000 * 365,
                                  month: (24 * 60 * 60 * 1000 * 365) / 12,
                                  day: 24 * 60 * 60 * 1000,
                                  hour: 60 * 60 * 1000,
                                  minute: 60 * 1000,
                                  second: 1000,
                              };

                              for (let u in units) if (Math.abs(timeElapsed) > units[u] || u == 'second') return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(Math.round(timeElapsed / units[u]), u);
                          };

                          const updateTimeFormat = (format) => {
                              this.settings.timestampFormat = format;
                              this.saveSettings();
                          };

                          const isValidDate = (d) => {
                              return d instanceof Date && !isNaN(d);
                          };

                          let inputTimestamp = new Date();

                          class TimestampModalBody extends React.Component {
                              constructor(props) {
                                  super(props);
                                  this.state = {
                                      timestamp: new Date(new Date(inputTimestamp).getTime() - new Date().getTimezoneOffset() * 60000),
                                      returnTimestamp: inputTimestamp,
                                      timestampFormat: inputFormat,

                                      formatOptions: [
                                          { value: 't', label: 'Short Time' },
                                          { value: 'T', label: 'Long Time' },
                                          { value: 'd', label: 'Short Date' },
                                          { value: 'D', label: 'Long Date' },
                                          { value: 'f', label: 'Short Date/Time' },
                                          { value: 'F', label: 'Long Date/Time' },
                                          { value: 'R', label: 'Relative Time' },
                                      ],
                                  };
                              }

                              componentDidMount() {
                                  this.updateFormatOptions();
                              }

                              componentDidUpdate(prevProps, prevState) {
                                  if (prevState.timestamp != this.state.timestamp) {
                                      inputTimestamp = this.state.returnTimestamp;
                                      this.updateFormatOptions();
                                  }
                              }

                              updateFormatOptions() {
                                  const time = new Date(new Date(this.state.timestamp).getTime() - new Date().getTimezoneOffset() * 2 * 60000);
                                  this.setState({
                                      formatOptions: [
                                          { value: 't', label: time.toLocaleString(undefined, { hour: '2-digit', minute: '2-digit' }).replace(' at', '') },
                                          { value: 'T', label: time.toLocaleString(undefined, { timeStyle: 'medium' }).replace(' at', '') },
                                          { value: 'd', label: time.toLocaleString(undefined, { dateStyle: 'short' }).replace(' at', '') },
                                          { value: 'D', label: time.toLocaleString(undefined, { dateStyle: 'long' }).replace(' at', '') },
                                          { value: 'f', label: time.toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' }).replace(' at', '') },
                                          { value: 'F', label: time.toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' }).replace(' at', '') },
                                          { value: 'R', label: getRelativeTime(time) },
                                      ],
                                  });
                              }

                              render() {
                                  const FormatDropdown = React.createElement('div', {
                                      className: 'timestamp-input-group',
                                      children: [
                                          React.createElement('label', {
                                              className: 'timestamp-input-label',
                                              children: 'Format',
                                          }),
                                          React.createElement('div', {
                                              className: 'timestamp-input-dropdown',
                                              children: [
                                                  React.createElement(Dropdown, {
                                                      onChange: (format) => {
                                                          this.setState({
                                                              timestampFormat: format,
                                                          });
                                                          updateTimeFormat(format);
                                                      },
                                                      value: this.state.timestampFormat,
                                                      options: this.state.formatOptions,
                                                  }),
                                              ],
                                          }),
                                      ],
                                  });

                                  const DatePicker = React.createElement('div', {
                                      className: 'timestamp-input-group',
                                      children: [
                                          React.createElement('label', {
                                              className: 'timestamp-input-label',
                                              children: 'Date',
                                          }),
                                          React.createElement('input', {
                                              className: 'timestamp-input',
                                              type: 'date',
                                              value: this.state.timestamp.toISOString().split('T')[0],
                                              onChange: (e) => {
                                                  const date = new Date(`${e.target.value}T${this.state.timestamp.toISOString().split('T')[1]}`);
                                                  if (isValidDate(date))
                                                      this.setState({
                                                          timestamp: date,
                                                          returnTimestamp: new Date(new Date(date).getTime() + new Date().getTimezoneOffset() * 60000),
                                                      });
                                              },
                                          }),
                                      ],
                                  });

                                  const TimePicker = React.createElement('div', {
                                      className: 'timestamp-input-group',
                                      children: [
                                          React.createElement('label', {
                                              className: 'timestamp-input-label',
                                              children: 'Time',
                                          }),
                                          React.createElement('input', {
                                              className: 'timestamp-input',
                                              type: 'time',
                                              value: this.state.timestamp.toISOString().split('T')[1].split('.')[0].split(':').slice(0, 2).join(':'),
                                              onChange: (e) => {
                                                  let date = new Date(`${this.state.timestamp.toISOString().split('T')[0]}T${e.target.value}:00.000Z`);
                                                  if (isValidDate(date))
                                                      this.setState({
                                                          timestamp: date,
                                                          returnTimestamp: new Date(new Date(date).getTime() + new Date().getTimezoneOffset() * 60000),
                                                      });
                                              },
                                          }),
                                      ],
                                  });

                                  return React.createElement('div', {
                                      children: [DatePicker, TimePicker, FormatDropdown],
                                  });
                              }
                          }

                          Modals.showModal('Select Date and Time', [React.createElement(TimestampModalBody)], {
                              confirmText: 'Enter',
                              onConfirm: () => {
                                  let ts_msg = `<t:${Math.floor(inputTimestamp.getTime() / 1000)}:${this.settings.timestampFormat}> `;

                                  ComponentDispatch.dispatchToLastSubscribed(ComponentActions.INSERT_TEXT, { content: ts_msg, plainText: ts_msg });
                              },
                          });
                      }

                      patchButton() {
                          const ChannelTextAreaButtons = WebpackModules.find((m) => m.type?.displayName === 'ChannelTextAreaButtons');
                          const ChannelTextAreaContainer = WebpackModules.find((m) => m?.type?.render?.displayName === 'ChannelTextAreaContainer')?.type;
                          const button = React.createElement(
                              'button',
                              {
                                  className: 'timestamp-button',
                                  type: 'button',
                                  onClick: () => {
                                      this.showTimestampModal();
                                  },
                              },
                              React.createElement(
                                  'svg',
                                  {
                                      role: 'img',
                                      xmlns: 'http://www.w3.org/2000/svg',
                                      viewBox: '0 0 512 512',
                                  },
                                  React.createElement('path', {
                                      fill: 'currentColor',
                                      d: 'M256,8C119,8,8,119,8,256S119,504,256,504,504,393,504,256,393,8,256,8Zm92.49,313h0l-20,25a16,16,0,0,1-22.49,2.5h0l-67-49.72a40,40,0,0,1-15-31.23V112a16,16,0,0,1,16-16h32a16,16,0,0,1,16,16V256l58,42.5A16,16,0,0,1,348.49,321Z',
                                  })
                              )
                          );

                          Patcher.before(ChannelTextAreaContainer, 'render', (_, [props]) => {
                              if (this.settings.showInAttachMenu) document.querySelector('.timestamp-button')?.remove();
                              const { channel } = props;

                              if (!this.settings.buttonOnRight && (canSendMessages(channel.id) || channel.type === 1) && !this.settings.showInAttachMenu) {
                                  if (!!props.renderAttachButton && props.renderAttachButton.length == 1) {
                                      this.forceOnRight = false;
                                      let attachButton = props.renderAttachButton();
                                      props.renderAttachButton = () => {
                                          return React.createElement('div', {
                                              className: 'channel-attach-button',
                                              children: [attachButton, button],
                                          });
                                      };
                                  } else this.forceOnRight = true;
                              }
                          });

                          Patcher.after(ChannelTextAreaButtons, 'type', (_, [props], ret) => {
                              if (this.settings.showInAttachMenu) document.querySelector('.timestamp-button')?.remove();
                              const { channel } = props;
                              this.settings.chatButtonsLength = ret?.props?.children?.length + 1 || 1;

                              if ((this.settings.buttonOnRight || this.forceOnRight) && (canSendMessages(channel.id) || channel.type === 1) && !this.settings.showInAttachMenu) ret?.props?.children.splice(this.settings.buttonIndex, 0, button).join();
                          });
                      }

                      patchMessageReplace() {
                          const ChannelTextAreaContainer = WebpackModules.find((m) => m?.type?.render?.displayName === 'ChannelTextAreaContainer')?.type;

                          class TimestampFomratsSelector extends React.Component {
                              constructor(props) {
                                  super(props);
                              }

                              componentDidMount() {
                                  this.props.timestamps.forEach((ts, key) => {
                                      this.props.onChange({
                                          key,
                                          value: `<t:${ts.timestamp}:${ts.timestampFormat}>`,
                                      });
                                  });
                              }

                              render() {
                                  const timestampSelects = this.props.timestamps.map((ts, key) => {
                                      return React.createElement('div', {
                                          children: [
                                              React.createElement(
                                                  'span',
                                                  {
                                                      style: {
                                                          fontWeight: '500',
                                                      },
                                                  },
                                                  `${key + 1}: `
                                              ),
                                              React.createElement(
                                                  'select',
                                                  {
                                                      className: 'select-timestamp',
                                                      defaultValue: ts.timestampFormat,
                                                      onChange: (e) => {
                                                          this.props.onChange({ key, value: `<t:${ts.timestamp}:${e.target.value}>` });
                                                      },
                                                      value: ts.value,
                                                  },
                                                  ts.options.map((option) => {
                                                      return React.createElement(
                                                          'option',
                                                          {
                                                              value: option.value,
                                                          },
                                                          option.label
                                                      );
                                                  })
                                              ),
                                          ],
                                      });
                                  });

                                  return React.createElement('div', {
                                      className: 'timestamp-formats-wrapper',
                                      children: [
                                          React.createElement('div', {
                                              className: 'timestamp-formats-selector',
                                              children: [
                                                  React.createElement(
                                                      'span',
                                                      {
                                                          style: {
                                                              fontWeight: '700',
                                                              padding: '8px 12px',
                                                              fontSize: '1.2rem',
                                                          },
                                                      },
                                                      'Timestamp Formats: '
                                                  ),
                                                  React.createElement('div', {
                                                      className: 'timestamp-formats-selects',
                                                      children: timestampSelects,
                                                  }),
                                              ],
                                          }),
                                      ],
                                  });
                              }
                          }

                          const getTimestamp = (str, pre = false) => {
                              if (pre) {
                                  str = new Date(str * 1000);
                                  return str;
                              } else {
                                  const d = Date.parse(str) / 1000;

                                  if (isNaN(d)) {
                                      const timestring = str.match(/\b(24:00:00|2[0-3]:[0-5]\d:[0-5]\d|2[0-3]:[0-5]\d|24:00|[01]?\d:[0-5]\d:[0-5]\d( ?(am|pm)?)|[01]?\d:[0-5]\d( ?(am|pm)?))\b/gi);
                                      if (timestring) {
                                          const time = timestring[0].split(':');
                                          let dt = new Date();
                                          let hours = 0;
                                          let minutes = 0;
                                          let seconds = 0;
                                          let meridian;

                                          switch (time.length) {
                                              case 1:
                                                  meridian = time[0]?.match(/[a|p]m?/i);
                                                  hours = parseInt(time[0]);

                                                  if (meridian) meridian[0].toLowerCase() === 'a' || meridian[0].toLowerCase() === 'am' ? (hours = hours === 12 ? 0 : hours) : (hours = hours === 12 ? 12 : hours + 12);
                                                  break;
                                              case 2:
                                                  meridian = time[1]?.match(/[a|p]m?/i);
                                                  hours = parseInt(time[0]);
                                                  minutes = parseInt(time[1]);

                                                  if (meridian) meridian[0].toLowerCase() === 'a' || meridian[0].toLowerCase() === 'am' ? (hours = hours === 12 ? 0 : hours) : (hours = hours === 12 ? 12 : hours + 12);
                                                  break;
                                              case 3:
                                                  meridian = time[2]?.match(/[a|p]m?/i);
                                                  hours = parseInt(time[0]);
                                                  minutes = parseInt(time[1]);
                                                  seconds = parseInt(time[2]);

                                                  if (meridian) meridian[0].toLowerCase() === 'a' || meridian[0].toLowerCase() === 'am' ? (hours = hours === 12 ? 0 : hours) : (hours = hours === 12 ? 12 : hours + 12);
                                                  break;
                                          }
                                          dt.setHours(hours);
                                          dt.setMinutes(minutes);
                                          dt.setSeconds(seconds);
                                          dt.setMilliseconds(0);
                                          return dt;
                                      }
                                  } else str = d;

                                  return str;
                              }
                          };

                          const getRelativeTime = (timestamp) => {
                              const timeElapsed = timestamp - new Date();
                              const units = {
                                  year: 24 * 60 * 60 * 1000 * 365,
                                  month: (24 * 60 * 60 * 1000 * 365) / 12,
                                  day: 24 * 60 * 60 * 1000,
                                  hour: 60 * 60 * 1000,
                                  minute: 60 * 1000,
                                  second: 1000,
                              };

                              for (let u in units) if (Math.abs(timeElapsed) > units[u] || u == 'second') return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(Math.round(timeElapsed / units[u]), u);
                          };

                          Patcher.after(ChannelTextAreaContainer, 'render', (_, [props], ret) => {
                              const { textValue } = props;
                              if (!textValue) return ret;

                              if (/\{{(.*?)\}}/g.test(textValue) || /<t:[0-9]+:[tTdDfFR]>/g.test(textValue)) {
                                  let timestamps = [...textValue.matchAll(/\{{(.*?)\}}/g), ...textValue.matchAll(/<t:[0-9]+:[tTdDfFR]>/g)]
                                      .filter((m) => m[1] != '')
                                      .map((m) => {
                                          let timestamp = getTimestamp(m[1] || parseInt(m[0].split(':')[1]), /<t:[0-9]+:[tTdDfFR]>/g.test(m[0]));
                                          if (isNaN(timestamp))
                                              return {
                                                  timestamp: new Date().getTime() / 1000,
                                                  timestampFormat: 'F',
                                                  options: [{ value: 'F', label: 'Error formating this timestamp' }],
                                              };

                                          if (!(timestamp instanceof Date)) timestamp = new Date(timestamp * 1000);

                                          return {
                                              timestamp: timestamp.getTime() / 1000,
                                              timestampFormat: m[0].split(':')[2]?.charAt(0) || this.settings.timestampFormat,
                                              options: [
                                                  { value: 't', label: timestamp.toLocaleString(undefined, { hour: '2-digit', minute: '2-digit' }).replace(' at', '') },
                                                  { value: 'T', label: timestamp.toLocaleString(undefined, { timeStyle: 'medium' }).replace(' at', '') },
                                                  { value: 'd', label: timestamp.toLocaleString(undefined, { dateStyle: 'short' }).replace(' at', '') },
                                                  { value: 'D', label: timestamp.toLocaleString(undefined, { dateStyle: 'long' }).replace(' at', '') },
                                                  { value: 'f', label: timestamp.toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' }).replace(' at', '') },
                                                  { value: 'F', label: timestamp.toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' }).replace(' at', '') },
                                                  { value: 'R', label: getRelativeTime(timestamp) },
                                              ],
                                          };
                                      });

                                  if (timestamps.length > 0)
                                      ret.props.children.push(
                                          React.createElement(TimestampFomratsSelector, {
                                              timestamps,
                                              onChange: (opts) => {
                                                  this.sendFomrmatOptions[opts.key] = opts.value;
                                              },
                                          })
                                      );
                              }

                              return ret;
                          });

                          Patcher.before(MessageActions, 'editMessage', (_, [__, ___, props], ret) => {
                              let { content } = props;

                              if (/\{{(.*?)\}}/g.test(content) || /<t:[0-9]+:[tTdDfFR]>/g.test(content)) {
                                  let timestamps = [...content.matchAll(/\{{(.*?)\}}/g), ...content.matchAll(/<t:[0-9]+:[tTdDfFR]>/g)].filter((m) => m[1] != '');
                                  let n = 0;
                                  if (timestamps.length > 0)
                                      content = content.replace(/(\{{(.*?)\}})|(<t:[0-9]+:[tTdDfFR]>)/g, (match, p1) => {
                                          return this.sendFomrmatOptions[opts.key] || match;
                                      });
                              }
                              props.content = content;
                          });

                          Patcher.before(MessageActions, 'sendMessage', (_, [__, props], ret) => {
                              let { content } = props;

                              if (/\{{(.*?)\}}/g.test(content) || /<t:[0-9]+:[tTdDfFR]>/g.test(content)) {
                                  let timestamps = [...content.matchAll(/\{{(.*?)\}}/g), ...content.matchAll(/<t:[0-9]+:[tTdDfFR]>/g)].filter((m) => m[1] != '');
                                  let n = 0;
                                  if (timestamps.length > 0)
                                      content = content.replace(/(\{{(.*?)\}})|(<t:[0-9]+:[tTdDfFR]>)/g, (match, p1) => {
                                          return this.sendFomrmatOptions[opts.key] || match;
                                      });
                              }
                              props.content = content;
                          });
                      }

                      patchAttachMenu(attachMenu) {
                          const menuOption = DOMTools.createElement(`<div class="item-1OdjEX labelContainer-2vJzYL colorDefault-CDqZdO" role="menuitem" id="channel-attach-TIMESTAMP" tabindex="-1" data-menu-item="true"> <div class="label-2gNW3x"> <div class="optionLabel-1o-h-l"> <svg class="optionIcon-1Ft8w0" aria-hidden="false" width="16" height="16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"> <path fill="currentColor" d="M256,8C119,8,8,119,8,256S119,504,256,504,504,393,504,256,393,8,256,8Zm92.49,313h0l-20,25a16,16,0,0,1-22.49,2.5h0l-67-49.72a40,40,0,0,1-15-31.23V112a16,16,0,0,1,16-16h32a16,16,0,0,1,16,16V256l58,42.5A16,16,0,0,1,348.49,321Z"></path> </svg> <div class="optionName-1ebPjH">Add Timestamp</div> </div> </div> </div>`);

                          attachMenu.querySelector('#channel-attach-upload-file').addEventListener('mouseenter', () => {
                              attachMenu.querySelector('#channel-attach-upload-file').classList.add('focused-3qFvc8');
                          });
                          menuOption.addEventListener('mouseenter', () => {
                              attachMenu.querySelector('#channel-attach-upload-file').classList.remove('focused-3qFvc8');
                              menuOption.classList.add('focused-3qFvc8');
                          });
                          menuOption.addEventListener('mouseleave', () => {
                              menuOption.classList.remove('focused-3qFvc8');
                          });
                          menuOption.addEventListener('click', () => {
                              this.showTimestampModal();
                              attachMenu.remove();
                          });

                          if (!attachMenu?.querySelector('#channel-attach-TIMESTAMP')) attachMenu?.prepend(menuOption);
                      }

                      observer(e) {
                          const attachMenu = e.target.querySelector('#channel-attach');
                          if (attachMenu && this.settings.showInAttachMenu) this.patchAttachMenu(attachMenu.querySelector('div'));
                      }
                  };
              };
              return plugin(Plugin, Api);
          })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
