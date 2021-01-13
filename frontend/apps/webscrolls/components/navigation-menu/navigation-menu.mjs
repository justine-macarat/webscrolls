/* 
 * (C) 2019 TekMonks. All rights reserved.
 * License: MIT - see enclosed license.txt file.
 */
import {i18n} from "/framework/js/i18n.mjs";
import {session} from "/framework/js/session.mjs";
import {monkshu_component} from "/framework/js/monkshu_component.mjs";

async function elementConnected(element) {
	let level1 = [];

	try {
		if (element.getAttribute("file")) level1 = (await(await fetch(
			`${APP_CONSTANTS.CMS_ROOT_URL}/${element.getAttribute("file")}`)).json()).level1;
		else if (element.getAttribute("level")) {
			const level = element.getAttribute("level"), lang = session.get($$.MONKSHU_CONSTANTS.LANG_ID);
			console.log(level);
			const menuResult = await(await fetch(`${APP_CONSTANTS.API_NAV_MENU_LISTING}?q=${level}&lang=${lang}`)).json();
			if (menuResult.result) level1 = menuResult.menu.level1;
		}
	} catch (err) {}

	const data = { logo: element.getAttribute("logo"), level1 }
	data.level1 = element.getAttribute("massage_menu") && (element.getAttribute("massage_menu").toLowerCase() == "false") 
		? data.level1 : await _massageMenu(element, data.level1, 1);

	if (element.getAttribute("styleBody")) data.styleBody = `<style>${element.getAttribute("styleBody")}</style>`
	if (element.getAttribute("logo_style")) data.logostyle = `style="${element.getAttribute("logo_style")}"`;

	// attach content functions
	const {content_post} = await import(`${APP_CONSTANTS.COMPONENT_PATH}/content-post/content-post.mjs`);
	const content_functions = content_post.getContentFunctions(); Object.assign(data, content_functions);

	if (element.id) {
		if (!navigation_menu.datas) navigation_menu.datas = {}; navigation_menu.datas[element.id] = data;
	} else navigation_menu.data = data;
}

function enableDescription(searchElement, id) {
	const elementDescriptions = searchElement.parentElement.parentElement.querySelectorAll(".description");
	elementDescriptions.forEach(element => {if (element.id == id) element.classList.add("visible"); else element.classList.remove("visible");});

	const elementMenuBgImage = searchElement.parentElement.parentElement.querySelectorAll(".menubgimage");
	elementMenuBgImage.forEach(element => {if (element.id == id) element.classList.add("visible"); else element.classList.remove("visible");});

	const elementSubmenus = searchElement.parentElement.querySelectorAll(".submenu");
	elementSubmenus.forEach(element => {if (element === searchElement) element.classList.add("selected"); else element.classList.remove("selected");});
}

async function _massageMenu(element, entries, level) {
	const i18nObj = await i18n.getI18NObject(session.get($$.MONKSHU_CONSTANTS.LANG_ID));
	const {content_post} = await import(`${APP_CONSTANTS.APP_PATH}/components/content-post/content-post.mjs`);

	let levelCheck = "level"+(level+1);
	for (let entry of entries) {

		// translate the menu item entry or otherwise upcase it properly etc.
		if (i18nObj[entry.item]) entry.item = i18nObj[entry.item]; else {
			if (entry.item.length) entry.item = entry.item.substring(0, 1).toUpperCase() + entry.item.substring(1);
			if (entry.item.indexOf('.') != -1) entry.item = entry.item.substring(0, entry.item.indexOf('.'));
		}

		// render descriptions
		if (entry.description) entry.description = await content_post.renderArticle(null, entry.description);

		if (entry[levelCheck]) {
			if (element.getAttribute("menu_arrow")) entry.item = `${entry.item}${element.getAttribute("menu_arrow")}`;
			entry[levelCheck] = await _massageMenu(element, entry[levelCheck], level+1);
		}
	}

	return entries;
}

function register() {
	// convert this all into a WebComponent so we can use it
	monkshu_component.register("navigation-menu", `${APP_CONSTANTS.APP_PATH}/components/navigation-menu/navigation-menu.html`, navigation_menu);
}

const trueWebComponentMode = true;	// making this false renders the component without using Shadow DOM

export const navigation_menu = {trueWebComponentMode, register, elementConnected, enableDescription}