import typescript from '@rollup/plugin-typescript';
import { readdirSync } from "fs";
import { parse } from "path";

const WIDGET_LOADER_BANNER = `// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: __iconColor__; icon-glyph: __iconGlyph__;
`;

const widgetModuleFilenames = readdirSync("scripts/")
    .filter(fileName => fileName.endsWith(".js.ts"));

function getBanner(fileName){
    console.log(fileName);
    if (['IncidenceWidget.js.ts'].includes(fileName)){
        // add header for RKI License
        return WIDGET_LOADER_BANNER + '// Licence: Robert Koch-Institut (RKI), dl-de/by-2-0';
    }
    else {
        return WIDGET_LOADER_BANNER;
    }
}

export default [
    ...(widgetModuleFilenames.map(fileName => (
        {
        input: `scripts/${fileName}`,
        output: {
            dir: './build',
            format: 'es',
            strict: false,
            name: parse(fileName).name,
            banner: getBanner(fileName),
        },
        plugins: [typescript()]
    }))),
];