import Order from "../models/Order.js";

// @desc    Create a new order (Public)
export const createOrder = async (req, res) => {
  try {
    const { customerName, email, phone, shippingAddress, products, totalAmount, paymentMethod } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ error: "No products in order" });
    }

    const order = new Order({
      customerName,
      email,
      phone,
      shippingAddress,
      products,
      totalAmount,
      paymentMethod,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all orders (Admin)
export const getAdminOrders = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (token !== "admin123") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update order status (Admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (status) order.orderStatus = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error("Update order error:", error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete an order (Admin)
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    await order.deleteOne();
    res.json({ message: "Order removed" });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({ error: error.message });
  }
};
