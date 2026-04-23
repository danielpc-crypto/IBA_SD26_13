require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const upload = multer();

const app = express();
app.use(cors());
app.use(express.json());
const key = process.env.GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(key);
const AWS = require("aws-sdk");

const db = mysql.createConnection({
    host:"iba-database.cpy6gmwayev0.us-east-2.rds.amazonaws.com",
    user:"admin",
    password:"GaffarIBA123",
    database:"iba"
});

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "us-east-2"
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

app.post("/upload/bucket", upload.single("file"), async (req, res) => {
    try{
        const file = req.file;
        const username = req.body.username;

        const key = `${username}/${Date.now()}_${file.originalname}`;
        
        const bucket = "iba-13-bucket";
        const result = await s3.upload({
            Bucket: bucket,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: "public-read"
        }).promise();
    

        res.json({ file_key: result.key });
    }catch(err){
        console.error("S3 upload error:", err);
        res.status(500).json({ message: 'Error uploading file' });
    }
});

app.get("/retrieve/bucket/:username/:s3_fileName", async (req, res) => {
    const { username, s3_fileName } = req.params;
    const bucket = "iba-13-bucket";
    
    const result = await s3.getObject({
        Bucket: bucket,
        Key: `${username}/${s3_fileName}`
    }).promise();
    res.json({
        key: s3_fileName,
        contentType: result.ContentType,
        body: result.Body.toString(),
        size: result.ContentLength
    });
});

app.get("/download/:username/:s3_fileName", async (req, res) => {
    const bucket = "iba-13-bucket";
    const { username, s3_fileName } = req.params;

    try {
        const file = await s3.getObject({
            Bucket: bucket,
            Key: `${username}/${s3_fileName}`
        }).promise();

        // Set headers so browser downloads it
        res.setHeader("Content-Type", file.ContentType);
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${s3_fileName}"`
        );

        res.send(file.Body);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to download file" });
    }
});


app.put('/data_uploaded/:id', (req, res) => {
    const { id } = req.params;
    const { s3_file_key } = req.body;

    db.query(
        'UPDATE users SET business_data_uploaded = 1, s3_file_key = ? WHERE id = ?',
        [s3_file_key, id],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'Data uploaded successfully' });
        }
    );
});

app.get('/users', (req, res) => {
    db.query(
        'SELECT * FROM users',
        (err, results) => {
            if (err) return res.status(500).json(err);
            res.json(results);
        }
    );
});

app.get('/users/:username', (req, res) => {
    const { username } = req.params;

    db.query(
        'SELECT * FROM users WHERE username = ?',
        [username],
        (err, results) => {
            if (err) return res.status(500).json(err);
            if (results.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json(results[0]);
        }
    );
});

app.delete('/users', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    db.query(
        'SELECT * FROM users WHERE username = ? AND password = ?',
        [username, password],
        (err, results) => {
            if (err) return res.status(500).json(err);
            if (results.length === 0) {
                return res.status(401).json({ message: 'Invalid username or password' });
            }

            db.query(
                'DELETE FROM users WHERE username = ? AND password = ?',
                [username, password],
                (err, result) => {
                    if (err) return res.status(500).json(err);
                    res.json({ message: 'User deleted successfully' });
                }
            );
        }
    );
});

app.get('/stored_flags/:id', (req, res) => {
    const { id } = req.params;

    db.query(
        'SELECT * FROM stored_flags WHERE user_id = ?',
        [id],
        (err, results) => {
            if (err) return res.status(500).json(err);
            if (results.length === 0) {
                return res.status(404).json({ message: 'Flags not found' });
            }
            res.json(results[0]);
        }
    );
});

app.post('/stored_flags/:user_id', (req, res) => {
    const { user_id } = req.params;
    const { non_pay, chargeback, variance_com_drop, anomaly_score, anomaly_pred, supplier_name, contract_start_date, fairness, current_month_commission, last_month_commission, prior_month_2_commission, prior_month_3_commission, prior_month_4_commission, prior_month_5_commission, contract_term_months, account_age_months } = req.body;
    db.query(
        'INSERT INTO stored_flags (user_id, non_pay, chargeback, variance_com_drop, anomaly_score, anomaly_pred, supplier_name, contract_start, fairness, current_month_commission, last_month_commission, prior_month_2_commission, prior_month_3_commission, prior_month_4_commission, prior_month_5_commission, contract_term_months, account_age_months) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [user_id, non_pay, chargeback, variance_com_drop, anomaly_score, anomaly_pred, supplier_name, contract_start_date, fairness, current_month_commission, last_month_commission, prior_month_2_commission, prior_month_3_commission, prior_month_4_commission, prior_month_5_commission, contract_term_months, account_age_months],
        (err, result) => {
            if (err) return res.status(500).json(err);
            if(result.length === 0) {
                return res.status(404).json({ message: 'Flags not stored' });
            }
            res.json({ message: 'Flags stored successfully' });
        }
    );
});

app.post('/chat-stream', upload.single("file"), async (req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Transfer-Encoding", "chunked");
  res.setHeader("Connection", "keep-alive");
  console.log(req.body);

  try {
    const { messages } = JSON.parse(req.body.messages);
    const fileData = req.body.file;
    const flags = req.body.flags;

    const context = [];
    if (fileData) context.push(`Uploaded file contents: ${fileData}`);
    if (flags) context.push(`Business Flags: ${JSON.stringify(flags)}`);
    context.push(`You are analyzing supplier/business commission data.

        Use the uploaded file data and business flags below when answering the user.

        ${context.join("\n\n")}
            `);


    const model = genAI.getGenerativeModel({
        model: "gemini-3-flash-preview",
    });

    const chat = model.startChat({
      history: messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }],
      })),
    });

    const lastMessage = messages[messages.length - 1].text;

    const fullPrompt = `${context}
        Use the provided file and flags when answering.

        User Question::
        ${lastMessage}
        `;

    const result = await chat.sendMessageStream(fullPrompt);

    for await (const chunk of result.stream) {
      res.write(chunk.text());
    }

    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).end("Error");
  }
});

app.get("/health", (req, res) => {
    res.json({ ok: true });
});

module.exports = app;

if (require.main === module) {
    app.listen(5000, () => {
        console.log("Server is running on port 5000");
    });
}