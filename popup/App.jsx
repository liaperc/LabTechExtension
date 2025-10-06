import React, {useState, useEffect} from "react";
import { HashRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import './styles.css'

function InitialPop(){
    const navigate = useNavigate();

    const [token, setToken] = useState(null);
    const [error, setError] = useState(null);

    const getOAuthToken = () => {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
            if (chrome.runtime.lastError) {
                setError(chrome.runtime.lastError.message);
            } else {
                setToken(token);
                console.log("OAuth token:", token);
            }
        });
    };




    return(
        //TODO: need to add more styling CSS later on
        <div>
            {/* TODO: set the screen to navigate to later */}
            {/* onClick={() => navigate("")} */}
            <button className="button">
                {/* TODO: have the extension say the name of the page! */}
                Scrape Page
            </button>
            <button className="button" onClick={showQuartzyOrders}>
                Get Quartzy Orders
            </button>
            <button className="button" onClick={() => navigate("/settings")}>
                Settings
            </button>
            {/* <button className="button" onClick={getOAuthToken}>
                Test Google OAuth
            </button> */}
            {/* TEST TO SHOW STORED API KEY */}
            {/* <button onClick={() => {
                chrome.storage.local.get(['APIKey'], (result) => {
                    alert(result.APIKey);
                });
            }}>
                show API key sillies
            </button> */}
        </div>
    );
}

function Settings(){
    const navigate = useNavigate();
    return(
        <div>
            <button className="button" onClick={() => changeStorage('Please enter your Quartzy API key.','APIKey')}>
                Change API Key
            </button>
            <button className="button" onClick={() => changeStorage('Please enter your SpreadSheet ID. Example URL: \n https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit?gid=0#gid=0','SpreadSheetID')}>
                Change SpreadSheet ID
            </button>
            <button className="button" onClick={() => changeStorage('Please enter the name of your specific sheet WITHIN the SpreadSheet.','SheetID')}>
                Change Specific Sheet ID
            </button>
            <button className="button" onClick={() => navigate("/")}>
                Back
            </button>
        </div>
    )
}

function changeStorage(user_msg,name){
    const value = prompt(user_msg);
    if (!value) return;
    if (value) {
        chrome.runtime.sendMessage(
            {type: "SET_SOMETHING",item: value,name:name},
            (response) => {
                if (response && response.message){
                    alert(response.message);
                }
            }
        );
    }
}
function getQuartzyOrders(){
    return new Promise((resolve) => {
        chrome.runtime.sendMessage(
            {type: "FETCH_QUARTZY"},
            (response) => {
                // TODO ADD SOMEKIND OF FEEDBACK IDK
                if (response && response.message){
                    alert(response.message);
                }
                resolve(response.orderData);
            }
        );
    });
}
//asynchronous, so we use await etc.
async function showQuartzyOrders() {
    let orders;
    try {
        orders = await getQuartzyOrders();
        console.log("got orders:",orders);        
    } catch (e){
        alert("error fetching orders",e);
        console.error("error fetching orders",e);
    }
    try {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage(
                {type: "SEND_QUARTZY",data: orders},
                (response) => {
                    // TODO ADD SOMEKIND OF FEEDBACK IDK
                    if (response && response.message){
                        alert(response.message);
                    }
                    resolve(response.message);
                }
            );
        });
    }catch (e){
        alert("error sending orders",e);
        console.error("error sending orders",e);
    }
}

export default function App(){
    return(
        <Router>
            <Routes>
                <Route path="/" element={<InitialPop/>}/>
                <Route path="/settings" element={<Settings/>}/>
                {/* ADD MORE ROUTES HERE */}
            </Routes>
        </Router>
        // <div>
        //     <h1>yo</h1>
        //     <button>yo press me</button>
        // </div>
    );
}