/**
 * Handles forms
 */
import { apimanager as apiman } from "/framework/js/apimanager.mjs";
import {router} from "/framework/js/router.mjs";


async function submit(form, element) {
    if (form.name == "" || form.company == "" || form.designation == "" || form.serviceoffered == "" || form.email == "" || form.tel == "" || form.country == "" || form.message == "" ) 
    {
        alert('Please fill in required details');
    }
    else {
	    const contactData = {
        	name: form.name,
        	company: form.company,
        	email: form.email,
        	tel: form.tel,
        	message: form.message,
            designation: form.designation,
            serviceoffered : form.serviceoffered,
            website : form.website,
            country : form.country
        }
        
        for (var key in contactData) {
            if (contactData[key] === undefined) {
                contactData[key] = "N/A";
            }
        }

    	const apiResponse = await apiman.rest(APP_CONSTANTS.API_SEND_CONTACTS_EMAIL, "POST", contactData, true, false);
        alert ("Message Request succesfully sent!"); 
        router.reload();
    }    

}
    

export const contactform = {submit}