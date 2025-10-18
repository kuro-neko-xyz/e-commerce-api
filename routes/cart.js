const express = require("express");

const cartRouter = express.Router();

cartRouter.post("/add-item", async (req, res) => {
  if (!req.user) {
    return res.redirect("/users/login");
  }

  try {
    const client = req.app.locals.client;
    const userId = req.user.id;

    let cart = await client.query(
      "SELECT * FROM carts WHERE user_id = $1 AND is_active = TRUE",
      [userId]
    );

    if (cart.rows.length === 0) {
      cart = await client.query(
        "INSERT INTO carts (user_id) VALUES ($1) RETURNING *",
        [userId]
      );
    }

    const cartId = cart.rows[0].id;
    const { product_id, quantity } = req.body;

    const doesItemExist = await client.query(
      "SELECT * FROM products WHERE id = $1 AND stock >= $2",
      [product_id, quantity]
    );

    if (doesItemExist.rows.length === 0) {
      return res
        .status(400)
        .send("Product does not exist or insufficient stock");
    }

    await client.query(
      "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)",
      [cartId, product_id, quantity]
    );

    return res.status(201).send("Item added to cart");
  } catch (err) {
    return res.status(500).send("Internal Server Error");
  }
});

cartRouter.delete("/remove-item", (req, res) => {});

cartRouter.get("/view", (req, res) => {});

cartRouter.post("/checkout", (req, res) => {});

module.exports = cartRouter;
