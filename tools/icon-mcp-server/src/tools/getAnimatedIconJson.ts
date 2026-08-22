import { z } from "zod";
import { getAnimatedIconJson } from "../clients/lottiefiles.js";

export const getAnimatedIconJsonSchema = {
  id: z.string().describe("ID анимации из search_animated_icon"),
};

export async function getAnimatedIconJsonHandler(args: { id: string }) {
  const json = await getAnimatedIconJson(args.id);
  return {
    content: [
      {
        type: "text" as const,
        text: json,
      },
    ],
  };
}
