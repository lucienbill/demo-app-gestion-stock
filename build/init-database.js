const { connectToAppDb } = require("../app/turbostock-core");

let quitModeActivated = false
arguments = process.argv
for (let index = 0; index < arguments.length; index++) {
  const arg = arguments[index];
  if (arg == "--quiet"){
    quitModeActivated = true
  }
}

function log(text) {
  if (!quitModeActivated){
    console.log("   " + text)
  }
}

const db = connectToAppDb()

const runInitScript = db.transaction(()=>{
  // DROP
  log("Dropping all tables if they exist ...");
  const tablesToDrop = ["profiles", "inventory", "orders"];

  for (let index = 0; index < tablesToDrop.length; index++) {
    const table = tablesToDrop[index];

    db.prepare(`DROP TABLE IF EXISTS ${table}`).run();
    log(`|  dropped table ${table}`);
  }
  log("Dropping all tables if they exist: Done!");

  // CREATE
  log("Creating all tables ...");
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
    log(`|  ${sqlRequest}`);
  }
  log("Creating all tables: Done!");
});

console.log("Initializing database...")
runInitScript()
db.close();
console.log("Initializing database: Done")