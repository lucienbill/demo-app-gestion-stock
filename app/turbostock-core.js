const { APP_PROFILES } = require("./APP_PROFILES");
const { ReturnedObject } = require("./ReturnedObject");

const ORDER_STATUS = {
  PREPARATION_ONGOING: "PREPARATION_ONGOING",
  PREPARED: "PREPARED",
  CANCELED: "CANCELED",
  SENT: "SENT",
};

function connectToAppDb() {
  const returnedObject = new ReturnedObject();
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

function verifyProfileIsAuthorized(profileToVerify, AuthorizedProfiles = []) {
  let err = "";
  const ok = AuthorizedProfiles.includes(profileToVerify);
  if (!ok) {
    err = `profile ${profileToVerify} is not allowed to create an order. Must belong to ${JSON.stringify(AuthorizedProfiles)}`;
  }

  return err;
}

function addItemsToInventory(db, items = []) {
  const returnedObject = new ReturnedObject();

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
  const returnedObject = new ReturnedObject();
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
  const returnedObject = new ReturnedObject();
  returnedObject.err = verifyProfileIsAuthorized(profile, [
    APP_PROFILES.ORDER_MAKER,
  ]);
  if (returnedObject.err != "") {
    return returnedObject;
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
      `SELECT id, quantity, description FROM inventory WHERE id IN (${
        "" + listOfIdToQueryForQuantity
      }) and is_activated is True ORDER BY id`,
    );

    const availableItems = sqlStatement.all();
    const errStack = [];
    for (let index = 0; index < listOfIdToQueryForQuantity.length; index++) {
      const elementToOrder = contentToOrder[index];
      const availableQuantity = availableItems[index].quantity;

      if (elementToOrder.object_id != availableItems[index].id) {
        throw new Error("Something is very wrong in the code itself");
      }

      if (availableQuantity < Number(elementToOrder.quantity)) {
        errStack.push(
          `Not enough available quantity for object ${elementToOrder.object_id}. Requested ${elementToOrder.quantity}, Available = ${availableQuantity}`,
        );
      }
    }
    if (errStack.length > 0) {
      throw new Error("" + errStack);
    }

    // sanity checks OK -> do the order
    const orderContent = [];
    const statementReadStock = db.prepare(
      "SELECT quantity FROM inventory WHERE id = @id",
    );
    const statementUpdateStock = db.prepare(
      "UPDATE inventory SET quantity = @newInventoryQuantity WHERE id = @id",
    );
    const statementRecordOrder = db.prepare(
      `INSERT INTO orders (status, content) VALUES ('${ORDER_STATUS.PREPARATION_ONGOING}', @content) RETURNING id`,
    );

    // SQL transaction: rollback is error
    const transaction = db.transaction((contentToOrder) => {
      // For each object to order
      for (let index = 0; index < contentToOrder.length; index++) {
        const elementToOrder = contentToOrder[index];

        // Update the inventory (stock)
        const currentStock = statementReadStock.get({
          id: elementToOrder.object_id,
        }).quantity;
        const newStock = currentStock - Number(elementToOrder.quantity);

        if (newStock < 0) {
          throw new Error(
            `Not enough available quantity for object ${elementToOrder.object_id}. Requested ${elementToOrder.quantity}, Available = ${availableQuantity}`,
          );
        }
        statementUpdateStock.run({
          newInventoryQuantity: newStock,
          id: elementToOrder.object_id,
        });

        // add the item to the order
        orderContent.push({
          item: availableItems[index].description,
          item_id: elementToOrder.id,
          quantity: elementToOrder.quantity,
        });
      }

      // record the order
      const id = statementRecordOrder.run({
        content: JSON.stringify(orderContent),
      }).lastInsertRowid;
      returnedObject.content = { id: id };
    });

    transaction(contentToOrder);
  } catch (error) {
    returnedObject.err = `Failed to intiate an order. Error: ${error}`;
  }
  return returnedObject;
}
exports.createAnOrder = createAnOrder;

// Update the content of an order: TODO for much later

function markOderAsPrepared(db, profile, id) {
  const returnedObject = new ReturnedObject();
  returnedObject.err = verifyProfileIsAuthorized(profile, [
    APP_PROFILES.ORDER_MAKER,
  ]);
  if (returnedObject.err != "") {
    return returnedObject;
  }

  // TODO: return error if status of the order is incompatible with the operation
  const statementReadOrder = db.prepare(
    `SELECT id FROM orders WHERE id=@id AND status = '${ORDER_STATUS.PREPARATION_ONGOING}'`,
  );
  const read = statementReadOrder.get({ id: id });
  try {
    if (read.id != id) {
      returnedObject.err = `The selected order cannot be changed to the status ${ORDER_STATUS.PREPARED}`;
      return returnedObject;
    }
  } catch (error) {
    returnedObject.err = `The selected order cannot be changed to the status ${ORDER_STATUS.PREPARED}`;
    return returnedObject;
  }

  const statementUpdateOrder = db.prepare(
    `UPDATE orders SET status = '${ORDER_STATUS.PREPARED}' WHERE id=@id`,
  );
  try {
    statementUpdateOrder.run({ id: id });
  } catch (error) {
    returnedObject.err = `Failed to update ORDER with id ${id}. SQL error = ${error}`;
  }

  return returnedObject;
}
exports.markOderAsPrepared = markOderAsPrepared;
