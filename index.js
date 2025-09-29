const express = require("express");
const Client = require("pg").Client;
require("dotenv").config();

const usersRouter = require("./routes/users");
const productsRouter = require("./routes/products");
const cartRouter = require("./routes/cart");
const ordersRouter = require("./routes/orders");

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

app.use("/users", usersRouter);
app.use("/products", productsRouter);
app.use("/cart", cartRouter);
app.use("/orders", ordersRouter);

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
