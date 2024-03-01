const sqlite3 = require("sqlite3").verbose();

function connectToAppDb() {
  const db = new sqlite3.Database(
    "./db/turbostock.db",
    sqlite3.OPEN_READWRITE,
    (err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log("Connected to the SQlite database.");
    }
  );
  return db;
}
exports.connectToAppDb = connectToAppDb;

function addItemToInventory(db, description, quantity=0) {
    console.log("inserting data into table inventory - ")
    const stmt = db.prepare("INSERT INTO inventory (description, quantity, is_activated, is_featured_in_orders) VALUES (?, ?, TRUE, FALSE)");
    stmt.run(description, quantity);
    stmt.finalize();
    console.log("inserted: (description, quantity, is_activated, is_featured_in_orders) = (${description}, ${quantity}, TRUE, FALSE)")
}
exports.addItemToInventory = addItemToInventory

function readAllInventory(db) {
    db.all("SELECT * FROM profiles", (err, rows) => {
        if (err) {
          console.error("Error querying data:", err);
          return;
        }
    
        console.log("Query results:", rows);
    })
}
exports.readAllInventory = readAllInventory