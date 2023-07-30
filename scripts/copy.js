const fs = require("fs");
const path = require("path");

const BDPath = path.resolve(process.env.APPDATA, "BetterDiscord", "plugins");

fs.readdirSync("./dist").forEach(file => {
    if (!file.endsWith(".plugin.js")) return;
    fs.copyFileSync(path.resolve("./dist", file), path.resolve(BDPath, file));
});