function connectToAppDb() {
  const db = require("better-sqlite3")("./db/turbostock.db");
  db.pragma("journal_mode = WAL");
  console.log("Connected to the SQlite database.");
  return db;
}
exports.connectToAppDb = connectToAppDb;

function addItemsToInventory(db, items = []) {
  // items = [{description:"string", quantity:"integer"}, {...}]
  console.log("inserting data into table inventory - ");
  const sqlStatement = db.prepare(
    "INSERT INTO inventory (description, quantity, is_activated, is_featured_in_orders) VALUES (?, ?, TRUE, FALSE)"
  );
  try {
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      sqlStatement.run(item.description, item.quantity);
    }
  } catch (err) {
    if (!db.inTransaction) throw err; // (transaction was forcefully rolled back)
    console.error("Failed to insert data -> ROLLBACK");
  }
  console.log("inserted the data");
}
exports.addItemsToInventory = addItemsToInventory;

function readAllInventory(db) {
  return db.prepare("SELECT * FROM inventory").all();
}
exports.readAllInventory = readAllInventory;

function createAnOrder(db, profileId=null, content=[]) {
  if (profileId != 2) {
    return {
      "error":`profile ${profileId} is not allowed to create an order`,
      "content":[]
    }
  }
}
exports.createAnOrder = createAnOrder