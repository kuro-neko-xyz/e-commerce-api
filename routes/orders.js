const express = require("express");

const ordersRouter = express.Router();

ordersRouter.get("/", (req, res) => {
  if (!req.user) {
    return res.status(403).send("Forbidden");
  }

  try {
    const client = req.app.locals.client;
    const userId = req.user.id;
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
});

ordersRouter.get("/:id", (req, res) => {});

module.exports = ordersRouter;
