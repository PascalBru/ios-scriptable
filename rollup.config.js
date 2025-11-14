import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import { readdirSync } from "fs";
import { parse } from "path";

const WIDGET_LOADER_BANNER = `// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: __iconColor__; icon-glyph: __iconGlyph__;
`;
import devConfig from './config.dev.json' with { type: "json" };
import prodConfig from './config.prod.json' with { type: "json" };

const dev = (process.env.NODE_ENV !== 'production');
const configValues = dev ? devConfig : prodConfig;

const widgetModuleFilenames = readdirSync("scripts/")
    .filter(fileName => fileName.endsWith(".ts"));

function getBanner(fileName){
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
        plugins: [
            typescript(),
            replace({
                preventAssignment: true,
                values: configValues
              }),
        ]
    }))),
];