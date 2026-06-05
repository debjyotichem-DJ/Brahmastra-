import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/database";

async function main() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Database connected");

    // Start server
    app.listen(env.PORT, () => {
      console.log(`
  ╔══════════════════════════════════════════════════╗
  ║                                                  ║
  ║     🧪 D-Chemistry API Server                   ║
  ║     Institute of Chemistry                       ║
  ║     by Debajyoti Haldar                          ║
  ║                                                  ║
  ║     🌐 http://localhost:${env.PORT}                   ║
  ║     📡 API: /api/v1                              ║
  ║     💚 Health: /health                           ║
  ║     🔧 Environment: ${env.NODE_ENV.padEnd(12)}            ║
  ║                                                  ║
  ╚══════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 SIGTERM received. Shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});

main();
