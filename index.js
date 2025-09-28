const express = require("express");
const Client = require("pg").Client;
require("dotenv").config();

const app = express();
const port = 3000;

const client = new Client({
  user: "ecom_user",
  password: process.env.DB_PASSWORD,
  host: "localhost",
  database: "e_commerce",
  port: 5432,
});

client.connect();

app.get("/", (req, res) => {
  client.query("SELECT * FROM products", (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error retrieving products");
    } else {
      res.json(result.rows);
    }
  });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
