chrome.tabs.onCreated.addListener((tab) =>{
    console.log("New tab!",tab)
});

chrome.tabs.onUpdated.addListener((tabId,changeInfo,tab) => {
    console.log("worked")
    //we want to see if the tab has been properly loaded, of course
    if (changeInfo.status == "complete" && tab.url){
        console.log("tab done loading",tab.url);
        let tabParts = tab.url.split("/");
        console.log(tabParts);
        //idk if this is useful, but it's definitely nice
        let quartzyCheck = tabParts.includes("app.quartzy.com") && tabParts.includes("requests?status[]=PENDING")
        console.log("includes quartzy?",tabParts.includes("quartzy.com"))
        console.log("includes pending?",tabParts.includes("requests?status[]=PENDING"))
        if (quartzyCheck){
            chrome.action.openPopup()
                .then(() => console.log("popup opened!"))
                .catch(err => console.error("ERROR:",err))
        } else if (false){ //TODO: add FLINN!!

        }
    };
});
//request is the actual content of the message
chrome.runtime.onMessage.addListener((request,sender,sendResponse) => {
    // HANDLING API KEY SETTING
    if (request.type === "SET_API_KEY"){
        //2nd arg is a callback function once stored
        chrome.storage.local.set({APIKey: request.APIKey}, () => {
            console.log("API key stored.")
            sendResponse({message: "API key stored successfully!"})
        });
        //need this to keep the connection open??
        return true;
    }

    if (request.type === "FETCH_QUARTZY"){
        chrome.storage.local.get(['APIKey'], (result) =>{
            const url = 'https://api.quartzy.com/order-requests'
            orderData = fetch(url, {
                method: 'GET',
                headers: {
                    'Access-Token': result.APIKey
                }
            })
                .then(response => {return response.json()})
                .then(data => {console.log(data)})
        });
        return true;
    }
});