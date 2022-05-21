const fs = require("fs");

function getJson(path) {
    try {
        let rawData = fs.readFileSync(path);
        let jsonData = JSON.parse(rawData);
        //console.log(jsonData);
        return jsonData;
    } catch(err) {
        console.log(err);
    }
}

module.exports = getJson;