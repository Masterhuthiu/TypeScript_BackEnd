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
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json());
// Initialize and open SQLite database
function openDB() {
    return __awaiter(this, void 0, void 0, function* () {
        return (0, sqlite_1.open)({
            filename: './src/problem5.db',
            driver: sqlite3_1.default.Database
        });
    });
}
// Create table if it doesn't exist
(() => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield openDB();
    yield db.exec(`
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT
        )
    `);
}))();
// GET endpoint
app.get('/items', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield openDB();
    const items = yield db.all('SELECT * FROM items');
    res.json(items);
}));
// POST endpoint
app.post('/items', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield openDB();
    const { name } = req.body;
    yield db.run('INSERT INTO items (name) VALUES (?)', [name]);
    res.status(201).json({ name });
}));
// PUT endpoint
app.put('/items/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield openDB();
    const { id } = req.params;
    const { name } = req.body;
    yield db.run('UPDATE items SET name = ? WHERE id = ?', [name, id]);
    res.json({ id, name });
}));
// DELETE endpoint
app.delete('/items/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield openDB();
    const { id } = req.params;
    yield db.run('DELETE FROM items WHERE id = ?', [id]);
    res.status(204).send();
}));
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
