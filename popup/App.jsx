import React, {useState, useEffect} from "react";
import { HashRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import './styles.css'

function InitialPop(){
    const navigate = useNavigate();
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
            <button className="button" onClick={changeAPI}>
                Change API Key
            </button>
            <button className="button" onClick={() => navigate("/")}>
                Back
            </button>
        </div>
    )
}

function changeAPI(){
    const APIKey = prompt("Enter your Quartzy API key:");
    if (!APIKey) return;
    if (APIKey) {
        chrome.runtime.sendMessage(
            {type: "SET_API_KEY",APIKey: APIKey},
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
    try {
        const orders = await getQuartzyOrders();
        console.log("got orders:",orders);

    } catch (e){
        alert("error fetching orders",e);
        console.error("error fetching orders",e);
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