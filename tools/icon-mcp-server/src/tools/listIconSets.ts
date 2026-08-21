import { z } from "zod";
import { listIconSets } from "../clients/iconify.js";

export const listIconSetsSchema = {
  category: z.string().optional().describe("Фильтр по категории (например 'General')"),
};

export async function listIconSetsHandler(args: { category?: string }) {
  const sets = await listIconSets(args.category);
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(sets, null, 2),
      },
    ],
  };
}
