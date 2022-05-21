function stringsToNumbers(data) {
    for (let i = 0; i < data.length; i++) {
        data[i]["reinvested_amount"] = data[i]["reinvested_amount"].split(" ")[0]
        data[i]["farm_fee"] = data[i]["farm_fee"].split(" ")[0]
        data[i]["reinvest_reward"] = data[i]["reinvest_reward"].split(" ")[0]
        data[i]["transaction_fee"] = data[i]["transaction_fee"].split(" ")[0]
        data[i]["gas_used_by_transaction"] = data[i]["gas_used_by_transaction"].split(" ")[0].replace(',','').replace(',','')
        data[i]["gas_limit"] = data[i]["gas_limit"].split(" ")[0].replace(',','').replace(',','')
        data[i]["gas_price"] = data[i]["gas_price"].split(" ")[0]
        data[i]["base_fee_per_gas"] = data[i]["base_fee_per_gas"].split(" ")[0]
        data[i]["max_fee_per_gas"] = data[i]["max_fee_per_gas"].split(" ")[0]
        data[i]["max_priority_fee_per_gas"] = data[i]["max_priority_fee_per_gas"].split(" ")[0]
        data[i]["burned_fees"] = data[i]["burned_fees"].split(" ")[0]
        data[i]["txn_savings"] = data[i]["txn_savings"].split(" ")[0]
    }
    return data;
}

module.exports = stringsToNumbers;