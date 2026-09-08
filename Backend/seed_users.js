import mongoose from "mongoose";
import "dotenv/config"; // Loads MONGOURL from .env
import { logger } from "./src/config/logger.js";
import Order from "./src/models/Order.model.js";

const MONGOURL =
  process.env.MONGOURL || "mongodb://127.0.0.1:27017/your_database_name";

// Real ObjectIds from your environment
const USER_IDS = [
  "6a83343e9fb8097f6a002306",
  "6aa045ccab41e2e7d598e5b8",
  "6aa045ccab41e2e7d598e5ba",
  "6aa045ccab41e2e7d598e5b7",
  "6aa045ccab41e2e7d598e5b5",
  "6aa045ccab41e2e7d598e5b4",
  "6aa045ccab41e2e7d598e5b3",
  "6aa045ccab41e2e7d598e5bc",
  "6aa045ccab41e2e7d598e5b6",
  "6aa045ccab41e2e7d598e5bb",
  "6aa045ccab41e2e7d598e5b9",
];

const PRODUCTS = [
  { id: new mongoose.Types.ObjectId("6a8408f68a9b3b753a942859"), price: 17500 },
  { id: new mongoose.Types.ObjectId("6a833c1c93d1d40f72837591"), price: 3456 },
];

const TOTAL_ORDERS = 365000;
const BATCH_SIZE = 5000; // Batch insert size for performance and low memory consumption

async function seedMassiveOrders() {
  try {
    await mongoose.connect(MONGOURL);
    console.log("Connected to MongoDB successfully.");

    // Fetch dynamic database references
    const dbWarehouses = await mongoose.connection.db
      .collection("warehouses")
      .find({})
      .toArray();
    const dbRacks = await mongoose.connection.db
      .collection("racks")
      .find({})
      .toArray();
    const dbShelves = await mongoose.connection.db
      .collection("shelves")
      .find({})
      .toArray();

    const warehouseId =
      dbWarehouses.length > 0
        ? dbWarehouses[0]._id
        : new mongoose.Types.ObjectId();
    const rackId =
      dbRacks.length > 0 ? dbRacks[0]._id : new mongoose.Types.ObjectId();
    const shelveId =
      dbShelves.length > 0 ? dbShelves[0]._id : new mongoose.Types.ObjectId();

    const orderStatuses = ["pending", "confirm", "complete", "delivered"];
    const paymentStatuses = ["due", "paid"];

    const getRandomElement = (arr) =>
      arr[Math.floor(Math.random() * arr.length)];

    const now = new Date().getTime();
    const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;
    const timeStep = (now - oneYearAgo) / TOTAL_ORDERS;

    let ordersBatch = [];
    let insertedCount = 0;

    console.log(
      `Starting bulk generation of ${TOTAL_ORDERS.toLocaleString()} orders...`,
    );
    const startTime = Date.now();

    for (let i = 0; i < TOTAL_ORDERS; i++) {
      // 1. Calculate realistic date across the 1-year timeline
      const orderTimestamp = new Date(oneYearAgo + i * timeStep);

      const creatorId = getRandomElement(USER_IDS);
      const isGuest = i % 2 === 0;

      const customerId = isGuest ? null : getRandomElement(USER_IDS);
      const guestCustomer = isGuest
        ? {
            username: `guest_buyer_${i}`,
            mobile: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
            address: `${Math.floor(Math.random() * 900) + 100} Sample Street`,
            email: `guest${i}@example.com`,
          }
        : undefined;

      const selectedProd = getRandomElement(PRODUCTS);
      const qty = Math.floor(Math.random() * 3) + 1;
      const price = selectedProd.price;
      const totalAmount = price * qty;
      const discountAmount = Math.random() > 0.7 ? 100 : 0;
      const finalPrice = Math.max(0, totalAmount - discountAmount);

      const paymentStatus = getRandomElement(paymentStatuses);
      const paidAmount =
        paymentStatus === "paid" ? finalPrice : Math.floor(finalPrice * 0.3);
      const dueAmount = finalPrice - paidAmount;

      ordersBatch.push({
        createdBy: creatorId,
        updatedBy: creatorId,
        customerId: customerId,
        guestCustomer: guestCustomer,
        items: [
          {
            product: selectedProd.id,
            qty,
            price,
            location: { rack: rackId, shelve: shelveId },
          },
        ],
        payment: {
          status: paymentStatus,
          paidAmount,
          discountAmount,
        },
        warehouseData: warehouseId,
        status: getRandomElement(orderStatuses),
        dueAmount,
        returnAmount: 0,
        createdAt: orderTimestamp,
        updatedAt: orderTimestamp,
      });

      // 2. Write to DB when batch size limit is reached
      if (ordersBatch.length === BATCH_SIZE) {
        await Order.insertMany(ordersBatch, { ordered: false });
        insertedCount += ordersBatch.length;
        ordersBatch = []; // Clear array memory buffer

        const progressPercent = ((insertedCount / TOTAL_ORDERS) * 100).toFixed(
          1,
        );
        console.log(
          `Inserted ${insertedCount.toLocaleString()} / ${TOTAL_ORDERS.toLocaleString()} orders (${progressPercent}%)`,
        );
      }
    }

    // Insert remaining orders
    if (ordersBatch.length > 0) {
      await Order.insertMany(ordersBatch, { ordered: false });
      insertedCount += ordersBatch.length;
    }

    const durationSeconds = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(
      `\n🎉 Completed! ${insertedCount.toLocaleString()} orders generated in ${durationSeconds} seconds.`,
    );
  } catch (error) {
    if (logger?.error) {
      logger.error(`Seeding error: ${error.message}`);
    } else {
      console.error("Seeding error:", error);
    }
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seedMassiveOrders();
