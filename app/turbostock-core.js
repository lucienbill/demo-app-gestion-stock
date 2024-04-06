const { APP_PROFILES } = require("./APP_PROFILES");

function connectToAppDb() {
  // FIXME: maybe abstract this instanciation of "returnedObject",
  // I always use the same format
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
  const returnedObject = { err: "", content: null };

  const insertStatement = db.prepare(
    "INSERT INTO inventory (description, quantity, is_activated, \
    is_featured_in_orders) VALUES (@description, @quantity, TRUE, FALSE)",
  );

  const insertMany = db.transaction((itemsToInsert) => {
    for (let index = 0; index < itemsToInsert.length; index++) {
      const item = itemsToInsert[index];
      insertStatement.run({
        description: item.description,
        quantity: item.quantity,
      });
    }
  });

  try {
    insertMany(items);
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

function createAnOrder(db, profile, contentToOrder = []) {
  /* 
    content = [{
      object_id: ... // id from inventory
      quantity : ... // integer, must be <= inventory quantity
    }, {...}]
  */
  const returnedObject = { err: "", content: null };
  if (profile != APP_PROFILES.ORDER_MAKER){
    returnedObject.err = `profile ${profile} is not allowed to create an order. Must be ${APP_PROFILES.ORDER_MAKER}`
    return returnedObject
  }

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
