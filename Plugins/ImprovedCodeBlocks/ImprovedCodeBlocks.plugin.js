/**
 * @name ImprovedCodeBlocks
 * @version 1.0.1
 * @description Improve code blocks with syntax highlighting and more!
 * @author Taimoor
 * @authorId 220161488516546561
 * @authorLink https://github.com/Taimoor-Tariq
 * @source https://github.com/Taimoor-Tariq/BetterDiscordStuff/blob/main/Plugins/ImprovedCodeBlocks/ImprovedCodeBlocks.plugin.js
 * @github_raw https://raw.githubusercontent.com/Taimoor-Tariq/BetterDiscordStuff/main/Plugins/ImprovedCodeBlocks/ImprovedCodeBlocks.plugin.js
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
    const config = { info: { name: 'ImprovedCodeBlocks', version: '1.0.1', description: 'Improve code blocks with syntax highlighting and more!', author: 'Taimoor', authorId: '220161488516546561', authorLink: 'https://github.com/Taimoor-Tariq', source: 'https://github.com/Taimoor-Tariq/BetterDiscordStuff/blob/main/Plugins/ImprovedCodeBlocks/ImprovedCodeBlocks.plugin.js', github_raw: 'https://raw.githubusercontent.com/Taimoor-Tariq/BetterDiscordStuff/main/Plugins/ImprovedCodeBlocks/ImprovedCodeBlocks.plugin.js', donate: 'https://ko-fi.com/TaimoorTariq', authors: [{ name: 'Taimoor', discord_id: '220161488516546561' }] }, main: 'index.js' };

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
                      Settings,
                      Patcher,
                      Toasts,
                      WebpackModules,
                      DOMTools,
                      Modals,
                      DiscordModules: { React, ElectronModule },
                  } = Api;
                  const css = `:root {
    --shiki-color-text: #f8f8f2;
    --shiki-color-background: #282a36;
    --shiki-token-constant: #bd93f9;
    --shiki-token-string: #f1fa8c;
    --shiki-token-comment: #6272a4;
    --shiki-token-keyword: #ff79c6;
    --shiki-token-parameter: #ffb86c;
    --shiki-token-function: #50fa7b;
    --shiki-token-string-expression: #f1fa8c;
    --shiki-token-punctuation: #bd93f9;
    --shiki-token-link: #8be9fd;
}

.shiki code {
    counter-reset: step;
    counter-increment: step calc(var(--start, 1) - 1);
    padding: 0.5rem 0.3rem 0.5rem 3rem;
    display: block;
    background-color: transparent;
}
.shiki code .line {
    position: relative;
}
.shiki code .line:before {
    content: counter(step);
    counter-increment: step;
    width: 1.5rem;
    padding-right: 0.5rem;
    text-align: right;
    color: var(--text-muted);
    opacity: 0.5;
    border-right: 1px solid currentColor;
    position: absolute;
    left: -2.6rem;
    height: calc(100% + 1px);
}
.code-block-no-line-numbers .shiki code {
    padding-left: 1rem;
}
.code-block-no-line-numbers .shiki code .line:before {
    display: none;
}

.code-block-header {
    background-color: var(--background-tertiary);
    border: 1px solid var(--background-tertiary);
    max-width: calc(90% - 0.2rem);
    margin-bottom: -0.4rem;
    text-transform: uppercase;
    font-weight: bold;
    font-size: 0.8rem;
    display: flex;
    justify-content: space-between;
}
.embedWrapper-1MtIDg .code-block-header {
    max-width: calc(100% - 0.1rem);
}
.code-block-copy-button {
    height: 2rem;
    width: 3rem;
    padding: 0.4rem;
    background-color: var(--background-tertiary);
    color: var(--text-normal);
    margin-right: 0.1rem;
    position: relative;
}
.code-block-copy-button svg {
    height: 1.5rem;
    width: 1.5rem;
}
.code-block-copy-button:hover {
    background-color: var(--channeltextarea-background);
}
.code-block-header-language {
    padding: 0.4rem 0 0 1rem;
    user-select: none;
}
.code-block-header-language i {
    margin-right: 0.5rem;
}
`;

                  return class ImprovedCodeBlocks extends Plugin {
                      constructor() {
                          super();

                          this.highlighter = null;

                          this.defaultSettings = {
                              theme: 'dracula',
                              customTheme: {
                                  colorText: '#F8F8F2',
                                  colorBackground: '#282A36',
                                  tokenConstant: '#BD93F9',
                                  tokenString: '#F1FA8C',
                                  tokenComment: '#6272A4',
                                  tokenKeyword: '#FF79C6',
                                  tokenParameter: '#FFB86C',
                                  tokenFunction: '#50FA7B',
                                  tokenStringExpression: '#F1FA8C',
                                  tokenPunctuation: '#BD93F9',
                                  tokenLink: '#8BE9FD',
                              },
                              showLineNumbers: true,
                          };
                      }

                      onStart() {
                          PluginUtilities.addStyle(this.getName(), css);
                          this.initalize();
                      }

                      onStop() {
                          this.domObserver?.unsubscribeAll();
                          PluginUtilities.removeStyle(this.getName());
                          Patcher.unpatchAll();
                          document.getElementById('shiki-highlighter').remove();
                          document.getElementById('devicon-loader').remove();
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

                      async initalize() {
                          if (!document.getElementById('devicon-loader')) {
                              const link = document.createElement('link');
                              link.href = 'https://cdn.jsdelivr.net/gh/devicons/devicon@v2.15.1/devicon.min.css';
                              link.id = 'devicon-loader';
                              link.rel = 'stylesheet';

                              document.head.appendChild(link);
                          }

                          if (!document.getElementById('shiki-highlighter')) {
                              const script = document.createElement('script');
                              script.src = 'https://unpkg.com/shiki';
                              script.id = 'shiki-highlighter';

                              document.head.appendChild(script);
                              script.onload = async () => {
                                  this.highlighter = await shiki.getHighlighter({ theme: this.settings.theme });
                                  this.patchCodeBlock();
                              };
                          } else {
                              this.highlighter = await shiki.getHighlighter({ theme: this.settings.theme });
                              this.patchCodeBlock();
                          }
                      }

                      getSettingsPanel() {
                          return Settings.SettingPanel.build(
                              this.saveSettings.bind(this),
                              new Settings.Dropdown(
                                  'Theme',
                                  'Theme for the codeblocks',
                                  this.settings.theme,
                                  shiki.BUNDLED_THEMES.map((theme) => ({
                                      label: theme == 'css-variables' ? 'custom' : theme,
                                      value: theme,
                                  })),
                                  async (e) => {
                                      this.settings.theme = e;
                                      this.highlighter = await shiki.getHighlighter({ theme: this.settings.theme });
                                  }
                              ),
                              new Settings.Switch('Show Line Numbers', null, this.settings.showLineNumbers, (e) => {
                                  this.settings.showLineNumbers = e;
                              }),
                              new Settings.SettingGroup('Custom Theme Colors').append(
                                  new Settings.ColorPicker(
                                      'Text Color',
                                      null,
                                      this.settings.customTheme.colorText,
                                      (e) => {
                                          this.settings.customTheme.colorText = e;
                                          document.documentElement.style.setProperty('--shiki-color-text', e);
                                      },
                                      { defaultColor: '#EEEEEE' }
                                  ),
                                  new Settings.ColorPicker(
                                      'Background Color',
                                      null,
                                      this.settings.customTheme.colorBackground,
                                      (e) => {
                                          this.settings.customTheme.colorBackground = e;
                                          document.documentElement.style.setProperty('--shiki-color-background', e);
                                      },
                                      { defaultColor: '#282A36' }
                                  ),
                                  new Settings.ColorPicker(
                                      'Constant Color',
                                      null,
                                      this.settings.customTheme.tokenConstant,
                                      (e) => {
                                          this.settings.customTheme.tokenConstant = e;
                                          document.documentElement.style.setProperty('--shiki-token-constant', e);
                                      },
                                      { defaultColor: '#BD93F9' }
                                  ),
                                  new Settings.ColorPicker(
                                      'String Color',
                                      null,
                                      this.settings.customTheme.tokenString,
                                      (e) => {
                                          this.settings.customTheme.tokenString = e;
                                          document.documentElement.style.setProperty('--shiki-token-string', e);
                                      },
                                      { defaultColor: '#F1FA8C' }
                                  ),
                                  new Settings.ColorPicker(
                                      'Comment Color',
                                      null,
                                      this.settings.customTheme.tokenComment,
                                      (e) => {
                                          this.settings.customTheme.tokenComment = e;
                                          document.documentElement.style.setProperty('--shiki-token-comment', e);
                                      },
                                      { defaultColor: '#6272A4' }
                                  ),
                                  new Settings.ColorPicker(
                                      'Keyword Color',
                                      null,
                                      this.settings.customTheme.tokenKeyword,
                                      (e) => {
                                          this.settings.customTheme.tokenKeyword = e;
                                          document.documentElement.style.setProperty('--shiki-token-keyword', e);
                                      },
                                      { defaultColor: '#FF79C6' }
                                  ),
                                  new Settings.ColorPicker(
                                      'Parameter Color',
                                      null,
                                      this.settings.customTheme.tokenParameter,
                                      (e) => {
                                          this.settings.customTheme.tokenParameter = e;
                                          document.documentElement.style.setProperty('--shiki-token-parameter', e);
                                      },
                                      { defaultColor: '#FFB86C' }
                                  ),
                                  new Settings.ColorPicker(
                                      'Function Color',
                                      null,
                                      this.settings.customTheme.tokenFunction,
                                      (e) => {
                                          this.settings.customTheme.tokenFunction = e;
                                          document.documentElement.style.setProperty('--shiki-token-function', e);
                                      },
                                      { defaultColor: '#50FA7B' }
                                  ),
                                  new Settings.ColorPicker(
                                      'String Expression Color',
                                      null,
                                      this.settings.customTheme.tokenStringExpression,
                                      (e) => {
                                          this.settings.customTheme.tokenStringExpression = e;
                                          document.documentElement.style.setProperty('--shiki-token-string-expression', e);
                                      },
                                      { defaultColor: '#F1FA8C' }
                                  ),
                                  new Settings.ColorPicker(
                                      'Punctuation Color',
                                      null,
                                      this.settings.customTheme.tokenPunctuation,
                                      (e) => {
                                          this.settings.customTheme.tokenPunctuation = e;
                                          document.documentElement.style.setProperty('--shiki-token-punctuation', e);
                                      },
                                      { defaultColor: '#BD93F9' }
                                  ),
                                  new Settings.ColorPicker(
                                      'Link Color',
                                      null,
                                      this.settings.customTheme.tokenLink,
                                      (e) => {
                                          this.settings.customTheme.tokenLink = e;
                                          document.documentElement.style.setProperty('--shiki-token-link', e);
                                      },
                                      { defaultColor: '#8BE9FD' }
                                  )
                              )
                          );
                      }

                      patchColors() {
                          document.documentElement.style.setProperty('--shiki-color-text', this.settings.customTheme.colorText);
                          document.documentElement.style.setProperty('--shiki-color-background', this.settings.customTheme.colorBackground);
                          document.documentElement.style.setProperty('--shiki-token-constant', this.settings.customTheme.tokenConstant);
                          document.documentElement.style.setProperty('--shiki-token-string', this.settings.customTheme.tokenString);
                          document.documentElement.style.setProperty('--shiki-token-comment', this.settings.customTheme.tokenComment);
                          document.documentElement.style.setProperty('--shiki-token-keyword', this.settings.customTheme.tokenKeyword);
                          document.documentElement.style.setProperty('--shiki-token-parameter', this.settings.customTheme.tokenParameter);
                          document.documentElement.style.setProperty('--shiki-token-function', this.settings.customTheme.tokenFunction);
                          document.documentElement.style.setProperty('--shiki-token-string-expression', this.settings.customTheme.tokenStringExpression);
                          document.documentElement.style.setProperty('--shiki-token-punctuation', this.settings.customTheme.tokenPunctuation);
                          document.documentElement.style.setProperty('--shiki-token-link', this.settings.customTheme.tokenLink);
                      }

                      patchCodeBlock() {
                          this.patchColors();
                          const codeBlock = WebpackModules.getModule((m) => m.default?.defaultRules?.hasOwnProperty('codeBlock')).default.defaultRules.codeBlock;

                          Patcher.after(codeBlock, 'react', (_, [props], ret) => {
                              const { lang, content } = props;
                              const language = shiki.BUNDLED_LANGUAGES.filter((l) => l.id == lang || l.aliases?.includes(lang))[0] || { id: '' };

                              ret.props.render = () => {
                                  const CodeBlockContainer = React.createElement('div', {
                                      className: this.settings.showLineNumbers ? '' : 'code-block-no-line-numbers',
                                      dangerouslySetInnerHTML: {
                                          __html: this.highlighter.codeToHtml(content, { lang: language.id }),
                                      },
                                  });

                                  const CodeBlockHeader = React.createElement('div', {
                                      className: 'code-block-header',
                                      children: [
                                          React.createElement('span', {
                                              className: 'code-block-header-language',
                                              children: [
                                                  React.createElement('i', {
                                                      className: `devicon-${language.id}-plain colored`,
                                                  }),
                                                  language.id,
                                              ],
                                          }),
                                          React.createElement('button', {
                                              className: 'code-block-copy-button',
                                              onClick: () => {
                                                  ElectronModule.copy(content);
                                                  Toasts.success('Copied code.');
                                              },
                                              children: [
                                                  React.createElement('svg', {
                                                      children: [
                                                          React.createElement('path', {
                                                              fill: 'currentColor',
                                                              d: 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z',
                                                          }),
                                                      ],
                                                  }),
                                              ],
                                          }),
                                      ],
                                  });

                                  return React.createElement('div', {
                                      children: [CodeBlockHeader, CodeBlockContainer],
                                  });
                              };

                              return ret;
                          });
                      }
                  };
              };
              return plugin(Plugin, Api);
          })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
