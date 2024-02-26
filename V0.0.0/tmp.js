const sqlite3 = require('sqlite3').verbose();

// let db = new sqlite3.Database(':memory:', (err) => {
const db = new sqlite3.Database('./db/turbostock.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQlite database.');
});

db.serialize(() => {
    db.run(
        "DROP TABLE IF EXISTS users",
      )
    
    console.log("dropped tabled users")

    db.run(
        "CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, email TEXT)"
      )
    
    console.log("Table created successfully!")

    const stmt = db.prepare("INSERT INTO users (username, email) VALUES (?, ?)")
    stmt.run("john_doe", "john@example.com")
    stmt.finalize()

    console.log("Data inserted successfully!")


    db.all("SELECT * FROM users", (err, rows) => {
        if (err) {
          console.error("Error querying data:", err)
          return
        }
    
        console.log("Query results:", rows)
    })

    db.close((err) => {
        if (err) {
          return console.error(err.message);
        }
        console.log('Closed the database connection.');
    });
})
