const express = require("express");

const cartRouter = express.Router();

cartRouter.post("/add-item", (req, res) => {});

cartRouter.delete("/remove-item", (req, res) => {});

cartRouter.get("/view", (req, res) => {});

cartRouter.post("/checkout", (req, res) => {});

module.exports = cartRouter;
