const express = require("express");

const cartRouter = express.Router();

cartRouter.post("/add-item", async (req, res) => {
  if (!req.user) {
    res.status(403).send("Forbidden");
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

cartRouter.delete("/remove-item", async (req, res) => {
  if (!req.user) {
    res.status(403).send("Forbidden");
  }

  try {
    const client = req.app.locals.client;
    const userId = req.user.id;

    let cart = await client.query(
      "SELCT * FROM cartse WHERE user_id = $1 AND is_active = TRUE",
      [userId]
    );

    if (cart.rows.length === 0) {
      return res.status(400).send("Cart is empty");
    }

    const doesItemExist = await client.query(
      "SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2",
      [cart.rows[0].id, req.body.product_id]
    );

    if (doesItemExist.rows.length === 0) {
      return res.status(400).send("Item not found in cart");
    }

    await client.query(
      "DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2",
      [cart.rows[0].id, req.body.product_id]
    );
  } catch (err) {
    return res.status(500).send("Internal Server Error");
  }
});

cartRouter.get("/view", async (req, res) => {
  if (!req.user) {
    res.status(403).send("Forbidden");
  }

  try {
    const client = req.app.locals.client;
    const userId = req.user.id;

    let cart = await client.query(
      "SELECT * FROM carts WHERE user_id = $1 AND is_active = TRUE",
      [userId]
    );

    if (cart.rows.length !== 0) {
      let items = await client.query(
        "SELECT ci.product_id, p.name, ci.quantity FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = $1",
        [cart.rows[0].id]
      );

      return res.status(200).json({ items: items.rows });
    } else {
      return res.status(400).send("No active cart found");
    }
  } catch (err) {
    return res.status(500).send("Internal Server Error");
  }
});

cartRouter.post("/checkout", async (req, res) => {
  if (!req.user) {
    res.status(403).send("Forbidden");
  }

  try {
    const client = req.app.locals.client;
    const userId = req.user.id;

    let cart = await client.query(
      "SELECT * FROM carts WHERE user_id = $1 AND is_active = TRUE",
      [userId]
    );

    if (cart.rows.length === 0) {
      return res.status(400).send("No active cart to checkout");
    }

    const cartItems = await client.query(
      "SELECT * FROM cart_items WHERE cart_id = $1",
      [cart.rows[0].id]
    );

    // todo: add negative stock check here

    for (let item of cartItems.rows) {
      await client.query(
        "UPDATE products SET stock = stock - $1 WHERE id = $2",
        [item.quantity, item.product_id]
      );
    }

    await client.query("UPDATE carts SET is_active = FALSE WHERE id = $1", [
      cart.rows[0].id,
    ]);

    return res.status(200).send("Checkout successful");
  } catch (err) {
    return res.status(500).send("Internal Server Error");
  }
});

module.exports = cartRouter;
