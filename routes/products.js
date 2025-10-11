const express = require("express");

const producstsRouter = express.Router();

producstsRouter.get("/", async (req, res) => {
  if (!req.user) {
    return res.status(403).send("Forbidden");
  }

  try {
    const client = req.app.locals.client;
    const response = await client.query("SELECT * FROM products");

    return res.json(response.rows);
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
});

producstsRouter.get("/:id", (req, res) => {});

producstsRouter.post("/create", (req, res) => {});

producstsRouter.put("/:id/edit", (req, res) => {});

producstsRouter.delete("/:id/delete", (req, res) => {});

module.exports = producstsRouter;
