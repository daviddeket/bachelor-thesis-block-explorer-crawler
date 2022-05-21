function filterLegacyTransactions(data) {
    let newData = [];
    for (let i = 0; i < data.length; i++) {
        if (data[i]["txn_type"] == "2 (EIP-1559)") {
            newData.push(data[i]);
        }
    }
    return newData;
}

module.exports = filterLegacyTransactions;