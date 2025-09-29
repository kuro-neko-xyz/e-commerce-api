const express = require("express");

const producstsRouter = express.Router();

producstsRouter.get("/", (req, res) => {});

producstsRouter.get("/:id", (req, res) => {});

producstsRouter.post("/create", (req, res) => {});

producstsRouter.put("/:id/edit", (req, res) => {});

producstsRouter.delete("/:id/delete", (req, res) => {});

module.exports = producstsRouter;
