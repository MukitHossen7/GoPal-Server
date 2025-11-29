import { Server } from "http";
import app from "./app";
import config from "./config";
import { prisma } from "./config/db";
import { seedAdmin } from "./utils/seedAdmin";

let server: Server;

const prismaXServer = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Connected to the database successfully.");
    server = app.listen(config.PORT, () => {
      console.log(`🚀 Server is running on http://localhost: ${config.PORT}`);
    });
  } catch (error) {
    console.log("❌ Database connection failed:", error);
    process.exit(1);
  }
};

(async () => {
  await prismaXServer();
  await seedAdmin();
})();

//Server error handle
process.on("unhandledRejection", (err) => {
  console.log("unHandle rejection detected... Server shutting down... ", err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.log("un caught exception detected... Server shutting down... ", err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on("SIGTERM", () => {
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});
