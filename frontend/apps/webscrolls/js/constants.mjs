/* 
 * (C) 2015 TekMonks. All rights reserved.
 * License: MIT - see enclosed license.txt file.
 */
const FRONTEND = "http://localhost:8080";
const BACKEND = "http://localhost:9090";
const APP_PATH = `${FRONTEND}/apps/webscrolls`;
const API_PATH = `${BACKEND}/apps/webscrolls`;

export const APP_CONSTANTS = {
    FRONTEND, BACKEND, APP_PATH,
    COMPONENT_PATH: APP_PATH+"/components",
    MAIN_HTML: APP_PATH+"/home.html",
    ARTICLE_HTML: APP_PATH+"/article.html",
    LANDING_HTML: APP_PATH+"/landing.html",
    BLOGS_HTML: APP_PATH+"/blogs.html",
    INDEX_HTML: APP_PATH+"/index.html",
    CONTACTUS_HTML: APP_PATH+"/contactus.html",
    ERROR_HTML: FRONTEND+"/framework/error.html",
    CMS_ROOT_URL: `${APP_PATH}/articles`,

    // CMS APIs
    API_CMS_DIR_CONTENTS: API_PATH+"/cmsdirlisting",
    API_NAV_MENU_LISTING: API_PATH+"/navmenulisting",
    API_SEND_CONTACTS_EMAIL: API_PATH+"/sendcontactsemail",

    SESSION_NOTE_ID: "com_monkshu_app_mnkp",

    // Login constants
    MIN_PASS_LENGTH: 8,
    API_LOGIN: `${API_PATH}/login`,
    BCRYPT_SALT: "$2a$10$VFyiln/PpFyZc.ABoi4ppf",
    USERID: "id",
    USER_ROLE: "user",
    GUEST_ROLE: "guest"
}

APP_CONSTANTS.PERMISSIONS_MAP = {
    user:[APP_CONSTANTS.INDEX_HTML, APP_CONSTANTS.MAIN_HTML, APP_CONSTANTS.ARTICLE_HTML, APP_CONSTANTS.LANDING_HTML, APP_CONSTANTS.BLOGS_HTML, APP_CONSTANTS.CONTACTUS_HTML, APP_CONSTANTS.ERROR_HTML], 
    guest:[APP_CONSTANTS.INDEX_HTML, APP_CONSTANTS.MAIN_HTML, APP_CONSTANTS.ARTICLE_HTML, APP_CONSTANTS.LANDING_HTML, APP_CONSTANTS.BLOGS_HTML, APP_CONSTANTS.CONTACTUS_HTML, APP_CONSTANTS.ERROR_HTML]
}