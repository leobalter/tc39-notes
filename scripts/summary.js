#!/usr/bin/env node

// System objects
const fs = require("fs");
const path = require("path");

// Third party objects
const glob = require("glob");
const toc = require("markdown-toc");
const mdlink = require("markdown-link", "mdlink");
const argv = require("minimist")(process.argv.slice(2), {
    string: ["_"]
});

if (!argv._.length) {
    console.error(`Folder not specified.
    
Usage example:

./scripts/summary.js es9/2018-03`);
} else {
    main();
}

function main() {
    const folder = argv._[0];
    glob(`./${folder}/*.md`, (error, results) => {
        if (error) {
            throw error;
        }

        const writable = fs.createWriteStream(`${folder}/summary.md`, { flags: 'w' });
        const filePattern = /^\w*-\d+\.[mM][dD]$/;

        results.forEach(file => {
            if (!filePattern.test(path.basename(file))) {
                return;
            }
            const contents = fs.readFileSync(file, "utf8");
            const fileToc = toc(contents, {
                filter(str, ele) {
                    return ele.lvl < 3;
                },
                append: "\n",
                linkify({ lvl }, title, slug) {
                    // prepends the filename to the link
                    let content = mdlink(title, `${path.basename(file)}#${slug}`);
                    return {
                        content,

                        // lvl is required to find the highest level links and order it
                        lvl
                    };;
                }
            });

            const rendered = fileToc.content;

            writable.write(rendered);
        });

        writable.end();
    });
}
