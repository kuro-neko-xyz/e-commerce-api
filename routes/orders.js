const express = require("express");

const ordersRouter = express.Router();

ordersRouter.get("/", (req, res) => {});

ordersRouter.get("/:id", (req, res) => {});

ordersRouter.get("/user/:userId", (req, res) => {});

module.exports = ordersRouter;
