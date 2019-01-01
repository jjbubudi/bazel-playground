const fs = require("fs");
const path = require("path");
const argv = require("yargs-parser")(process.argv.slice(2));

const binDir = argv.binDir
const workspace = argv.workspace;
const package = argv.package;
const input = argv.input;

function wrap(name, content) {
    const refinedContent = content
        .replace(/\.\.\//g, `${workspace}/`)
        .replace(/(\.js)('|")/g, "$2");
    return `
define("${workspace}/${package}/${name}", function(require, exports, module) {
${refinedContent}
});`
}

const fileName = path.parse(input).base;
const content = fs.readFileSync(input, "utf8");
fs.writeFileSync(`${binDir}/${package}/${fileName}`, wrap(fileName.replace(".js", ""), content));
