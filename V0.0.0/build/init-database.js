const { connectToAppDb } = require("../app/turbostock-core");


const db = connectToAppDb()

const runInitScript = db.transaction(()=>{
  // DROP
  console.log("Dropping all tables if they exist ...");
  const tablesToDrop = ["profiles", "inventory", "orders"];

  for (let index = 0; index < tablesToDrop.length; index++) {
    const table = tablesToDrop[index];

    db.prepare(`DROP TABLE IF EXISTS ${table}`).run();
    console.log(`|  dropped table ${table}`);
  }
  console.log("Dropping all tables if they exist: Done!");

  // CREATE
  console.log("Creating all tables ...");
  const sqlCreateRequests = [
    "CREATE TABLE profiles (\
      id INTEGER PRIMARY KEY AUTOINCREMENT, \
      name TEXT NOT NULL)",
    "CREATE TABLE inventory (\
      id INTEGER PRIMARY KEY AUTOINCREMENT, \
      description TEXT NOT NULL, \
      quantity INTEGER NOT NULL, \
      is_activated BOOL NOT NULL, \
      is_featured_in_orders BOOL NOT NULL)", // This is meant not to work properly
    "CREATE TABLE orders (\
      id INTEGER PRIMARY KEY AUTOINCREMENT, \
      status TEXT NOT NULL, \
      content TEXT)",
  ];

  for (let index = 0; index < sqlCreateRequests.length; index++) {
    const sqlRequest = sqlCreateRequests[index].replace(/\s+/g, " ");
    db.prepare(sqlRequest).run();
    console.log(`|  ${sqlRequest}`);
  }
  console.log("Creating all tables: Done!");
});

runInitScript()

db.close();
console.log("Closed the database connection.");