const express = require("express");

const producstsRouter = express.Router();

producstsRouter.get("/", async (req, res) => {
  if (!req.user) {
    res.status(403).send("Forbidden");
  }

  try {
    const client = req.app.locals.client;
    const response = await client.query("SELECT * FROM products");

    return res.json(response.rows);
  } catch (err) {
    return res.status(500).send("Internal Server Error");
  }
});

producstsRouter.get("/:id/detail", async (req, res) => {
  if (!req.user) {
    res.status(403).send("Forbidden");
  }

  try {
    const client = req.app.locals.client;
    const id = req.params.id;

    const response = await client.query(
      "SELECT * FROM products WHERE id = $1",
      [id]
    );

    if (response.rows.length === 0) {
      return res.status(404).send("Product Not Found");
    }

    return res.json(response.rows[0]);
  } catch (err) {
    return res.status(500).send("Internal Server Error");
  }
});

producstsRouter.post("/create", async (req, res) => {
  if (!req.user) {
    res.status(403).send("Forbidden");
  }

  try {
    const client = req.app.locals.client;
    const { name, price, stock } = req.body;

    const response = await client.query(
      "INSERT INTO products (name, price, stock) VALUES ($1, $2, $3) RETURNING *",
      [name, price, stock]
    );

    return res.status(201).json(response.rows[0]);
  } catch (err) {
    return res.status(500).send("Internal Server Error");
  }
});

producstsRouter.put("/:id/edit", async (req, res) => {
  if (!req.user) {
    res.status(403).send("Forbidden");
  }

  try {
    const client = req.app.locals.client;
    const id = req.params.id;
    const { name, price, stock } = req.body;

    const response = await client.query(
      "UPDATE products SET name = $1, price = $2, stock = $3 WHERE id = $4 RETURNING *",
      [name, price, stock, id]
    );

    if (response.rows.length === 0) {
      return res.status(404).send("Product Not Found");
    }

    return res.json(response.rows[0]);
  } catch (err) {
    return res.status(500).send("Internal Server Error");
  }
});

producstsRouter.delete("/:id/delete", async (req, res) => {
  if (!req.user) {
    res.status(403).send("Forbidden");
  }

  try {
    const client = req.app.locals.client;
    const id = req.params.id;

    client.query("DELETE FROM products WHERE id = $1", [id]);

    return res.redirect("/products");
  } catch (err) {
    return res.status(500).send("Internal Server Error");
  }
});

if (process.env.NODE_ENV === "dev") {
  producstsRouter.get("/create", (req, res) => {
    if (!req.user) {
      res.status(403).send("Forbidden");
    }
    res.render("create_product");
  });

  producstsRouter.get("/:id/edit", (req, res) => {
    if (!req.user) {
      res.status(403).send("Forbidden");
    }
    res.render("edit_product", { id: req.params.id });
  });

  producstsRouter.post("/:id/edit", async (req, res) => {
    if (!req.user) {
      return res.status(403).send("Forbidden");
    }

    try {
      const client = req.app.locals.client;
      const id = req.params.id;
      const { name, price, stock } = req.body;

      const response = await client.query(
        "UPDATE products SET name = $1, price = $2, stock = $3 WHERE id = $4 RETURNING *",
        [name, price, stock, id]
      );

      if (response.rows.length === 0) {
        return res.status(404).send("Product Not Found");
      }

      return res.json(response.rows[0]);
    } catch (err) {
      return res.status(500).send("Internal Server Error");
    }
  });

  producstsRouter.get("/:id/delete", async (req, res) => {
    if (!req.user) {
      res.status(403).send("Forbidden");
    }
    res.render("delete_product", { id: req.params.id });
  });

  producstsRouter.post("/:id/delete", async (req, res) => {
    if (!req.user) {
      return res.status(403).send("Forbidden");
    }
    try {
      const client = req.app.locals.client;
      const id = req.params.id;

      await client.query("DELETE FROM products WHERE id = $1", [id]);

      return res.redirect("/products");
    } catch (err) {
      return res.status(500).send("Internal Server Error");
    }
  });
}

module.exports = producstsRouter;
