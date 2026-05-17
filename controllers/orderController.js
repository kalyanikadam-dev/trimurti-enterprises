import prisma from "../prisma.js";

// @desc    Create a new order (Public)
export const createOrder = async (req, res) => {
  try {
    const { customerName, email, phone, shippingAddress, products, totalAmount, paymentMethod } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ error: "No products in order" });
    }

    const createdOrder = await prisma.order.create({
      data: {
        customerName,
        email,
        phone,
        shippingAddress,
        totalAmount,
        paymentMethod,
        products: {
          create: products.map(p => ({
            productId: p.productId,
            name: p.name,
            quantity: p.quantity,
            price: p.price,
          })),
        },
      },
      include: { products: true }
    });

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

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { products: true }
    });
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
    const { id } = req.params;

    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        ...(status && { orderStatus: status }),
        ...(paymentStatus && { paymentStatus }),
      },
      include: { products: true }
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error("Update order error:", error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete an order (Admin)
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    await prisma.order.delete({ where: { id } });
    res.json({ message: "Order removed" });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({ error: error.message });
  }
};
