const fs = require("fs");

function exportJson(name, dataToBeExported) {
    try {
        fs.writeFile(name, JSON.stringify(dataToBeExported), 'utf8', function(err) {
		    if(err) {
		        return console.log(err);
		    }
		    console.log("The data has been scraped and saved successfully! View it at './yarako'");
		});
    } catch(err) {
        console.log(err);
    }
}

module.exports = exportJson;