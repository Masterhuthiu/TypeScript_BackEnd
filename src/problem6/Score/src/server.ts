// src/server.ts
import express, { Request, Response } from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';

const app = express();
const port = 3001;

app.use(express.json());

// Initialize and open SQLite database
async function openDB() {
    return open({
        filename: './src/database.db',
        driver: sqlite3.Database
    });
}

// Create tables if they don't exist
(async () => {
    const db = await openDB();
    await db.exec(`
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            price REAL
        );
        CREATE TABLE IF NOT EXISTS purchase_orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            itemId INTEGER,
            userId INTEGER,
            quantity INTEGER,
            total REAL,
            FOREIGN KEY (itemId) REFERENCES items(id),
            FOREIGN KEY (userId) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            password TEXT,
            score REAL DEFAULT 0,
            role TEXT
        );
    `); 
})();
// GET endpoint for users
app.get('/users', async (req: Request, res: Response) => {
    const db = await openDB();
    const items = await db.all('SELECT * FROM users');
    res.json(items);
});

// DELETE endpoint for purchase orders
/* OLD
app.delete('/purchase-orders/:id', async (req: Request, res: Response) => {
    const db = await openDB();
    const { id } = req.params;
    await db.run('DELETE FROM purchase_orders WHERE id = ?', [id]);
    res.status(204).send();
});
*/
app.delete('/purchase-orders/:id', async (req: Request, res: Response) => {
    const db = await openDB();
    const { id, userId } = req.params;
    await db.run('DELETE FROM purchase_orders WHERE id = ?', [id]);
    await db.run('UPDATE users SET score = score - 1 WHERE id = ?', [userId]);
    res.status(204).send();
});

// POST endpoint for purchase orders
app.post('/purchase-orders', async (req: Request, res: Response) => {
    const db = await openDB();
    const { itemId, quantity, userId } = req.body;
    const item = await db.get('SELECT * FROM items WHERE id = ?', [itemId]);
    if (item) {
        const total = item.price * quantity;
        await db.run('INSERT INTO purchase_orders (itemId, quantity, total, userId) VALUES (?, ?, ?, ?)', [itemId, quantity, total, userId]);
        await db.run('UPDATE users SET score = score + 1 WHERE id = ?', [userId]);
        res.status(201).json({ itemId, quantity, total });
    } else {
        res.status(404).send('Item not found');
    }
});
// Live Update new user
app.put('/users/score/:id', async (req: Request, res: Response) => {
    const db = await openDB();
    const { id } = req.params;
    const { score , role } = req.body;
    if (role =="adm") {
        await db.run('UPDATE users SET score = ? WHERE id = ?', [ score, id]);
    }
    
    res.json({ id, score });
});

// GET endpoint for purchase orders
app.get('/purchase-orders', async (req: Request, res: Response) => {
    const db = await openDB();
    const orders = await db.all('SELECT * FROM purchase_orders');
    res.json(orders);
});



// Register new user
app.post('/users/register', async (req: Request, res: Response) => {
    const db = await openDB();
    const { name, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run('INSERT INTO users (name, password, role) VALUES (?, ?, ?)', [name, hashedPassword, role]);
    res.status(201).json({ name });
});

// User login
app.post('/users/login', async (req: Request, res: Response) => {
    const db = await openDB();
    const { name, password } = req.body;
    const user = await db.get('SELECT * FROM users WHERE name = ?', [name]);
    if (user && await bcrypt.compare(password, user.password)) {
        res.json({ id: user.id, name: user.name });
    } else {
        res.status(401).send('Invalid credentials');
    }
});

// GET endpoint for items
app.get('/items', async (req: Request, res: Response) => {
    const db = await openDB();
    const items = await db.all('SELECT * FROM items');
    res.json(items);
});

// POST endpoint for items
app.post('/items', async (req: Request, res: Response) => {
    const db = await openDB();
    const { name, price } = req.body;
    await db.run('INSERT INTO items (name, price) VALUES (?, ?)', [name, price]);
    res.status(201).json({ name, price });
});

// PUT endpoint for items
app.put('/items/:id', async (req: Request, res: Response) => {
    const db = await openDB();
    const { id } = req.params;
    const { name, price } = req.body;
    await db.run('UPDATE items SET name = ?, price = ? WHERE id = ?', [name, price, id]);
    res.json({ id, name, price });
});

// DELETE endpoint for items
app.delete('/items/:id', async (req: Request, res: Response) => {
    const db = await openDB();
    const { id } = req.params;
    await db.run('DELETE FROM items WHERE id = ?', [id]);
    res.status(204).send();
});





// PUT endpoint for purchase orders
app.put('/purchase-orders/:id', async (req: Request, res: Response) => {
    const db = await openDB();
    const { id } = req.params;
    const { itemId, quantity, userId } = req.body;
    const item = await db.get('SELECT * FROM items WHERE id = ?', [itemId]);
    if (item) {
        const total = item.price * quantity;
        await db.run('UPDATE purchase_orders SET itemId = ?, quantity = ?, total = ?, userId = ? WHERE id = ?', [itemId, quantity, total, userId, id]);
        res.json({ id, itemId, quantity, total });
    } else {
        res.status(404).send('Item not found');
    }
});



// GET endpoint for user scores
app.get('/users/:id/score', async (req: Request, res: Response) => {
    const db = await openDB();
    const { id } = req.params;
    const user = await db.get('SELECT score FROM users WHERE id = ?', [id]);
    if (user) {
        res.json({ score: user.score });
    } else {
        res.status(404).send('User not found');
    }
});




// GET endpoint for top 10 users with highest scores
app.get('/users/top-scorers', async (req: Request, res: Response) => {
    const db = await openDB();
    const topUsers = await db.all('SELECT * FROM users ORDER BY score DESC LIMIT 10');
    res.json(topUsers);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
