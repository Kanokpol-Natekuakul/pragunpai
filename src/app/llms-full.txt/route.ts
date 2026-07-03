import { buildLlmsFullTxt } from "@/lib/llms";

// Regenerate at most once per hour; content only changes when admins edit
// pages or publish articles.
export const revalidate = 3600;

export async function GET() {
  const body = await buildLlmsFullTxt();
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
