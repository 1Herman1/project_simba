import { z } from "zod";
import { searchAnimatedIcon } from "../clients/lottiefiles.js";

export const searchAnimatedIconSchema = {
  query: z.string().describe("Что ищем, по-английски (например 'success checkmark')"),
  limit: z.number().int().min(1).max(50).optional(),
};

export async function searchAnimatedIconHandler(args: { query: string; limit?: number }) {
  const results = await searchAnimatedIcon(args.query, args.limit ?? 20);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(results, null, 2),
      },
    ],
  };
}
