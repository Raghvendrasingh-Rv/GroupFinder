import { app } from "./app.js";
import { env } from "./config/env.js";
import { testRedisConnection } from "./config/redis.js";

const PORT = env.PORT;

async function start() {
  if (env.OTP_STORE === "redis") {
    const pong = await testRedisConnection();
    console.log(`Redis connected: ${pong}`);
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
