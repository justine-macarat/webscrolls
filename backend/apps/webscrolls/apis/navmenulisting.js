/* 
 * (C) 2015 TekMonks. All rights reserved.
 */
const API_CONSTANTS = require(`${__dirname}/lib/constants.js`);
const path = require("path");
const readdirAsync = require("util").promisify(require("fs").readdir);
const readFileAsync = require("util").promisify(require("fs").readFile);
const statSync = require("util").promisify(require("fs").stat);

exports.doService = async jsonReq => {
	if (!validateRequest(jsonReq)) {LOG.error("Validation failure."); return CONSTANTS.FALSE_RESULT;}
    
    let cmsPath = path.resolve(`${API_CONSTANTS.CMS_ROOT}/${jsonReq.q}`);
	LOG.debug(`Got menu listing request for path: ${cmsPath}`);

    let menu = {level1: []};
    try {
        for (let entry of await readdirChronoOrderAsync(cmsPath)) {
            if (entry.startsWith('.')) continue;    // hidden

            let menu_entry = {item: entry, id:`${encodeURI(cmsPath+"/"+entry)}`};
            let sub_entries = await readdirAsync(`${cmsPath}/${entry}`);
            if (sub_entries.length > 0) {
                menu_entry.hasLevelTwo = true; menu_entry.level2 = []
                for (let sub_entry of sub_entries) {
                    let sub_menu = {item: sub_entry, id:`${encodeURI(cmsPath+"/"+entry+"/"+sub_entry)}`};
                    try {
                        let fileToRead = `${cmsPath}/${entry}/${sub_entry}/${getEntryi18nName(sub_entry, jsonReq.lang)}`;
                        sub_menu.description = await readFileAsync(fileToRead, "utf8");
                    }
                    catch (err) {
                        sub_menu.description = sub_entry
                    };
                    menu_entry.level2.push(sub_menu);
                }
            };
            menu.level1.push(menu_entry);
        }
        return {result: true, menu}; 
    } 
    catch (err) {return CONSTANTS.FALSE_RESULT;}
}

function getEntryi18nName(entry, lang) {
    let i18nName = entry.indexOf('.') != -1 ?
        entry.substring(0, entry.lastIndexOf(".")+1)+lang+".menu"+entry.substring(entry.lastIndexOf(".")):
        `${entry}.en.menu.md`;
	return i18nName;
}

async function readdirChronoOrderAsync(path) {
    let files = await readdirAsync(path); let sortedFiles = [];
    for (file of files) sortedFiles.push({file, mtime: (await statSync(`${path}/${file}`)).mtimeMs});
    sortedFiles.sort((a,b) => a.mtime - b.mtime); files = [];
    for (file of sortedFiles) files.push(file.file);
    return files;
}

const validateRequest = jsonReq => (jsonReq && jsonReq.q && jsonReq.lang);
