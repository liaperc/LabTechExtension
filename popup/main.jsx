import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

//makes a root in the root ID we defined in index.html
//render actually makes it show up
ReactDOM.createRoot(document.getElementById('root')).render(
    //strictmode is for catching development errors
    <React.StrictMode>
        {/* we tell it to load in the App */}
        <App/>
    </React.StrictMode>
);