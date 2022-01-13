/**
 * @name SendTimestamps
 * @author Taimoor
 * @authorId 220161488516546561
 * @version 1.1.5
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
            version: "1.1.5",
            description:
                "Use Discord's latest feature of using timestamps in your messages easily.",
            github: "https://github.com/Taimoor-Tariq/BetterDiscordStuff/blob/main/Plugins/SendTimestamps/SendTimestamps.plugin.js",
            github_raw:
                "https://raw.githubusercontent.com/Taimoor-Tariq/BetterDiscordStuff/main/Plugins/SendTimestamps/SendTimestamps.plugin.js",
        },
        changelog: [
            {title: "Improvements", type: "improved", items: [
                "Bugs Fixed"
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
        css = `.timestamp-button button { min-height: 32px; min-width: 32px; margin-left: 0px; background-color: transparent; }
.timestamp-button svg { width: 21px; height: 21px; color: var(--interactive-normal); }
.timestamp-button svg:hover { color: var(--interactive-hover); }

div[class*="buttons"] .timestamp-button { margin-left: -3px; margin-top: 4px; }
div[class*="attachWrapper"] .timestamp-button { margin-left: 4px; margin-top: 4px; }

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
    background-image: url("data:image/svg+xml,%3Csvg role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='currentColor' d='M256,8C119,8,8,119,8,256S119,504,256,504,504,393,504,256,393,8,256,8Zm92.49,313h0l-20,25a16,16,0,0,1-22.49,2.5h0l-67-49.72a40,40,0,0,1-15-31.23V112a16,16,0,0,1,16-16h32a16,16,0,0,1,16,16V256l58,42.5A16,16,0,0,1,348.49,321Z'%3E%3C/path%3E%3C/svg%3E");
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
        buttonHTML = `<div class="buttonContainer-2lnNiN timestamp-button">
    <button aria-label="Enter timestamp" type="button">
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

            this.state = {
                btns_n: 1,
            }
        }

        onStart() {
            PluginUtilities.addStyle(this.getName(), css);
            let form = document.querySelector("form")?.querySelector("div > div > div > div > div");
            if (form) {
                if (this.settings.onRight) form = form.querySelector("div:nth-child(2)");
                else form = form.querySelector("div:nth-child(4)");

                this.state.btns_n = form.childElementCount;
            }
            this.addButton();
        }

        onStop() {
            this.removeButton();
            PluginUtilities.removeStyle(this.getName());
        }

        getSettingsPanel() {
            this.removeButton();
            let form = document.querySelector("form")?.querySelector("div > div > div > div > div");

            if (form) {
                if (this.settings.onRight) form = form.querySelector("div:nth-child(2)");
                else form = form.querySelector("div:nth-child(4)");

                this.state.btns_n = form.childElementCount;
            }

            return Settings.SettingPanel.build(this.saveSettings.bind(this),
                new Settings.Switch("Button on left", "Place button on right with all buttons or on left with the upload button.", this.settings.onRight, (e) => {
                    this.settings.onRight = e;
                    this.removeButton();
                    let form = document.querySelector("form")?.querySelector("div > div > div > div > div");
                    if (form) {
                        if (this.settings.onRight) form = form.querySelector("div:nth-child(2)");
                        else form = form.querySelector("div:nth-child(4)");
                        this.state.btns_n = form.childElementCount;
                    }
                    this.addButton();
                }),
                new Settings.Slider("Position", "Position of the button from left", 1, this.state.btns_n+1, this.settings.tabIndex, (e) => {
                    this.settings.tabIndex = e;
                    this.removeButton();
                    this.addButton();
                }, {
                    markers: Array.apply(null, Array(this.state.btns_n+1)).map(function (x, i) { return i+1; }),
                    stickToMarkers: true
                }),
            );
        }

        removeButton() {
            const button = document.querySelector(".timestamp-button");
            if (button) button.remove();
        }

        addButton() {
            let form = document.querySelector("form")?.querySelector("div > div > div > div > div"),
                button = DOMTools.createElement(buttonHTML);
            
            if (!form || form.querySelector(".timestamp-button")) return;

            if (this.settings.onRight) form = form.querySelector("div:nth-child(2)");
            else form = form.querySelector("div:nth-child(4)");

            this.state.btns_n = form.childElementCount;

            if (this.settings.tabIndex==1) form.prepend(button);
            else form.querySelector(`div:nth-child(${this.settings.tabIndex-1})`).after(button);
        
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