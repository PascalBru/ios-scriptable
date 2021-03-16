const ROOT_MODULE_PATH = "config-files";

async function getFile(filename: string): Promise<Data> {
    const fm = FileManager.iCloud()

    const rootModuleDir = fm.joinPath(fm.documentsDirectory(), ROOT_MODULE_PATH)
    const filePath = fm.joinPath(rootModuleDir, filename)

    try {
        if (fm.fileExists(filePath)){
            await fm.downloadFileFromiCloud(filePath)
            return fm.read(filePath);
        }

    } catch (error) {
        console.error("error while reading "+ filePath)
        console.error(error)
    }

    return Data.fromString('');
}

function writeFile(filename: string, json: Data) {
    const fm = FileManager.iCloud()

    const rootModuleDir = fm.joinPath(fm.documentsDirectory(), ROOT_MODULE_PATH)
    enforceDir(fm, rootModuleDir);

    const filePath = fm.joinPath(rootModuleDir, filename)

    try {
        fm.write(filePath, json);
    } catch (error) {
        console.error("error while reading "+ filePath)
        console.error(error)
    }
}

const enforceDir = (fm: FileManager, path: string) => {
    if (fm.fileExists(path) && !fm.isDirectory(path)) {
        fm.remove(path)
    }
    if (!fm.fileExists(path)) {
        fm.createDirectory(path)
    }
}

export { getFile, writeFile };
