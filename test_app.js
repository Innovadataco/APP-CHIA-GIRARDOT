const fs = require('fs');
const { JSDOM } = require("jsdom");
const dom = new JSDOM(`<!DOCTYPE html><html><body>
<div id="no-grid"></div><div id="dom-grid"></div><div id="as-grid"></div>
<div id="se-grid"></div><div id="sub-grid"></div><div id="fn-grid"></div>
<div id="cc-grid"></div>
<div id="eov-cards-home"></div>
<div id="eov-quicknav"></div><div id="eov-d-body"></div>
</body></html>`, { runScripts: "dangerously" });
const window = dom.window;
const document = window.document;

// Load data
window.ITS_OFFICIAL_DATA = JSON.parse(fs.readFileSync('official_data.json'));

// Provide global indexedDB shim
window.indexedDB = require("fake-indexeddb");
window.IDBKeyRange = require("fake-indexeddb/lib/FDBKeyRange");

// Emulate app.js runtime
eval(fs.readFileSync('db.js', 'utf8'));
eval(fs.readFileSync('app.js', 'utf8'));

// Wait for initial render
setTimeout(() => {
    console.log("Init finished. UI state:");
    console.log("EOV cards:", document.getElementById('eov-cards-home').innerHTML.length);
    console.log("FN grid:", document.getElementById('fn-grid').innerHTML.length);
    console.log("CC grid:", document.getElementById('cc-grid').innerHTML.length);
    
    // Test EOV show
    console.log("Testing showEOV('EOV-01')...");
    window.showEOV('EOV-01').then(() => {
        console.log("showEOV succeeded.");
        console.log("EOV detail length:", document.getElementById('eov-d-body').innerHTML.length);
    }).catch(e => {
        console.error("showEOV FAILED:");
        console.error(e);
    });
}, 1000);
