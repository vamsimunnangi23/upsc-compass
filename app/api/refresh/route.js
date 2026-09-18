import { revalidateTag } from "next/cache";

export async function POST() {
  revalidateTag("news");
  return Response.json({ ok: true });
}
