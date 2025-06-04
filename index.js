import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import initializeDatabase from "./src/config/db.js";

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use((_req, _res, next) => setTimeout(next, 100)); // Simulate latency for freeCodeCamp

let db;


// Initialize database and start server
initializeDatabase().then((database) => {
    db = database;
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Frontend
app.get("/", async (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
});


// Create a new user
app.post("/api/users", async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ error: "Username is required" });
        }

        const result = await db.run("INSERT INTO users (username) VALUES (?)", [
            username,
        ]);
        const user = await db.get("SELECT _id, username FROM users WHERE _id = ?", [
            result.lastID,
        ]);
        res.json({
            _id: user._id.toString(), // freeCodeCamp requires _id to be a string
            username: user.username,
        });
    } catch (error) {
        if (error.message.includes("UNIQUE constraint failed")) {
            res.status(400).json({ error: "Username already exists" });
        } else {
            res.status(500).json({ error: "Server error" });
        }
    }
});


// Get all users
app.get("/api/users", async (req, res) => {
    try {
        const users = await db.all("SELECT _id, username FROM users");
        res.json(
            users.map((user) => ({
                _id: user._id.toString(),
                username: user.username,
            }))
        );
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});


// Add exercise
app.post("/api/users/:_id/exercises", async (req, res) => {
    try {
        const { _id } = req.params;
        const { description, duration, date } = req.body;

        if (!description || !duration) {
            return res
                .status(400)
                .json({ error: "Description and duration are required" });
        }

        const user = await db.get("SELECT _id, username FROM users WHERE _id = ?", [
            _id,
        ]);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const exerciseDate = date ? new Date(date) : new Date();
        const storedDate = exerciseDate.toISOString().split('T')[0];
        const formattedDate = exerciseDate.toDateString();

        await db.run(
            "INSERT INTO exercises (user_id, description, duration, date) VALUES (?, ?, ?, ?)",
            [_id, description, duration, storedDate]
        );

        res.json({
            _id: user._id.toString(),
            username: user.username,
            description,
            duration: parseInt(duration),
            date: formattedDate,
        });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});


// Get exercise log
app.get("/api/users/:_id/logs", async (req, res) => {
    try {
        const { _id } = req.params;
        const { from, to, limit } = req.query;

        const user = await db.get("SELECT _id, username FROM users WHERE _id = ?", [
            _id,
        ]);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        let query =
            "SELECT description, duration, date FROM exercises WHERE user_id = ?";
        const params = [_id];

        if (from || to) {
            query += " AND date BETWEEN ? AND ?";
            params.push(from || "1970-01-01", to || "9999-12-31");
        }

        query += " ORDER BY date DESC";

        if (limit) {
            query += " LIMIT ?";
            params.push(parseInt(limit));
        }

        const exercises = await db.all(query, params);
        const count = exercises.length;

        res.json({
            _id: user._id.toString(),
            username: user.username,
            count,
            log: exercises.map(exercise => ({
                ...exercise,
                duration: parseInt(exercise.duration),
                date: new Date(exercise.date).toDateString()
            }))
        });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
