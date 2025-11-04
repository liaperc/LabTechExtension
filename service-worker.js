chrome.tabs.onCreated.addListener((tab) =>{
    console.log("New tab!",tab)
});

// Opens the extension automatically when on the order page of recognized URLs
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
    // HANDLING ALL STORAGE
    if (request.type === "SET_SOMETHING"){
        //2nd arg is a callback function once stored
        let name = request.name
        chrome.storage.local.set({[name]: request.item}, () => {
            console.log(`${name} stored.`)
            sendResponse({message: `${name} stored successfully!`})
        });
        //need this to keep the connection open??
        return true;
    }

    // HANDLING CALLING QUARTZY API
    if (request.type === "FETCH_QUARTZY"){
        chrome.storage.local.get(['APIKey'], (result) =>{
            //getting order data
            const url = 'https://api.quartzy.com/order-requests'
            console.log(result.APIKey)
            orderData = fetch(url, {
                method: 'GET',
                headers: {
                    'Access-Token': result.APIKey 
                }
            })
                .then(response => {
                    if (!response.ok){
                        throw new Error("Error fetching Quartzy data:", response.error)
                    }
                    return response.json()})
                .then(data => {
                    
                    console.log("Full Quartzy API response:", data);
                    //trimming order data
                    const receivedOrders = data.filter(order => order.status === "RECEIVED");
                    console.log(receivedOrders)
                    sendResponse({'orderData': receivedOrders});
                })
                .catch((err) => {
                    console.error(err);
                    sendResponse({ message: err.message});
                });

        });
        return true;
    }

    // HANDLING SENDING QUARTZY DATA TO SHEETS
    if (request.type === "SEND_QUARTZY"){
        QuartzyToSheet(request.data)
            .then(() => {
                sendResponse({message: "Orders uploaded!"})
            })
            .catch((err) => {
                console.error(err);
                sendResponse({ message: err.message});
            });
        return true;
    }
});


// Authenticates user, sends inputted data to a google sheet (also given by the user)
// theoretically can send anything to sheets as long as its a JSON array of arrays
// and the sub array contains the desired elements
async function QuartzyToSheet(orderData){
    const authToken = await new Promise((resolve,reject) => {
        chrome.identity.getAuthToken({ interactive: true }, function(authToken) {
         if (chrome.runtime.lastError){
            reject(chrome.runtime.lastError)
         } else {
            resolve(authToken)
         }
        })
    });

    const {SpreadSheetID} = await chrome.storage.local.get(['SpreadSheetID'])
    const {SheetID} = await chrome.storage.local.get(['SheetID'])
    const SPREADSHEET_ID = SpreadSheetID;
    const SHEET_NAME = SheetID;
    const range = `${SHEET_NAME}!A1`

    const rows = orderData.map(order => [
        // THIS IS WHERE WE DECIDE THE FORMATTING OF DATA ENTRY
        order.item_name,
        order.vendor_name,
        order.catalog_number,
        order.quantity,
        order.unit_price,
        order.total_price
            ? (parseFloat(order.total_price.amount) / 100).toFixed(2)
            : "",
        order.created_by ? order.created_by.email : "",
        // CHANGE THIS TO BE ACCURATE TO THE DESIRED PO#
        order.purchase_order_number || "",
    ]);

    const dataBody = {
        values: rows
    };

    // CALLING SHEETS API
    // https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.values/append#authorization-scopes
    const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}:append?valueInputOption=USER_ENTERED`,
        {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dataBody)
        }
    )

    const result = await response.json();
    console.log(result);
}