/**
 * @name SendTimestamps
 * @author Taimoor
 * @authorId 220161488516546561
 * @version 1.1.1
 * @description Use Discord's latest feature of using timestamps in your messages easily.
 * @authorLink https://github.com/Taimoor-Tariq
 * @source https://raw.githubusercontent.com/Taimoor-Tariq/BetterDiscordStuff/main/Plugins/SendTimestamps/SendTimestamps.plugin.js
 * @updateUrl https://raw.githubusercontent.com/Taimoor-Tariq/BetterDiscordStuff/main/Plugins/SendTimestamps/SendTimestamps.plugin.js
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
            name: "Send Timestamps",
            authors: [
                {
                    name: "Taimoor",
                    discord_id: "220161488516546561",
                    github_username: "Taimoor-Tariq",
                },
            ],
            version: "1.1.1",
            description:
                "Use Discord's latest feature of using timestamps in your messages easily.",
            github: "https://github.com/Taimoor-Tariq/BetterDiscordStuff/blob/main/Plugins/SendTimestamps/SendTimestamps.plugin.js",
            github_raw:
                "https://raw.githubusercontent.com/Taimoor-Tariq/BetterDiscordStuff/main/Plugins/SendTimestamps/SendTimestamps.plugin.js",
        },
        changelog: [
            {
                title: "Improvements",
                type: "improved",
                items: [
                    "**Date**: Fixed date not showing by default."
                ],
            },
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
        css = `.attachWrapper-2TRKBi {	display: flex; flex-direction: row; }
.attachButton-2WznTc { padding: 10px; }

.timestamp-button { color: var(--interactive-normal); }
.timestamp-button:hover { color: var(--interactive-hover); }
.timestamp-button button { min-height: 32px; min-width: 32px; margin-left: 0px; }
.timestamp-button svg { width: 24px; height: 24px; }

.attachWrapper-2TRKBi .timestamp-button { margin-right: 10px; }
.attachWrapper-2TRKBi .timestamp-button button { min-height: 24px; min-width: 24px; }
.attachWrapper-2TRKBi .timestamp-button svg { width: 20px; height: 20px; }

.timestamp-modal { padding: 10px 0; }

.timestamp-modal-custom-input {
    font-size: 16px;
    box-sizing: border-box;
    width: 100%;
    border-radius: 3px;
    color: var(--text-normal);
    background-color: var(--deprecated-text-input-bg);
    border: 1px solid var(--deprecated-text-input-border);
    transition: border-color .2s ease-in-out;
    padding: 10px;
}

input[type="time"]::-webkit-calendar-picker-indicator {
    width: 16px;
    height: 16px;
    background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAsQAAALEBxi1JjQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAHGSURBVEiJxdY9axRRFAbgRw2uCtn4gYJCUNGI+hOCpFlLsbWwiBYq/gGxEAz+F20jVoZgMFgpJtEg6IIaDRaiRYz4ARauxZzkbpbJ3DEIvnA5w/l6z5w799zhP2MnruIuFvED3/AK47iIXRtJvB1j+I5OZi3hOrbVTX4EzyL4NyYwiqPYir54vhC2FaInOJBLfhgfIuAlhmsUNIx2xCxWkTTwPBwfYqDEZzpWL/pD38Fj67TrVlflZclJ7ShDU3qTa73G3VhW9LyqLVUEcCpyLCm+wFVcjsCJiuA6BDAZPqOwOZRnQt7JBNfB7ZBnu5XvgnUoE1znDY5Je7mKn6Fs1CTYV+GzI3y+klq0IjdlCJ6GfFBB0hdyS7dyQb0W7cW81IL9JT4nwr5Aqnw+ZO7kfsZpvMBx3CvxGQk5201wP+T5DAF8QkvRro8l9nMh13zyA4pN6ag3f9ZDS9rgZq9xLIxtxWz5W+zB68hxo8yhIY3p6bIKMskfReyMirthUBrXbcVsyaElVf4eh3IBg9ZeOJOKy2VIcYj6cRJXMCUdvjkcrFEQinbdlDa+ai2Hb24KlKIZlY7jDX7hC94qfgQu2eCl/8/wByYfiBNHGPmWAAAAAElFTkSuQmCC");
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    filter: invert(100%);
    cursor: pointer;
}

input[type="date"]::-webkit-calendar-picker-indicator {
    width: 16px;
    height: 16px;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7v-5z'/%3E%3C/svg%3E");
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    filter: invert(80%);
    cursor: pointer;
}`,
        buttonHTML = `<div class="buttonContainer-28fw2U timestamp-button">
    <button aria-label="Enter timestamp" type="button" class="buttonWrapper-1ZmCpA button-318s1X button-38aScr lookBlank-3eh9lL colorBrand-3pXr91 grow-q77ONN">
        <svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path fill="currentColor" d="M256,8C119,8,8,119,8,256S119,504,256,504,504,393,504,256,393,8,256,8Zm92.49,313h0l-20,25a16,16,0,0,1-22.49,2.5h0l-67-49.72a40,40,0,0,1-15-31.23V112a16,16,0,0,1,16-16h32a16,16,0,0,1,16,16V256l58,42.5A16,16,0,0,1,348.49,321Z"></path>
        </svg>
    </button>
</div>`,
        { DiscordSelectors, PluginUtilities, DOMTools, Modals, WebpackModules } = Api,
        { Logger, Settings } = Library,
        { FormItem } = BdApi.findModuleByProps("FormItem"),
        Dropdown = WebpackModules.getByProps("SingleSelect").SingleSelect;

    let inputTime = new Date(), inputFormat = "f",
        setFormatOpts = null;

    const
        units = {
            year  : 24 * 60 * 60 * 1000 * 365,
            month : 24 * 60 * 60 * 1000 * 365/12,
            day   : 24 * 60 * 60 * 1000,
            hour  : 60 * 60 * 1000,
            minute: 60 * 1000,
            second: 1000
        },
        rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' }),
        isValidDate = (d) => {
            return d instanceof Date && !isNaN(d);
        },
        getRelativeTime = (d1, d2 = new Date()) => {
            let elapsed = d1 - d2

            // "Math.abs" accounts for both "past" & "future" scenarios
            for (let u in units)
                if (Math.abs(elapsed) > units[u] || u == 'second')
                    return rtf.format(Math.round(elapsed/units[u]), u)
        },
        createUpdateWrapper = (Component, changeProp = "onChange") => props => {
            const [value, setValue] = BdApi.React.useState(props["value"]);

            if (!!setFormatOpts && isValidDate(inputTime)) {
                let timeFormats = {
                    t: inputTime.toLocaleString(undefined, { hour: '2-digit', minute: '2-digit'}).replace(' at', ''),
                    T: inputTime.toLocaleString(undefined, { timeStyle: 'medium' }).replace(' at', ''),
                    d: inputTime.toLocaleString(undefined, { dateStyle: 'short' }).replace(' at', ''),
                    D: inputTime.toLocaleString(undefined, { dateStyle: 'long' }).replace(' at', ''),
                    f: inputTime.toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' }).replace(' at', ''),
                    F: inputTime.toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' }).replace(' at', ''),
                    R: getRelativeTime(inputTime)
                };

                setFormatOpts([ {value: "t", label: timeFormats.t}, {value: "T", label: timeFormats.T}, {value: "d", label: timeFormats.d}, {value: "D", label: timeFormats.D}, {value: "f", label: timeFormats.f}, {value: "F", label: timeFormats.F}, {value: "R", label: timeFormats.R} ]);
            }

            return BdApi.React.createElement(Component, {
                ...props,
                ["value"]: value,
                [changeProp]: value => {
                    if (typeof props[changeProp] === "function") props[changeProp](value);
                    if (props["id"] == "timestamp-modal-time" || props["id"] == "timestamp-modal-date") setValue(value.target.value);
                    else setValue(value);
                }
            });
        },
        updateFormatPreview = (Component, changeProp = "onChange") => props => {
            const [value, setValue] = BdApi.React.useState(props["value"]);

            let timeFormats = {
                t: inputTime.toLocaleString(undefined, { hour: '2-digit', minute: '2-digit'}).replace(' at', ''),
                T: inputTime.toLocaleString(undefined, { timeStyle: 'medium' }).replace(' at', ''),
                d: inputTime.toLocaleString(undefined, { dateStyle: 'short' }).replace(' at', ''),
                D: inputTime.toLocaleString(undefined, { dateStyle: 'long' }).replace(' at', ''),
                f: inputTime.toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' }).replace(' at', ''),
                F: inputTime.toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' }).replace(' at', ''),
                R: getRelativeTime(inputTime)
            };

            const [FormatOptions, setFormatOptions] = BdApi.React.useState([ {value: "t", label: timeFormats.t}, {value: "T", label: timeFormats.T}, {value: "d", label: timeFormats.d}, {value: "D", label: timeFormats.D}, {value: "f", label: timeFormats.f}, {value: "F", label: timeFormats.F}, {value: "R", label: timeFormats.R} ]);

            setFormatOpts = setFormatOptions;

            props.options = FormatOptions;

            return BdApi.React.createElement(Component, {
                ...props,
                ["value"]: value,
                [changeProp]: value => {
                    if (typeof props[changeProp] === "function") props[changeProp](value);
                    setValue(value);
                },
            });
        };

    return class SendTimestamp extends Plugin {
        constructor() {
            super();
            this.defaultSettings = {};
            this.defaultSettings.tabIndex = 1;
            this.defaultSettings.onRight = true;
        }

        onStart() {
            PluginUtilities.addStyle(this.getName(), css);
            this.addButton();
        }

        onStop() {
            this.removeButton();
            PluginUtilities.removeStyle(this.getName());
        }

        getSettingsPanel() {
            this.removeButton();
            const
                arr = [1, 2, 3, 4, 5, 6, 7, 8, 9],
                max = this.settings.onRight?document.querySelector(".buttons-3JBrkn").childElementCount:document.querySelector(".attachWrapper-2TRKBi").childElementCount;
            this.addButton();

            return Settings.SettingPanel.build(this.saveSettings.bind(this),
                new Settings.Switch("Button on right", "Place button on right with all buttons or on left with the upload button.", this.settings.onRight, (e) => {
                    this.settings.onRight = e;
                    this.removeButton();
                    this.addButton();
                }),
                new Settings.Slider("Position", "Position of the button from left", 1, max, this.settings.tabIndex, (e) => {
                    this.settings.tabIndex = e;
                    this.removeButton();
                    this.addButton();
                }, {
                    markers: arr.slice(0, max+1),
                    stickToMarkers: true
                }),
            );
        }

        removeButton() {
            const button = document.querySelector(".timestamp-button");
            if (button) button.remove();
        }

        addButton() {
            const
                form = document.querySelector("form"),
                button = DOMTools.createElement(buttonHTML);
            
            if (form.querySelector(".timestamp-button")) return;

            if (this.settings.onRight) {
                if (this.settings.tabIndex > document.querySelector(".buttons-3JBrkn").childElementCount) this.settings.tabIndex = document.querySelector(".buttons-3JBrkn").childElementCount+1;

                if (this.settings.tabIndex==1) form.querySelector(`.buttons-3JBrkn`).prepend(button);
                else form.querySelector(`.buttons-3JBrkn > *:nth-child(${this.settings.tabIndex-1})`).after(button);
            }
            else {
                if (this.settings.tabIndex > document.querySelector(".attachWrapper-2TRKBi").childElementCount) this.settings.tabIndex = document.querySelector(".attachWrapper-2TRKBi").childElementCount+1;

                if (this.settings.tabIndex==1) form.querySelector(`.attachWrapper-2TRKBi`).prepend(button);
                else form.querySelector(`.attachWrapper-2TRKBi > *:nth-child(${this.settings.tabIndex-1})`).after(button);
            };
        
            button.on("click", this.showTimesampModal);
        }

        showTimesampModal() {
            inputTime = new Date();
            inputTime.setSeconds(0);

            let dateInput = BdApi.React.createElement(FormItem, {
                    className: 'timestamp-modal',
                    title: "Date",
                    children: [
                        BdApi.React.createElement(createUpdateWrapper('input'), {
                            type: "date",
                            id: "timestamp-modal-date",
                            value: `${inputTime.getFullYear()}-${inputTime.getMonth()+1<10?`0${inputTime.getMonth()+1}`:inputTime.getMonth()+1}-${inputTime.getDate()<10?`0${inputTime.getDate()}`:inputTime.getDate()}`,
                            className: "timestamp-modal-custom-input",
                            onChange: (e) => {
                                let t = e.target.value.split('-');
                                inputTime.setFullYear(t[0]);
                                inputTime.setMonth(t[1] - 1);
                                inputTime.setDate(t[2]);
                            }
                        })
                    ]
                }),
                timeInput = BdApi.React.createElement(FormItem, {
                    className: 'timestamp-modal',
                    title: "Time",
                    id: "timestamp-modal-time-section",
                    children: [
                        BdApi.React.createElement(createUpdateWrapper('input'), {
                            type: "time",
                            id: "timestamp-modal-time",
                            value: `${inputTime.getHours()<10?`0${inputTime.getHours()}`:inputTime.getHours()}:${inputTime.getMinutes()<10?`0${inputTime.getMinutes()}`:inputTime.getMinutes()}`,
                            className: "timestamp-modal-custom-input",
                            onChange: (e) => {
                                let t = e.target.value.split(':');
                                inputTime.setHours(t[0]);
                                inputTime.setMinutes(t[1]);
                            }
                        })
                    ]
                }),
                formatInput = BdApi.React.createElement('div', {
                    id: "timestamp-modal-format",
                }, BdApi.React.createElement(FormItem, {
                    className: 'timestamp-modal',
                    title: "Format",
                    children: [
                        BdApi.React.createElement(updateFormatPreview(Dropdown), { onChange: (format) => { inputFormat = format }, value: inputFormat, options: [{value: "t", label: "Short Time"}, {value: "T", label: "Long Time"}, {value: "d", label: "Short Date"}, {value: "D", label: "Long Date"}, {value: "f", label: "Short Date/Time"}, {value: "F", label: "Long Date/Time"}, {value: "R", label: "Relative Time"}] })
                    ]
                }));
 
            Modals.showModal( "Select Date and Time", [ dateInput, timeInput, formatInput ], {
                confirmText: "Enter",
                onConfirm: () => {               
                    BdApi.findModuleByProps("ComponentDispatch").ComponentDispatch.dispatchToLastSubscribed(BdApi.findModuleByProps("ComponentActions").ComponentActions.INSERT_TEXT, {content: `<t:${Math.floor(inputTime.getTime()/1000)}:${inputFormat}> `});
                }
            });
        }


        observer(e) {
            if (!e.addedNodes.length || !(e.addedNodes[0] instanceof Element)) return;
            if (e.addedNodes[0].querySelector(DiscordSelectors.Textarea.inner)) {
                this.addButton(e.addedNodes[0]);
            }
        }
    };

};
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
