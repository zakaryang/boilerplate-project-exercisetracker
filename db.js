import {Database} from 'sqlite-async';

async function initializeDatabase() {
    const db = await Database.open('./exercise-tracker.db');
    
    // Create users table
    await db.run(`
        CREATE TABLE IF NOT EXISTS users (
            _id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL
        )
    `);

    // Create exercises table
    await db.run(`
        CREATE TABLE IF NOT EXISTS exercises (
            _id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            description TEXT NOT NULL,
            duration INTEGER NOT NULL,
            date TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(_id)
        )
    `);

    return db;
}

export default initializeDatabase; 