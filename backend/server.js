const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: "iba-database.cpy6gmwayev0.us-east-2.rds.amazonaws.com",
    user: "admin",
    password: "GaffarIBA123",
    database: "iba"
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});

app.post('/signup', async (req, res) => {
    const { firstName, lastName, username, email, password} = req.body;

    db.query(
        'INSERT INTO users (firstName, lastName, username, email, password) VALUES (?, ?, ?, ?, ?)',
        [firstName, lastName, username, email, password],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'User registered successfully' });
        }
    )
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    db.query(
        'SELECT * FROM users WHERE email = ? AND password = ?',
        [email, password],
        (err, results) => {
            if (err) return res.status(500).json(err);
            if (results.length === 0) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }
            res.json({ message: 'Login successful', user: results[0] });
        }
    );
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});