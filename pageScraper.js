let a = "";
const scraperObject = {
  dummy: "",
  async scraper(browser, url, scrapedTransactionHashes) {
    let page = await browser.newPage();
    console.log(`Navigating to ${url}...`);
    // Navigate to the selected page
    await page.goto(url);
    let scrapedData = [];
    a = scrapedTransactionHashes;
    // Wait for the required DOM to be rendered
    async function scrapeCurrentPage() {
      // Wait for the required DOM to be rendered
      await page.waitForXPath('//*[@id="paywall_mask"]/table/tbody');
      // Get the link to all reinvest entries
      let urls = await page.$$eval("tbody tr ", (links) => {
        // Make sure the entry contains "Reinvest"
        links = links.filter(
          (link) => link.querySelectorAll("td")[2].textContent == "Reinvest"
        );
        // Extract the links with transaction hash form data
        links = links.map((el) => el.querySelector("span > a").href);
        return links;
      });

      let allTransactionHashes = await page.$$eval("tbody tr ", (links) => {
        // Make sure transation hash is not in _scrapedTransactionHashes
        links = links.filter(
          (link) => link.querySelectorAll("td")[1].textContent
        );
        // Extract the links with transaction hash form data
        links = links.map((el) => el.querySelector("span > a").href);
        return links;
      });
      console.log(allTransactionHashes);

      // make links out of a
      let b = [];
      for (let i = 0; i < a.length; i++) {
        b.push("https://blockchain.explorer/tx/" + a[i]);
      }
      console.log(b);

      let newTransactionHashes = [];
      for (let i = 0; i < allTransactionHashes.length; i++) {
        if (!b.includes(allTransactionHashes[i])) {
          newTransactionHashes.push(allTransactionHashes[i]);
        }
      }
      console.log(newTransactionHashes);

      let newUrls = [];
      for (let i = 0; i < urls.length; i++) {
        if (newTransactionHashes.includes(urls[i])) {
          newUrls.push(urls[i]);
        }
      }
      console.log(urls);
      console.log(newUrls);

      urls = newUrls;
      console.log(urls);

      // Loop through each of those links, open a new page instance and get the relevant data from them
      let pagePromise = (link) =>
        new Promise(async (resolve, reject) => {
          let dataObj = {};
          let newPage = await browser.newPage();
          await newPage.goto(link);
          
          try {
            //check if transaction successful
            dataObj["status"] = await newPage.$eval(
              "#ContentPlaceHolder1_maintable > div:nth-of-type(2) > div:nth-of-type(2)",
              (text) => text.textContent
            );

            if (dataObj["status"] == "Success") {
              try {
                //click on button
                await newPage.$eval(
                  "#ContentPlaceHolder1_collapsedLink_span > a",
                  (button) => button.click()
                );
              } catch (err) {
                console.log("No button to click");
              }
  
              // get first fields
              try {
                let currentRowNumber = 1;
                let currentName = await newPage.$eval(
                  "#ContentPlaceHolder1_maintable > div:nth-of-type(" +
                    currentRowNumber.toString() +
                    ") > div:nth-of-type(1)",
                  (text) => text.textContent
                );
                while (currentName != undefined) {
                  // skip timestamp and tokens transferred
                  if (currentRowNumber == 4 || currentRowNumber == 7) {
                    currentRowNumber += 1;
                    currentName = await newPage.$eval(
                      "#ContentPlaceHolder1_maintable > div:nth-of-type(" +
                        currentRowNumber.toString() +
                        ") > div:nth-of-type(1)",
                      (text) => text.textContent
                    );
                  }
  
                  dataObj[currentName.toString()] = await newPage.$eval(
                    "#ContentPlaceHolder1_maintable > div:nth-of-type(" +
                      currentRowNumber.toString() +
                      ") > div:nth-of-type(2)",
                    (text) => text.textContent
                  );
  
                  // grab name of next row
                  currentRowNumber += 1;
                  // break before transaction fee
                  if (currentRowNumber == 9) {
                    break;
                  }
                  currentName = await newPage.$eval(
                    "#ContentPlaceHolder1_maintable > div:nth-of-type(" +
                      currentRowNumber.toString() +
                      ") > div:nth-of-type(1)",
                    (text) => text.textContent
                  );
                }
              } catch (err) {
                console.log(err);
              }
  
              // get tokens transferred
              try {
                let currentRowNumber = 1;
                let currentName = await newPage.$eval(
                  "#wrapperContent > li:nth-of-type(" +
                    currentRowNumber.toString() +
                    ") > div:nth-of-type(1)",
                  (text) => text.textContent
                );
                while (currentName != undefined) {
                  // loop from, to, for
                  for (let j = 1; j < 4; j++) {
                    dataObj[currentRowNumber.toString() + "_from"] =
                      await newPage.$eval(
                        "#wrapperContent > li:nth-of-type(" +
                          currentRowNumber.toString() +
                          ") > div:nth-of-type(1) > span:nth-of-type(" +
                          2 +
                          ")",
                        (text) => text.textContent
                      );
  
                    dataObj[currentRowNumber.toString() + "_to"] =
                      await newPage.$eval(
                        "#wrapperContent > li:nth-of-type(" +
                          currentRowNumber.toString() +
                          ") > div:nth-of-type(1) > span:nth-of-type(" +
                          4 +
                          ")",
                        (text) => text.textContent
                      );
  
                    dataObj[currentRowNumber.toString() + "_for"] =
                      await newPage.$eval(
                        "#wrapperContent > li:nth-of-type(" +
                          currentRowNumber.toString() +
                          ") > div:nth-of-type(1) > span:nth-of-type(" +
                          6 +
                          ")",
                        (text) => text.textContent
                      );
                  }
  
                  // grab name of next row
                  currentRowNumber += 1;
                  currentName = await newPage.$eval(
                    "#wrapperContent > li:nth-of-type(" +
                      currentRowNumber.toString() +
                      ") > div:nth-of-type(1)",
                    (text) => text.textContent
                  );
                }
              } catch (err) {
                console.log(err);
              }
  
              // get transaction fee
              dataObj["transaction_fee"] = await newPage.$eval(
                "#ContentPlaceHolder1_spanTxFee",
                (text) => text.textContent
              );
  
              // get transaction details
              try {
                let currentRowNumber = 1;
                let currentName = await newPage.$eval(
                  "#ContentPlaceHolder1_collapseContent > div:nth-of-type(" +
                    currentRowNumber.toString() +
                    ") > div:nth-of-type(1)",
                  (text) => text.textContent
                );
                while (currentName != undefined) {
                  dataObj[currentName.toString()] = await newPage.$eval(
                    "#ContentPlaceHolder1_collapseContent > div:nth-of-type(" +
                      currentRowNumber.toString() +
                      ") > div:nth-of-type(2)",
                    (text) => text.textContent
                  );
  
                  // grab name of next row
                  currentRowNumber += 1;
                  currentName = await newPage.$eval(
                    "#ContentPlaceHolder1_collapseContent > div:nth-of-type(" +
                      currentRowNumber.toString() +
                      ") > div:nth-of-type(1)",
                    (text) => text.textContent
                  );
                }
              } catch (err) {
                console.log(err);
              }
            }
          } catch (err) {
            console.log(err);
            dataObj = {
              status: "Fail"
            }
          }
          resolve(dataObj);
          await newPage.close();
        });

      for (link in urls) {
        let currentPageData = await pagePromise(urls[link]);
        if (currentPageData != undefined) {
          scrapedData.push(currentPageData);
          // scrapedData.push(currentPageData);
          console.log(currentPageData);
        }
      }

      // When all the data on this page is done, click the next button and start the scraping of the next page
      // You are going to check if this button exist first, so you know if there really is a next page.
      let nextButtonExist = false;
      try {
        await page.waitForXPath(
          '//*[@id="ContentPlaceHolder1_topPageDiv"]/nav/ul/li[4]/a'
        );
        const nextButton = await page.$eval(
          "#ContentPlaceHolder1_topPageDiv > nav > ul > li:nth-of-type(4) > a",
          (a) => a.textContent
        );
        nextButtonExist = true;
      } catch (err) {
        nextButtonExist = false;
      }
      if (nextButtonExist) {
        await page.click(
          "#ContentPlaceHolder1_topPageDiv > nav > ul > li:nth-of-type(4) > a"
        );
        await page.waitForXPath('//*[@id="paywall_mask"]');

        // get first blocknumber
        const blockNumber = await page.$eval(
          "#paywall_mask > table > tbody > tr:nth-of-type(1) > td:nth-of-type(4) > a",
          (a) => a.textContent
        );
        console.log(blockNumber);
        if (blockNumber > 11752740) {
          return scrapeCurrentPage(); // Call this function recursively
        }
      }
      await page.close();
      return scrapedData;
    }
    let data = await scrapeCurrentPage();
    console.log(data);
    return data;
  },
};

module.exports = scraperObject;
