function connectToAppDb() {
  const returnedObject = { err: "", content: null };
  try {
    const db = require("better-sqlite3")("./db/turbostock.db");
    db.pragma("journal_mode = WAL");
    console.log("Connected to the SQlite database.");
    returnedObject.content = db;
  } catch (error) {
    returnedObject.err = `Failed to connect to the database. Error: ${error}`;
  }
  return returnedObject;
}
exports.connectToAppDb = connectToAppDb;

function addItemsToInventory(db, items = []) {
  // FIXME: use transaction. See https://github.com/WiseLibs/better-sqlite3/blob/v5.0.1/docs/api.md#transactionfunction---function
  const returnedObject = { err: "", content: null };
  // items = [{description:"string", quantity:"integer"}, {...}]
  const sqlStatement = db.prepare(
    "INSERT INTO inventory (description, quantity, is_activated, \
      is_featured_in_orders) VALUES (?, ?, TRUE, FALSE)",
  );
  try {
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      sqlStatement.run(item.description, item.quantity);
    }
  } catch (err) {
    returnedObject.err = `Failed to add item(s) to inventory. Error: ${err}`;
  }
  return returnedObject;
}
exports.addItemsToInventory = addItemsToInventory;

function readAllInventory(db) {
  const returnedObject = { err: "", content: null };
  try {
    returnedObject.content = db.prepare("SELECT * FROM inventory").all();
  } catch (error) {
    returnedObject.err = $`Failed to read the inventory. Error: ${error}`;
  }
  return returnedObject;
}
exports.readAllInventory = readAllInventory;

function createAnOrder(db, contentToOrder = []) {
  /* 
    content = [{
      object_id: ... // id from inventory
      quantity : ... // integer, must be <= inventory quantity
    }, {...}]
  */
  const returnedObject = { err: "", content: null };

  try {
    // some sanity checks
    const listOfIdToQueryForQuantity = [];
    for (let index = 0; index < contentToOrder.length; index++) {
      const line = contentToOrder[index];
      listOfIdToQueryForQuantity.push(Number(line.object_id));
    }

    if (
      new Set(listOfIdToQueryForQuantity).size !==
      listOfIdToQueryForQuantity.length
    ) {
      throw new Error(
        "The command contains multiple lines with the same object ID. " +
          "Expected 1 line per ID",
      );
    }

    listOfIdToQueryForQuantity.sort();
    contentToOrder.sort((a, b) => Number(a.object_id) - Number(b.object_id));

    // FIXME: better to use prepared statement.
    // But "dynamic size" might be bad - see https://stackoverflow.com/a/189399/4837985
    const sqlStatement = db.prepare(
      `SELECT id, quantity FROM inventory WHERE id IN (${
        "" + listOfIdToQueryForQuantity
      }) and is_activated is True ORDER BY id`,
    );

    const availableItems = sqlStatement.all();
    const errStack = [];
    for (let index = 0; index < listOfIdToQueryForQuantity.length; index++) {
      const elementToOrder = contentToOrder[index];
      const availableQuantity = availableItems[index];

      if (elementToOrder.object_id != availableItems[index].id) {
        throw new Error("Somehow, this piece of code doesn't work at all!");
      }

      if (elementToOrder.object_id < elementToOrder.quantity) {
        errStack.push(
          `Not enough available quantity for object ${elementToOrder.object_id}. Requested ${elementToOrder.object_id}, Available = ${elementToOrder.quantity}`,
        );
      }
    }
    if (errStack.length > 0) {
      throw new Error("" + errStack);
    }

    // sanity checks OK -> do the order
    // TODO: transaction.
    //  For each object, substract requested qtty from intentory
    //  Then: insert order
  } catch (error) {
    returnedObject.err = `Failed to intiate an order. Error: ${error}`;
  }
  return returnedObject;
}
exports.createAnOrder = createAnOrder;
