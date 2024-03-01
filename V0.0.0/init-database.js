const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database(
  "./db/turbostock.db",
  sqlite3.OPEN_READWRITE,
  (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Connected to the SQlite database.");
  },
);

db.serialize(() => {
  // DROP
  console.log("Dropping all tables if they exist ...");
  const tablesToDrop = ["profiles", "inventory", "commands"];

  for (let index = 0; index < tablesToDrop.length; index++) {
    const table = tablesToDrop[index];

    db.run(`DROP TABLE IF EXISTS ${table}`);
    console.log(`|  dropped table ${table}`);
  }
  console.log("Dropping all tables if they exist: Done!");

  // CREATE
  console.log("Creating all tables ...");
  const sqlCreateRequests = [
    "CREATE TABLE profiles (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, email TEXT)",
  ];

  for (let index = 0; index < sqlCreateRequests.length; index++) {
    const sqlRequest = sqlCreateRequests[index];

    db.run(sqlRequest);
    console.log(`|  ${sqlRequest}`);
  }
  console.log("Creating all tables ...");

  // INSERT DATA
  const stmt = db.prepare(
    "INSERT INTO profiles (username, email) VALUES (?, ?)",
  );
  stmt.run("john_doe", "john@example.com");
  stmt.finalize();

  console.log("Data inserted successfully!");

  db.all("SELECT * FROM profiles", (err, rows) => {
    if (err) {
      console.error("Error querying data:", err);
      return;
    }

    console.log("Query results:", rows);
  });

  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Closed the database connection.");
  });
});
