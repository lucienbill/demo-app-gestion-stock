// In this file: some unit tests.
// Side effect: populates the database with sample data

const { connectToAppDb, addItemsToInventory, readAllInventory } = require("../app/turbostock-core");


const db = connectToAppDb()

addItemsToInventory(db, 
    [{"description":"pair of pink sandals, size 42", "quantity":12}]
    )
console.log(readAllInventory(db))
