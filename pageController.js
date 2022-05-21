const pageScraper = require("./pageScraper");
const fs = require("fs");
const getJson = require("./data_manipulation/jsonGetter.js");
const cleanData = require("./data_manipulation/cleanData.js");

function findNewAddress(existingTransactions, scrapedAddresses) {
  // get all addresses from existingTransactions
  let potentialNewAddresses = [];
  for (let k = 0; k < existingTransactions.length; k++) {
    if (!potentialNewAddresses.includes(existingTransactions[k]["from"])) {
      potentialNewAddresses.push(existingTransactions[k]["from"]);
      //console.log(existingTransactions[k]["from"]);
    }
    if (
      !potentialNewAddresses.includes(
        existingTransactions[k]["interacted_with"]
      )
    ) {
      potentialNewAddresses.push(existingTransactions[k]["interacted_with"]);
      //console.log(existingTransactions[k]["interacted_with"]);
    }
  }
  console.log(potentialNewAddresses);

  // find first address that is in potentialNewAddresses but not in scrapedAddresses
  for (let x = 0; x < potentialNewAddresses.length; x++) {
    if (!scrapedAddresses.includes(potentialNewAddresses[x])) {
      return potentialNewAddresses[x];
    }
  }
  return "";
}

function cleanAllData(data) {
  let scrapedDataWithoutFails = cleanData.removeFails(data);
  let scrapedDataRemovedSpacesFromValues = cleanData.removeSpacesFromValues(
    scrapedDataWithoutFails
  );
  let scrapedDataRemovedScapesNewKeys = cleanData.setKeys(
    scrapedDataRemovedSpacesFromValues
  );
  let scrapedDataCleanValues = cleanData.cleanValues(
    scrapedDataRemovedScapesNewKeys
  );

  return scrapedDataCleanValues;
}

function saveToExistingTransactions(existingTransactions, newTransactions) {
  // get tx hashes
  let existingTxHashes = [];
  for (let i = 0; i < existingTransactions.length; i++) {
    existingTxHashes.push(existingTransactions[i]["transaction_hash"]);
  }
  console.log(existingTxHashes);

  // add new unique transctions to existing once
  for (let j = 0; j < newTransactions.length; j++) {
    if (!existingTxHashes.includes(newTransactions[j]["transaction_hash"])) {
      console.log("new: " + newTransactions[j]["transaction_hash"]);
      existingTransactions.push(newTransactions[j]);
    }
  }

  // save transactions.json
  fs.writeFile(
    "./jsons/transactions.json",
    JSON.stringify(existingTransactions),
    "utf8",
    function (err) {
      if (err) {
        return console.log(err);
      }
      console.log(
        "The data has been scraped and saved successfully! View it at './transactions.json'"
      );
    }
  );
}

function saveToExistingAddresses(scrapedAddresses, currentAddress) {
  // add scraped add to scrapedAddresses.json
  if (!scrapedAddresses.includes(currentAddress)) {
    scrapedAddresses.push(currentAddress);

    // save scrapedAddresses.json
    fs.writeFile(
      "./jsons/scrapedAddresses.json",
      JSON.stringify(scrapedAddresses),
      "utf8",
      function (err) {
        if (err) {
          return console.log(err);
        }
        console.log(
          "The data has been scraped and saved successfully! View it at './scrapedAddresses.json'"
        );
      }
    );
  }
}

function saveToExistingHashes(scrapedTransactionHashes, newTransactions) {
  // add scraped add to scrapedTransactionHashes.json
  for (let i = 0; i < newTransactions.length; i++) {
    if (!scrapedTransactionHashes.includes(newTransactions[i]["transaction_hash"])) {
      scrapedTransactionHashes.push(newTransactions[i]["transaction_hash"]);
    }
  }

  // save scrapedTransactionHashes.json
  fs.writeFile(
    "./jsons/scrapedTransactionHashes.json",
    JSON.stringify(scrapedTransactionHashes),
    "utf8",
    function (err) {
      if (err) {
        return console.log(err);
      }
      console.log(
        "The data has been scraped and saved successfully! View it at './scrapedTransactionHashes.json'"
      );
    }
  );
}

async function scrapeAll(browserInstance) {
  let browser;
  while (true) {
    try {
      // get already existing transactions, scraped transaction hashes and scraped addresses
      let existingTransactions = getJson("./jsons/transactions.json");
      let scrapedAddresses = getJson("./jsons/scrapedAddresses.json");
      let scrapedTransactionHashes = getJson(
        "./jsons/scrapedTransactionHashes.json"
      );

      let currentAddress = "";
      // get new address
      if (!scrapedAddresses.includes("0xe3b3449f4891246f55d5079c9f26821975781a68")) {
        currentAddress = "0xe3b3449f4891246f55d5079c9f26821975781a68";
      } else {
        currentAddress = findNewAddress(existingTransactions, scrapedAddresses);
      }

      if (currentAddress != "") {
        // scrape data
        browser = await browserInstance;
        let scrapedData = await pageScraper.scraper(
          browser,
          "https://blockchian.explorer/txs?a=" + currentAddress,
          scrapedTransactionHashes
        );

        // clean data
        let newTransactions = cleanAllData(scrapedData);

        // add new transactions to existing ones
        saveToExistingTransactions(existingTransactions, newTransactions);

        // add new address to existing ones
        saveToExistingAddresses(scrapedAddresses, currentAddress);

        // add new transactions hashes to existing ones
        saveToExistingHashes(scrapedTransactionHashes, newTransactions);

        // delay for saving files
        await new Promise((resolve, reject) =>
          setTimeout(() => resolve(true), 2000)
        );
      } else {
        console.log("No more unique addresses to scrape.");
        break;
      }
    } catch (err) {
      console.log("Could not resolve the browser instance => ", err);
    }
  }
}

module.exports = (browserInstance) => scrapeAll(browserInstance);
