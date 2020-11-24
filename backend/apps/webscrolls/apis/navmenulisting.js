/* 
 * (C) 2015 TekMonks. All rights reserved.
 */
const API_CONSTANTS = require(`${__dirname}/lib/constants.js`);
const path = require("path");
const fs = require("fs");
const readdirAsync = require("util").promisify(require("fs").readdir);
const readFileAsync = require("util").promisify(require("fs").readFile);
const statAsync = require("util").promisify(require("fs").stat);

exports.doService = async jsonReq => {
	if (!validateRequest(jsonReq)) {LOG.error("Validation failure."); return CONSTANTS.FALSE_RESULT;}
    
    let cmsPath = path.resolve(`${API_CONSTANTS.CMS_ROOT}/${jsonReq.q}`);
	LOG.debug(`Got menu listing request for path: ${cmsPath}`);

    let menu = {level1: []};

    try {
        for (const entry of await readdirMenuOrderFileAsyncReturnLevel1Dir(cmsPath)) {
            if (entry.startsWith('.')) continue;    // hidden

            let menu_entry = {item: entry, id:`${encodeURI(cmsPath+"/"+entry)}`};
            let sub_entries = await readdirAsyncReturnOnlyDirs(`${cmsPath}/${entry}`, cmsPath);
            if (sub_entries.length > 0) {
                menu_entry.hasLevelTwo = true; menu_entry.level2 = []
                for (let sub_entry of sub_entries) {
                    const sub_menu = {item: sub_entry, sub: sub_entries, id:`${encodeURI(cmsPath+"/"+entry+"/"+sub_entry)}`};
                    try {
                        const fileToRead = `${cmsPath}/${entry}/${sub_entry}/${getEntryi18nName(sub_entry, jsonReq.lang)}`;
                        sub_menu.description = await readFileAsync(fileToRead, "utf8");
                    }
                    catch (err) {sub_menu.description = sub_entry};
                    menu_entry.level2.push(sub_menu);
                }
            };
            menu.level1.push(menu_entry);
        }
        return {result: true, menu}; 
    } 
    catch (err) {return {result: true, menu};}
}

function getEntryi18nName(entry, lang) {
    let i18nName = entry.indexOf('.') != -1 ?
        entry.substring(0, entry.lastIndexOf(".")+1)+lang+".menu"+entry.substring(entry.lastIndexOf(".")):
        `${entry}.en.menu.md`;
	return i18nName;
}

async function readdirMenuOrderFileAsyncReturnLevel1Dir(path) {
    let files = [];
    let menuOrderFile = "menuorder.json";

    const fileExists = (file) => {
        return new Promise((resolve, reject) => {
            fs.access(file, fs.constants.F_OK, (err) => {
                err ? reject(false) : resolve(true)
            });
        })
    }

    if (fileExists(`${path}/${menuOrderFile}`)) {
        level1Data = JSON.parse(await readFileAsync(`${path}/${menuOrderFile}`, "utf8"));
        for (var i=0; i<level1Data.level1.length; i++) {
            files.push(level1Data.level1[i].item);
        }
    }
    else {
        files = await readdirAsync(path); let sortedFiles = [];
        for (const file of files) {
            const fileStats = await statAsync(`${path}/${file}`);
            if (!fileStats.isDirectory()) continue; else sortedFiles.push({file, mtime: fileStats.mtimeMs});
        }
        sortedFiles.sort((a,b) => a.mtime - b.mtime); files = [];
        for (const file of sortedFiles) files.push(file.file);
    }

    return files;
}

async function readdirAsyncReturnOnlyDirs(path) {
    const files = await readdirAsync(path); let filesFiltered = [];
    for (const file of files) if ((await statAsync(`${path}/${file}`)).isDirectory()) filesFiltered.push(file);
    return filesFiltered;
}

const validateRequest = jsonReq => (jsonReq && jsonReq.q && jsonReq.lang);
