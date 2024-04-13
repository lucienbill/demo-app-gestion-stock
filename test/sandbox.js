const {
  connectToAppDb,
  addItemsToInventory,
  readAllInventory,
  createAnOrder,
} = require("../app/turbostock-core");
// const db = connectToAppDb().content;

// const listOfIdToQueryForQuantity = [1, 2, 3]
// const sqlStatement = db.prepare(
//     `SELECT id, quantity FROM inventory WHERE id IN (${"" + listOfIdToQueryForQuantity}) and is_activated is True ORDER BY id`
// );

// console.log(sqlStatement.all())

const items = [
  { object_id: 1, quantity: 10 },
  { object_id: 3, quantity: 30 },
  { object_id: 2, quantity: 20 },
];

// Attempt to order the array by ID
items.sort((a, b) => Number(a.object_id) - Number(b.object_id));
console.log(items);
