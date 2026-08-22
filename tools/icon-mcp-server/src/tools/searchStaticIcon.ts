import { z } from "zod";
import { searchStaticIcon } from "../clients/iconify.js";

export const searchStaticIconSchema = {
  query: z.string().describe("Что ищем, по-английски (например 'shopping cart')"),
  set: z.string().optional().describe("Ограничить одним набором (например 'lucide')"),
  limit: z.number().int().min(1).max(50).optional(),
};

export async function searchStaticIconHandler(args: {
  query: string;
  set?: string;
  limit?: number;
}) {
  const results = await searchStaticIcon(args.query, args.set, args.limit ?? 20);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(results, null, 2),
      },
    ],
  };
}
