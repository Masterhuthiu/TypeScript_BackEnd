// src/server.ts
import express, { Request, Response } from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const app = express();
const port = 3000;

app.use(express.json());

// Initialize and open SQLite database
async function openDB() {
    return open({
        filename: './src/problem5.db',
        driver: sqlite3.Database
    });
}

// Create table if it doesn't exist
(async () => {
    const db = await openDB();
    await db.exec(`
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT
        )
    `);
})();

// GET endpoint
app.get('/items', async (req: Request, res: Response) => {
    const db = await openDB();
    const items = await db.all('SELECT * FROM items');
    res.json(items);
});

// POST endpoint
app.post('/items', async (req: Request, res: Response) => {
    const db = await openDB();
    const { name } = req.body;
    await db.run('INSERT INTO items (name) VALUES (?)', [name]);
    res.status(201).json({ name });
});

// PUT endpoint
app.put('/items/:id', async (req: Request, res: Response) => {
    const db = await openDB();
    const { id } = req.params;
    const { name } = req.body;
    await db.run('UPDATE items SET name = ? WHERE id = ?', [name, id]);
    res.json({ id, name });
});

// DELETE endpoint
app.delete('/items/:id', async (req: Request, res: Response) => {
    const db = await openDB();
    const { id } = req.params;
    await db.run('DELETE FROM items WHERE id = ?', [id]);
    res.status(204).send();
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
