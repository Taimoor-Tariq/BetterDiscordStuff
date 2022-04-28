/**
 * @name SendTimestamps
 * @version 2.0.1
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
        info: { name: 'SendTimestamps', version: '2.0.1', description: 'Send timestamps in your messages easily by adding them in {{...}} or using the button.', author: 'Taimoor', authorId: '220161488516546561', authorLink: 'https://github.com/Taimoor-Tariq', source: 'https://github.com/Taimoor-Tariq/BetterDiscordStuff/blob/main/Plugins/SendTimestamps/SendTimestamps.plugin.js', github_raw: 'https://raw.githubusercontent.com/Taimoor-Tariq/BetterDiscordStuff/main/Plugins/SendTimestamps/SendTimestamps.plugin.js', donate: 'https://ko-fi.com/TaimoorTariq', authors: [{ name: 'Taimoor', discord_id: '220161488516546561' }] },
        changelog: [
            { title: 'Version 2.0', items: ['Rewrote the entire plugin fixing a lot of bugs and adding new stuff!!!'] },
            { title: "What's New", type: 'improved', items: ['You can now automatically convert Dates and Times when sending a message. Just put in in between **{{** and **}}**', "Improved the way the button is rendered making sure it's rendered when it's supposed to."] },
            { title: "What's Coming", type: 'progress', items: ['Localization for different languages', 'Improved Settings'] },
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
                      Settings,
                      Modals,
                      DOMTools,
                      WebpackModules,
                      DiscordModules: { React, MessageActions },
                  } = Api;
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
`;

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
                          };

                          this.forceOnRight = false;
                          this.dispatchToChannelArea = true;
                      }

                      onStart() {
                          PluginUtilities.addStyle(this.getName(), css);
                          this.patchButton();
                          if (this.settings.replaceInMessages) this.patchMessageReplace();
                      }

                      onStop() {
                          PluginUtilities.removeStyle(this.getName());
                          Patcher.unpatchAll();
                      }

                      getSettingsPanel() {
                          return Settings.SettingPanel.build(
                              this.saveSettings.bind(this),
                              new Settings.Switch('Replace on message send', 'Enabling this option will convert all the date/time in you message before you send it. Example: "{{dec 2 2020}} or {{10:40am}}". (your last used fromat from the modal is used)', this.settings.replaceInMessages, (e) => {
                                  this.settings.replaceInMessages = e;
                              }),
                              new Settings.Switch('Button on right', null, this.settings.buttonOnRight, (e) => {
                                  this.settings.buttonOnRight = e;
                              }),
                              new Settings.Slider(
                                  'Position',
                                  'Position of the button (only works if button is on right)',
                                  0,
                                  this.settings.chatButtonsLength,
                                  this.settings.buttonIndex,
                                  (e) => {
                                      this.settings.buttonIndex = e;
                                  },
                                  {
                                      markers: Array.apply(null, Array(this.settings.chatButtonsLength)).map((_, i) => i),
                                      stickToMarkers: true,
                                  }
                              )
                          );
                      }

                      showTimestampModal() {
                          const Dropdown = WebpackModules.getByProps('SingleSelect').SingleSelect;
                          const inputFormat = this.settings.timestampFormat;

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
                                          { value: 'r', label: getRelativeTime(time) },
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

                                  if (this.dispatchToChannelArea) BdApi.findModuleByProps('ComponentDispatch').ComponentDispatch.dispatch('INSERT_TEXT', { content: ts_msg, plainText: ts_msg });
                                  else BdApi.findModuleByProps('ComponentDispatch').ComponentDispatch.dispatch('INSERT_TEXT', { content: ts_msg, plainText: ts_msg });
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
                              const { channel } = props;

                              if (!this.settings.buttonOnRight && canSendMessages(channel.id)) {
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

                          Patcher.after(ChannelTextAreaButtons, 'type', (_, args, ret) => {
                              this.settings.chatButtonsLength = ret?.props?.children?.length + 1 || 1;
                              if (this.settings.buttonOnRight || this.forceOnRight) ret?.props?.children.splice(this.settings.buttonIndex, 0, button).join();
                          });
                      }

                      patchMessageReplace() {
                          Patcher.before(MessageActions, 'sendMessage', (_, [__, props], ret) => {
                              let { content } = props;

                              const convetTimestring = (str) => {
                                  const d = Date.parse(str.replace('{{', '').replace('}}', '')) / 1000;

                                  if (isNaN(d)) {
                                      const timestring = str.match(/\b(24:00|2[0-3]:\d\d|[01]?\d((:\d\d)( ?(a|p)m?)?| ?(a|p)m?))\b/gi);
                                      if (timestring) {
                                          const time = timestring[0].split(':');
                                          const minutes = parseInt(time[1]);
                                          const ampm = time[1]?.match(/[a|p]m?/i);
                                          let hours = parseInt(time[0]);

                                          if (ampm) ampm[0].toLowerCase() === 'a' || ampm[0].toLowerCase() === 'am' ? (hours = hours === 12 ? 0 : hours) : (hours = hours === 12 ? 12 : hours + 12);

                                          let dt = new Date();
                                          dt.setHours(hours);
                                          dt.setMinutes(minutes);
                                          dt.setSeconds(0);
                                          dt.setMilliseconds(0);

                                          return `<t:${Math.round(dt.getTime() / 1000)}:${this.settings.timestampFormat}>`;
                                      }
                                  } else str = `<t:${d}:${this.settings.timestampFormat}>`;

                                  return str;
                              };

                              if (/\{{(.*?)\}}/g.test(content)) content = content.replace(/\{{(.*?)\}}/g, convetTimestring.bind(this));

                              props.content = content;
                          });
                      }

                      patchChangeLogButton(pluginCard) {
                          const controls = pluginCard.querySelector('.bd-controls');
                          const changeLogButton = DOMTools.createElement(
                              `<button class="bd-button bd-addon-button bd-changelog-button" style"position: relative;"> <style> .bd-changelog-button-tooltip { visibility: hidden; position: absolute; background-color: var(--background-floating); box-shadow: var(--elevation-high); color: var(--text-normal); border-radius: 5px; font-size: 14px; line-height: 16px; white-space: nowrap; font-weight: 500; padding: 8px 12px; z-index: 999999; transform: translate(0, -125%); } .bd-changelog-button-tooltip:after { content: ''; position: absolute; top: 100%; left: 50%; margin-left: -3px; border-width: 3x; border-style: solid; border-color: var(--background-floating) transparent transparent transparent; } .bd-changelog-button:hover .bd-changelog-button-tooltip { visibility: visible; } </style> <span class="bd-changelog-button-tooltip">Changelog</span> <svg viewBox="0 0 24 24" fill="#FFFFFF" style="width: 20px; height: 20px;"> <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" /> </svg> </button>`
                          );
                          changeLogButton.addEventListener('click', () => {
                              Modals.showChangelogModal(this.getName(), this.getVersion(), this._config.changelog);
                          });

                          if (!controls.querySelector('.bd-changelog-button') && this._config.changelog?.length > 0) controls.prepend(changeLogButton);
                      }

                      observer(e) {
                          const pluginCard = e.target.querySelector(`#${this.getName()}-card`);
                          if (pluginCard) this.patchChangeLogButton(pluginCard);

                          if (document.activeElement.getAttribute('role') == 'textbox') {
                              if (!!document.activeElement.getAttribute('aria-label')) this.dispatchToChannelArea = true;
                              else this.dispatchToChannelArea = false;
                          }
                      }
                  };
              };
              return plugin(Plugin, Api);
          })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
