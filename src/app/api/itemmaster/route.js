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
    const { name, qty, description, comments,enabled } = data;

    db = await opendb();

    // Use a prepared statement for inserting data
    const result = await db.run(
      `INSERT INTO itemmaster (name, quantity, description, comments,enabled) VALUES (?, ?, ?, ?, ?)`,
      [name, qty, description, comments  ,enabled]
    );


   console.log(enabled,"rohith")

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

export async function DELETE(req) {
  const { id } = await req.json();
  console.log(id, "id");

  let db;
  try {
    db = await opendb();
    console.log("Attempting to delete ID:", id);

    // Check if item exists
    const checkItem = await db.get(`SELECT * FROM itemmaster WHERE id = ?`, [id]);
    if (!checkItem) {
      console.error(`Item with ID ${id} not found`);
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Delete the item
    await db.run(`DELETE FROM itemmaster WHERE id = ?`, [id]);
    console.log(`Successfully deleted item with ID: ${id}`);

    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Database error: " + error.message },
      { status: 500 }
    );
  } finally {
    if (db) {
      await db.close();
      console.log("Database connection closed.");
    }
  }
}


export async function PUT(req) {
  const { id, name, qty, description, comments } = await req.json();
  
  let db;
  try {
    db = await opendb();

    // Check if item exists
    const checkItem = await db.get(`SELECT * FROM itemmaster WHERE id = ?`, [id]);
    if (!checkItem) {
      console.error(`Item with ID ${id} not found`);
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Update the item
    await db.run(
      `UPDATE itemmaster SET name = ?, quantity = ?, description = ?, comments = ? WHERE id = ?`,
      [name, qty, description, comments, id]
    );

    console.log(`Successfully updated item with ID: ${id}`);
    return NextResponse.json({ message: "Item updated successfully" });
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Database error: " + error.message },
      { status: 500 }
    );
  } finally {
    if (db) {
      await db.close();
      console.log("Database connection closed.");
    }
  }
}







