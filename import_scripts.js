// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: magic;
//This constant is the name of your library file
//It will appear as an entry in Scriptable
const libraryName = args.queryParameters["name"];
const libContentPath = args.queryParameters["contentPath"];


//Set-up a local file manager object instance
let fmLocal = FileManager.local();

let modulePath = module.filename;
console.log(modulePath);

//These constants define where to place your library file
const scriptableFilesPath = modulePath.replace("import_scripts.js", "");
console.log(scriptableFilesPath);
const libraryPath = `${scriptableFilesPath}${libraryName}.js`;




//---
//The content in this section writes a library file
//Typically you would create & maintain the library in Scriptable
//We're only doing it here for the sake of example.

//This next constant defines two functions - square and cube
//This is the content that will be written to the file
const libContent = new Request(libContentPath).loadString().then(
    scriptString => {
        console.log(scriptString);
        //Create the library file with the content we defined above
        let result = fmLocal.writeString(libraryPath, scriptString);
}, err => {logError(err)});

