import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { NextResponse } from "next/server";

async function opendb() {
  try {
    const db = await open({
      filename: "./itemmaster.db",
      driver: sqlite3.Database,
    });
    return db;
  } catch (e) {
    console.error("Error opening database:", e);
    throw e;
  }
}

async function initDb() {
  try {
    const db = await opendb();

    await db.run(`
      CREATE TABLE IF NOT EXISTS itemmaster (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        itemid INTEGER,
        name TEXT,
        quantity INTEGER,
        description TEXT,
        comments TEXT
      )
    `);
    console.log("Database initialized");



    await db.close(); // Close the database after initializing
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

export async function POST(req) {
    let db;
    try {
      await initDb(); // Ensure the database schema is initialized
  
      const data = await req.json();
      const { name, qty, description, comments,  } = data;
  
      db = await opendb();
  
      // Use a prepared statement for inserting data
      const result = await db.run(
        `INSERT INTO itemmaster (name, quantity, description, comments, toggle) VALUES (?, ?, ?, ? , ?)`,
        [name, qty, description, comments]
      );
  
      return NextResponse.json({ 
        message: "Data inserted successfully", 
        id: result.lastID // Return the ID of the inserted row
      });
    } catch (error) {
      console.error("Error during database operation:", error);
      return NextResponse.json(
        { error: "Database error: " + error.message },
        { status: 500 }
      );
    } finally {
      if (db) {
        await db.close(); // Ensure the database connection is closed
        console.log("Closed the database connection.");
      }
    }
  }

  export async function GET() {
    let db;
    try {
      await initDb(); // Ensure the database schema is initialized
      
      db = await opendb();
      const selectSql = `SELECT * FROM itemmaster ORDER BY id`;
      const data = await db.all(selectSql);
  
      if (data.length === 0) {
        return NextResponse.json({ message: "No items found." }, { status: 404 });
      }
  
      return NextResponse.json({ data });
    } catch (err) {
      console.error("Database error:", err); // Improved logging
      return NextResponse.json(
        { error: "Database error: " + err.message },
        { status: 500 }
      );
    } finally {
      if (db) {
        await db.close(); // Ensure the database connection is closed
        console.log("Closed the database connection.");
      }
    }
  }