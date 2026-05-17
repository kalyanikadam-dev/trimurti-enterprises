import prisma from "./prisma.js";

async function main() {
  console.log("Seeding data...");

  await prisma.product.deleteMany();

  await prisma.product.createMany({
    data: [
      {
        name: "Premium Glass Bottle 500ml",
        description: "High quality glass bottle for beverages.",
        price: 25,
        category: "bottle",
        images: ["/products/bottle1.jpeg"],
        featured: true,
      },
      {
        name: "Plastic PET Bottle 1L",
        description: "Durable PET bottle for water and juices.",
        price: 15,
        category: "bottle",
        images: ["/products/bottle2.jpeg"],
        featured: false,
      },
      // Add more products as needed
    ],
  });

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
