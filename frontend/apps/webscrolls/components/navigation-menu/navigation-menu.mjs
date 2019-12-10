/* 
 * (C) 2019 TekMonks. All rights reserved.
 * License: MIT - see enclosed license.txt file.
 */
import {monkshu_component} from "/framework/js/monkshu_component.mjs";
import {util} from "/framework/js/util.mjs";
import {session} from "/framework/js/session.mjs";
import {i18n} from "/framework/js/i18n.mjs";
import {router} from "/framework/js/router.mjs";

async function elementConnected(element) {
	let level1 = [];

	try {
		if (element.getAttribute("file")) level1 = (await(await fetch(
			`${APP_CONSTANTS.CMS_ROOT_URL}/${element.getAttribute("file")}`)).json()).level1;
		else if (element.getAttribute("level")) {
			let level = element.getAttribute("level"), lang = session.get($$.MONKSHU_CONSTANTS.LANG_ID);
			let menuResult = await(await fetch(`${APP_CONSTANTS.API_NAV_MENU_LISTING}?q=${level}&lang=${lang}`)).json();
			if (menuResult.result) level1 = menuResult.menu.level1;
		}
	} catch (err) {}

	let data = { logo: element.getAttribute("logo"), level1 }
	data.level1 = element.getAttribute("massage_menu") && (element.getAttribute("massage_menu").toLowerCase() == "false") 
		? data.level1 : await massageMenu(element, data.level1, 1);

	if (element.getAttribute("style")) data.style = `style="${element.getAttribute("style")}"`;
	if (element.getAttribute("logo_style")) data.logostyle = `style="${element.getAttribute("logo_style")}"`;
	if (element.getAttribute("menu_container_style")) data.menustyle = `style="${element.getAttribute("menu_container_style")}"`;
	if (element.getAttribute("menu_item_style")) data.menuitemstyle = `style="${element.getAttribute("menu_item_style")}"`;
	if (element.getAttribute("submenu_style")) data.mitemstyle = `style="${element.getAttribute("submenu_style")}"`;
	if (element.getAttribute("submenu_left_menu_style")) data.leftmenustyle = `style="${element.getAttribute("submenu_left_menu_style")}"`;
	if (element.getAttribute("submenu_right_menu_style")) data.rightmenustyle = `style="${element.getAttribute("submenu_right_menu_style")}"`;

	if (element.id) {
		if (!navigation_menu.datas) navigation_menu.datas = {}; navigation_menu.datas[element.id] = data;
	} else navigation_menu.data = data;
}

function elementRendered(element) {
	if (element.getAttribute("selected_submenu_style")) {
		let existingSelectedStyle = util.getCSSRule(element.shadowRoot, ".selected").style.cssText;
		util.getCSSRule(element.shadowRoot, ".selected").style.cssText = existingSelectedStyle + element.getAttribute("selected_submenu_style");
	}
}

function enableDescription(searchElement, id) {
	let elementDescriptions = searchElement.parentElement.parentElement.querySelectorAll(".description");
	elementDescriptions.forEach(element => {if (element.id == id) element.classList.add("visible"); else element.classList.remove("visible");});

	let elementSubmenus = searchElement.parentElement.querySelectorAll(".submenu");
	elementSubmenus.forEach(element => {if (element === searchElement) element.classList.add("selected"); else element.classList.remove("selected");});
}

async function massageMenu(element, entries, level) {
	let i18nObj = await i18n.getI18NObject(session.get($$.MONKSHU_CONSTANTS.LANG_ID));

	let levelCheck = "level"+(level+1);
	for (let entry of entries) {

		// translate the menu item entry or otherwise upcase it properly etc.
		if (i18nObj[entry.item]) entry.item = i18nObj[entry.item]; else {
			if (entry.item.length) entry.item = entry.item.substring(0, 1).toUpperCase() + entry.item.substring(1);
			if (entry.item.indexOf('.') != -1) entry.item = entry.item.substring(0, entry.item.indexOf('.'));
		}

		// render descriptions
		if (entry.description) entry.description = await renderArticle(entry.description);

		if (entry[levelCheck]) {
			if (element.getAttribute("menu_arrow")) entry.item = `${entry.item}${element.getAttribute("menu_arrow")}`;
			entry[levelCheck] = await massageMenu(element, entry[levelCheck], level+1);
		}
	}

	return entries;
}

async function renderArticle(article) {
	await $$.require(`${APP_CONSTANTS.APP_PATH}/components/navigation-menu/3p/showdown.min.js`);
	await $$.require(`${APP_CONSTANTS.APP_PATH}/components/navigation-menu/3p/showdown.extension.targetlink.min.js`);
	article = new showdown.Converter({
		parseImgDimensions: true, simplifiedAutoLink: true, tables: true, simpleLineBreaks: true, emoji: true, 
		underline: true, extensions: ["targetlink"] }).makeHtml(article);

	await $$.require("/framework/3p/mustache.min.js"); 
	Mustache.parse(article); let contentFunctions = getContentFunctions();
	article = Mustache.render(article, contentFunctions);

	return article;
}

function getContentFunctions() {
	return {makeLink: _ => (text, render) => router.encodeURL(render(text))}
}

function register() {
	// convert this all into a WebComponent so we can use it
	monkshu_component.register("navigation-menu", `${APP_CONSTANTS.APP_PATH}/components/navigation-menu/navigation-menu.html`, navigation_menu);
}

const trueWebComponentMode = true;	// making this false renders the component without using Shadow DOM

export const navigation_menu = {trueWebComponentMode, register, elementConnected, enableDescription, elementRendered}