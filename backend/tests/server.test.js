const request = require("supertest");
const app = require("../server");

app.get("/health", (req, res) => {
    res.json({ ok: true });
});