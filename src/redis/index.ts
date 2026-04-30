import { Redis } from "ioredis";

export const redis = new Redis({
    port: Number(process.env.REDIS_PORT) || 6379,
    host: process.env.REDIS_HOST || "localhost"
});

redis.on("connect", () => {
    console.log("Redis Connected");
})

redis.on("ready", () => {
  console.log("Redis ready to use!!");
});

redis.on("error", (err) => {
  console.error("Redis error:", err.message);
});

redis.on("close", () => {
  console.warn("Redis connection closed");
});

redis.on("reconnecting", () => {
  console.log("Redis reconnecting...");
});