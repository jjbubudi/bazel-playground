const fs = require("fs");
const path = require("path");

const binDir = process.argv[2];
const workspaceName = process.argv[3];
const packageName = process.argv[4];
const output = process.argv[5];

function wrap(name, content) {
    const refinedContent = content
        .replace(/\.\.\//g, `${workspaceName}/`)
        .replace(/(\.js)('|")/g, "$2");
    return `
define("${workspaceName}/${packageName}/${name}", function(require, exports, module) {
${refinedContent}
});`
}

const fileName = path.parse(output).base;
if (fileName.endsWith(".ts")) {
    fs.copyFileSync(output, `${binDir}/${packageName}/${fileName}`);
} else {
    const content = fs.readFileSync(output, "utf8");
    fs.writeFileSync(`${binDir}/${packageName}/${fileName}`, wrap(fileName.replace(".js", ""), content));
}
