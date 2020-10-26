// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: download;
// This constant is the name of your library file
// It will appear as an entry in Scriptable
const libraryName = args.queryParameters['name'];
const libContentPath = args.queryParameters['contentPath'];

if (libContentPath == undefined) {
    console.log('script started without contentPath, start Safari');
    Safari.open('https://github.com/PascalBru/ios-scriptable#list-of-scripts');
    Script.complete();
} else {
    //Set-up a local file manager object instance
    let fmLocal = FileManager.local();

    let modulePath = module.filename;
    console.log(modulePath);

    //These constants define where to place your library file
    const scriptableFilesPath = modulePath.replace('import_scripts.js', '');
    console.log(scriptableFilesPath);
    const libraryPath = `${scriptableFilesPath}${libraryName}.js`;

    //This is the content that will be written to the file
    const libContent = new Request(libContentPath).loadString().then(
        scriptString => {
            console.log(scriptString);
            //Create the library file with the content we defined above
            let result = fmLocal.writeString(libraryPath, scriptString);
        },
        err => {
            console.error(err);
        }
    );
}
