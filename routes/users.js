const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");

const usersRouter = express.Router();

const saltRounds = 10;

usersRouter.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !password) {
    req.session.messages = ["Username and password are required."];
    return res.redirect("/users/register");
  }

  bcrypt.hash(password, saltRounds, async (err, hash) => {
    if (err) {
      req.session.messages = ["Error processing your request."];
      return res.redirect("/users/register");
    }
    try {
      const client = req.app.locals.client;
      const response = await client.query(
        "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username",
        [username, email, hash]
      );
      const row = response.rows[0];
      return res.redirect("/users/login");
    } catch (err) {
      req.session.messages = ["Error processing your request."];
      return res.redirect("/users/register");
    }
  });
});

usersRouter.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/users/profile",
    failureRedirect: "/users/login",
    failureMessage: true,
  })
);

if (process.env.NODE_ENV === "dev") {
  usersRouter.get("/register", (req, res) => {
    res.render("register", {
      message: req.session.messages ? req.session.messages[0] : "",
    });
  });

  usersRouter.get("/login", (req, res) => {
    res.render("login", {
      message: req.session.messages ? req.session.messages[0] : "",
    });
  });

  usersRouter.get("/profile", (req, res) => {
    if (!req.user) {
      return res.redirect("/users/login");
    }
    res.render("profile", { user: req.user });
  });
}

module.exports = usersRouter;
