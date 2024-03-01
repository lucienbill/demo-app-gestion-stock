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
  const tablesToDrop = [
    "profiles",
    "inventory",
    "commands",
    "profile_rights_per_table",
  ];

  for (let index = 0; index < tablesToDrop.length; index++) {
    const table = tablesToDrop[index];

    db.run(`DROP TABLE IF EXISTS ${table}`);
    console.log(`|  dropped table ${table}`);
  }
  console.log("Dropping all tables if they exist: Done!");

  // CREATE
  console.log("Creating all tables ...");
  const sqlCreateRequests = [
    "CREATE TABLE profiles (\
      id INTEGER PRIMARY KEY AUTOINCREMENT, \
      name TEXT)",
    "CREATE TABLE profile_rights_per_table (\
      id INTEGER PRIMARY KEY AUTOINCREMENT, \
      profile_id INTEGER, \
      FOREIGN KEY (profile_id) REFERENCES profiles(id))",
  ];

  for (let index = 0; index < sqlCreateRequests.length; index++) {
    const sqlRequest = sqlCreateRequests[index].replace(/\s+/g," ");
    db.run(sqlRequest);
    console.log(`|  ${sqlRequest}`);
  }
  console.log("Creating all tables ...");

  // INSERT DATA
  const stmt = db.prepare(
    "INSERT INTO profiles (name) VALUES (?)",
  );
  stmt.run("placeholder");
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
