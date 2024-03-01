// In this file: some unit tests.
// Side effect: populates the database with sample data

const { connectToAppDb, addItemToInventory, readAllInventory } = require("../app/turbostock-core");


const db = connectToAppDb()

addItemToInventory(db, "pair of pink sandals, size 42", 12) // FIXME: does not work
readAllInventory(db)
