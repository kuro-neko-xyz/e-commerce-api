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
      await client.query(
        "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username",
        [username, email, hash]
      );
      return res.redirect("/users/login");
    } catch (err) {
      return res.status(500).send("Internal Server Error");
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

usersRouter.post("/change-password", async (req, res) => {
  if (!req.user) {
    return res.redirect("/users/login");
  }

  const { current_password, new_password, confirm_password } = req.body;

  const client = req.app.locals.client;
  const result = await client.query(
    "SELECT password_hash FROM users WHERE id = $1",
    [req.user.id]
  );

  if (result.rows.length === 0) {
    req.session.messages = ["User not found."];
    return res.redirect("/users/change-password");
  }

  const passwordHash = result.rows[0].password_hash;

  const match = await bcrypt.compare(current_password, passwordHash);

  if (!match) {
    req.session.messages = ["Current password is incorrect."];
    return res.redirect("/users/change-password");
  }

  if (new_password !== confirm_password) {
    req.session.messages = ["New password and confirmation do not match."];
    return res.redirect("/users/change-password");
  }

  bcrypt.hash(new_password, saltRounds, async (err, hash) => {
    if (err) {
      req.session.messages = ["Error processing your request."];
      return res.redirect("/users/change-password");
    }
    try {
      const client = req.app.locals.client;
      await client.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
        hash,
        req.user.id,
      ]);
      return res.redirect("/users/profile");
    } catch (err) {
      return res.status(500).send("Internal Server Error");
    }
  });
});

usersRouter.post("/change-email", async (req, res) => {
  if (!req.user) {
    return res.redirect("/users/login");
  }

  const { current_password, new_email } = req.body;

  const client = req.app.locals.client;
  const result = await client.query(
    "SELECT password_hash FROM users WHERE id = $1",
    [req.user.id]
  );

  if (result.rows.length === 0) {
    req.session.messages = ["User not found."];
    return res.redirect("/users/profile");
  }

  const passwordHash = result.rows[0].password_hash;

  const match = await bcrypt.compare(current_password, passwordHash);

  if (!match) {
    req.session.messages = ["Current password is incorrect."];
    return res.redirect("/users/change-email");
  }

  try {
    await client.query("UPDATE users SET email = $1 WHERE id = $2", [
      new_email,
      req.user.id,
    ]);
    return res.redirect("/users/profile");
  } catch (err) {
    return res.status(500).send("Internal Server Error");
  }
});

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

  usersRouter.get("/change-password", (req, res) => {
    if (!req.user) {
      return res.redirect("/users/login");
    }
    res.render("change_password", {
      message: req.session.messages ? req.session.messages[0] : "",
    });
  });

  usersRouter.get("/change-email", (req, res) => {
    if (!req.user) {
      return res.redirect("/users/login");
    }
    res.render("change_email", {
      message: req.session.messages ? req.session.messages[0] : "",
    });
  });
}

module.exports = usersRouter;
