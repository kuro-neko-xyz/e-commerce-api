const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const crypto = require("crypto");
const session = require("express-session");
const Client = require("pg").Client;
const LocalStrategy = require("passport-local");
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

passport.use(
  new LocalStrategy(async function verify(username, password, cb) {
    return cb(null, { id: 1, username: "test" });
  })
);

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.authenticate("session"));

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

app.use("/users", usersRouter);
app.use("/products", productsRouter);
app.use("/cart", cartRouter);
app.use("/orders", ordersRouter);

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
