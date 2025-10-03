const express = require("express");
const passport = require("passport");

const usersRouter = express.Router();

usersRouter.post("/register", (req, res) => {});

usersRouter.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/users/login",
  })
);

usersRouter.get("/login", (req, res) => {
  res.render("login");
});

module.exports = usersRouter;
