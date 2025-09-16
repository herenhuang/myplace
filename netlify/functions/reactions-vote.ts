import { Handler } from "@netlify/functions";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { cardId } = JSON.parse(event.body || "{}");
    
    if (!cardId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "cardId is required" }),
      };
    }

    // Increment the vote count for this card
    const newCount = await redis.hincrby("reactions", cardId, 1);
    
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ cardId, count: newCount }),
    };
  } catch (error) {
    console.error("Error voting:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};