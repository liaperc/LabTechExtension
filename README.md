# Automatic pop-up when on recognized websites

Spec: When a user navigates to a predetermined recognized website (Quartzy or FLINN) the extension will show a small pop-up window asking the user if they would like to run the data transmission. When clicked, the data entry part of the extension will show.

# Settings & Authentication
Spec: Menu that allows the user to the enter information required to use APIs, like Quartzy and Sheets.

Spec: A small pop-up window that tells the user that their request was successfully entered into the spreadsheet, and displays the location of that order.
Manual ability to enter data
Displaying PO#


# Guide to Running and Updating
This extension is written in React JS and uses Vite to compile. This means that everything is written in jsx and uses Vite to turn this into pure JavaScript that the extension can use. The /dist folder is the jsx->js code. To update /dist run: npm run build.

# Sheets API
Create a new google cloud project. APIs & Services -> Library. Find and enable the Sheets API. APIs & Services -> OAuth Consent Screen. Pick external, add Google Sheets Scope. APIs & Services -> OAuth Client ID. Pick “Google Extension,” enter the extension ID (found in the extension’s settings). Add client_id to the manifest. 
