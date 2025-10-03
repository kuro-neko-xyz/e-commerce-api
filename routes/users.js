const express = require("express");
const passport = require("passport");

const usersRouter = express.Router();

usersRouter.post("/register", (req, res) => {});

usersRouter.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/users/profile",
    failureRedirect: "/users/login",
    failureMessage: true,
  })
);

if (process.env.NODE_ENV === "dev") {
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
