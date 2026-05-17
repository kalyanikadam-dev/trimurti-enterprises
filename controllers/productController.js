import prisma from "../prisma.js";

export const getProducts = async (req, res) => {
  try {
    const { category, featured, search } = req.query;
    let where = {};

    if (category) where.category = category;
    if (featured === "true") where.featured = true;
    if (search) where.name = { contains: search, mode: "insensitive" };

    const products = await prisma.product.findMany({ where });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const product = await prisma.product.create({ data: req.body });
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) return res.status(404).json({ error: "Product not found" });

    const product = await prisma.product.update({
      where: { id },
      data: req.body,
    });
    
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) return res.status(404).json({ error: "Product not found" });

    await prisma.product.delete({ where: { id } });
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
