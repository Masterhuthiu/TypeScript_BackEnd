"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const express_1 = __importDefault(require("express"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const bcrypt_1 = __importDefault(require("bcrypt"));
const app = (0, express_1.default)();
const port = 3001;
app.use(express_1.default.json());
// Initialize and open SQLite database
function openDB() {
    return __awaiter(this, void 0, void 0, function* () {
        return (0, sqlite_1.open)({
            filename: './src/database.db',
            driver: sqlite3_1.default.Database
        });
    });
}
// Create tables if they don't exist
(() => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield openDB();
    yield db.exec(`
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
}))();
// GET endpoint for users
app.get('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield openDB();
    const items = yield db.all('SELECT * FROM users');
    res.json(items);
}));
// DELETE endpoint for purchase orders
/* OLD
app.delete('/purchase-orders/:id', async (req: Request, res: Response) => {
    const db = await openDB();
    const { id } = req.params;
    await db.run('DELETE FROM purchase_orders WHERE id = ?', [id]);
    res.status(204).send();
});
*/
app.delete('/purchase-orders/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield openDB();
    const { id, userId } = req.params;
    yield db.run('DELETE FROM purchase_orders WHERE id = ?', [id]);
    yield db.run('UPDATE users SET score = score - 1 WHERE id = ?', [userId]);
    res.status(204).send();
}));
// POST endpoint for purchase orders
app.post('/purchase-orders', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield openDB();
    const { itemId, quantity, userId } = req.body;
    const item = yield db.get('SELECT * FROM items WHERE id = ?', [itemId]);
    if (item) {
        const total = item.price * quantity;
        yield db.run('INSERT INTO purchase_orders (itemId, quantity, total, userId) VALUES (?, ?, ?, ?)', [itemId, quantity, total, userId]);
        yield db.run('UPDATE users SET score = score + 1 WHERE id = ?', [userId]);
        res.status(201).json({ itemId, quantity, total });
    }
    else {
        res.status(404).send('Item not found');
    }
}));
// Live Update new user
app.put('/users/score/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield openDB();
    const { id } = req.params;
    const { score, role } = req.body;
    if (role == "adm") {
        yield db.run('UPDATE users SET score = ? WHERE id = ?', [score, id]);
    }
    res.json({ id, score });
}));
// GET endpoint for purchase orders
app.get('/purchase-orders', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield openDB();
    const orders = yield db.all('SELECT * FROM purchase_orders');
    res.json(orders);
}));
// Register new user
app.post('/users/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield openDB();
    const { name, password, role } = req.body;
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    yield db.run('INSERT INTO users (name, password, role) VALUES (?, ?, ?)', [name, hashedPassword, role]);
    res.status(201).json({ name });
}));
// User login
app.post('/users/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield openDB();
    const { name, password } = req.body;
    const user = yield db.get('SELECT * FROM users WHERE name = ?', [name]);
    if (user && (yield bcrypt_1.default.compare(password, user.password))) {
        res.json({ id: user.id, name: user.name });
    }
    else {
        res.status(401).send('Invalid credentials');
    }
}));
// GET endpoint for items
app.get('/items', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield openDB();
    const items = yield db.all('SELECT * FROM items');
    res.json(items);
}));
// POST endpoint for items
app.post('/items', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield openDB();
    const { name, price } = req.body;
    yield db.run('INSERT INTO items (name, price) VALUES (?, ?)', [name, price]);
    res.status(201).json({ name, price });
}));
// PUT endpoint for items
app.put('/items/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield openDB();
    const { id } = req.params;
    const { name, price } = req.body;
    yield db.run('UPDATE items SET name = ?, price = ? WHERE id = ?', [name, price, id]);
    res.json({ id, name, price });
}));
// DELETE endpoint for items
app.delete('/items/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield openDB();
    const { id } = req.params;
    yield db.run('DELETE FROM items WHERE id = ?', [id]);
    res.status(204).send();
}));
// PUT endpoint for purchase orders
app.put('/purchase-orders/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield openDB();
    const { id } = req.params;
    const { itemId, quantity, userId } = req.body;
    const item = yield db.get('SELECT * FROM items WHERE id = ?', [itemId]);
    if (item) {
        const total = item.price * quantity;
        yield db.run('UPDATE purchase_orders SET itemId = ?, quantity = ?, total = ?, userId = ? WHERE id = ?', [itemId, quantity, total, userId, id]);
        res.json({ id, itemId, quantity, total });
    }
    else {
        res.status(404).send('Item not found');
    }
}));
// GET endpoint for user scores
app.get('/users/:id/score', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield openDB();
    const { id } = req.params;
    const user = yield db.get('SELECT score FROM users WHERE id = ?', [id]);
    if (user) {
        res.json({ score: user.score });
    }
    else {
        res.status(404).send('User not found');
    }
}));
// GET endpoint for top 10 users with highest scores
app.get('/users/top-scorers', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield openDB();
    const topUsers = yield db.all('SELECT * FROM users ORDER BY score DESC LIMIT 10');
    res.json(topUsers);
}));
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
