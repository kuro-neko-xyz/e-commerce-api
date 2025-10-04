const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const bcrypt = require("bcrypt");
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

app.locals.client = client;

client.connect();

passport.use(
  new LocalStrategy(async (username, password, cb) => {
    try {
      const response = await client.query(
        "SELECT * FROM users WHERE username=$1",
        [username]
      );

      const row = response.rows[0];

      if (!row) {
        return cb(null, false, { message: "Incorrect username or password." });
      }

      const match = await bcrypt.compare(password, row.password_hash);

      if (!match) {
        return cb(null, false, { message: "Incorrect username or password." });
      }

      return cb(null, { id: row.id, username: row.username });
    } catch (err) {
      return cb(err);
    }
  })
);

app.set("view engine", "ejs");

if (process.env.NODE_ENV === "dev") {
  app.use(bodyParser.urlencoded());
}

app.use(bodyParser.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.authenticate("session"));

passport.serializeUser((user, cb) => {
  process.nextTick(() => {
    cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser((user, cb) => {
  process.nextTick(() => {
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
