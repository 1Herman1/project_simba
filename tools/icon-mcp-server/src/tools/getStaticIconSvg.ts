import { z } from "zod";
import { getStaticIconSvg } from "../clients/iconify.js";

export const getStaticIconSvgSchema = {
  prefix: z.string().describe("Набор иконки, например 'lucide'"),
  name: z.string().describe("Имя иконки внутри набора, например 'shopping-cart'"),
};

export async function getStaticIconSvgHandler(args: { prefix: string; name: string }) {
  const svg = await getStaticIconSvg(args.prefix, args.name);
  return {
    content: [
      {
        type: "text" as const,
        text: svg,
      },
    ],
  };
}
