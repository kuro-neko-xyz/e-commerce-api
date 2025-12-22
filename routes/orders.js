const express = require("express");

const ordersRouter = express.Router();

ordersRouter.get("/", async (req, res) => {
  if (!req.user) {
    return res.status(403).send("Forbidden");
  }

  try {
    const client = req.app.locals.client;
    const userId = req.user.id;

    const orders = await client.query(
      "SELECT * FROM carts c JOIN orders o ON o.cart_id = c.id WHERE c.user_id = $1",
      [userId]
    );

    return res.status(200).json(orders.rows);
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
});

ordersRouter.get("/:id", async (req, res) => {
  if (!req.user) {
    return res.status(403).send("Forbidden");
  }

  try {
    const client = req.app.locals.client;
    const userId = req.user.id;
    const orderId = req.params.id;

    const order = await client.query(
      "SELECT * FROM carts c JOIN orders o ON o.cart_id = c.id WHERE o.id = $1 AND c.user_id = $2",
      [orderId, userId]
    );

    if (order.rows.length === 0) {
      return res.status(404).send("Order not found");
    }

    return res.status(200).json(order.rows[0]);
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
});

module.exports = ordersRouter;
