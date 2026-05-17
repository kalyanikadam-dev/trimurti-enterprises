export const simpleAdminAuth = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (token !== "admin123") {
    return res
      .status(401)
      .json({ error: "Unauthorized - use Bearer admin123" });
  }
  req.user = { role: "admin" };
  next();
};
