function removeFails(data) {
  try {
    // loop and check success
    let dataWithoutFails = [];
    for (let i = 0; i < data.length; i++) {
      if (!data[i]["status"].includes("Fail")) {
        dataWithoutFails.push(data[i]);
      }
    }
    return dataWithoutFails;
  } catch (err) {
    console.log(err);
  }
}

function removeSpacesFromValues(data) {
  try {
    // loop through transactions
    for (let i = 0; i < data.length; i++) {
      // loop through elements in transaction object
      for (let j = 0; j < Object.keys(data[i]).length; j++) {
        let key = Object.keys(data[i])[j];
        if (data[i][key] != undefined) {
          // remove useless chars
          data[i][key] = data[i][key].replaceAll(" ", "").replaceAll("\n", "");
        }
      }
    }
    return data;
  } catch (err) {
    console.log(err);
  }
}

function setKeys(data) {
  try {
    let dataWithNewKeys = [];
    // loop through transactions
    for (let i = 0; i < data.length; i++) {
      // loop through elements in transaction object
      let tempObj = {};
      for (let j = 0; j < Object.keys(data[i]).length; j++) {
        let key = Object.keys(data[i])[j];
        if (data[i][key] != undefined) {
          // set new key
          if (!key.includes("Nonce")) {
            tempObj[
                key
                  .replace(":", "")
                  .toLowerCase()
                  .replaceAll(" ", "_")
                  .replaceAll("\n", "")
                  .replace("_(to)", "")
              ] = data[i][key];
          } else {
            tempObj["nonce"] = data[i][key];
          }
          
        }
      }
      dataWithNewKeys.push(tempObj);
    }
    return dataWithNewKeys;
  } catch (err) {
    console.log(err);
  }
}

function cleanValues(data) {
    try {
      let dataWithClearValues = [];
      // loop through transactions
      for (let i = 0; i < data.length; i++) {
        // loop through elements in transaction object
        let tempObj = {};
        for (let j = 0; j < Object.keys(data[i]).length; j++) {
          let key = Object.keys(data[i])[j];
          if (data[i][key] != undefined) {
            // set new key
            tempObj[key] = data[i][key].replace("BlockConfirmations", "").replace("Contract", "").replace(",", "").replace("AVAX", "");
          }

          if (data[i][key].includes("(") && key != "input_data") {
            tempObj[key] = tempObj[key].split("(")[0];
          }

          if (key == "interacted_with" || key == "from") {
            tempObj[key] = tempObj[key].substring(0, 42);
          }
        }
        dataWithClearValues.push(tempObj);
      }
      return dataWithClearValues;
    } catch (err) {
      console.log(err);
    }
  }

module.exports.removeFails = removeFails;
module.exports.removeSpacesFromValues = removeSpacesFromValues;
module.exports.setKeys = setKeys;
module.exports.cleanValues = cleanValues;
