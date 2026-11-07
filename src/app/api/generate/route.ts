import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { GenerateError, MAX_PER_REQUEST, generateQuestions } from "@/lib/generate";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // generation can take a couple of minutes

const bodySchema = z.object({
  examId: z.string(),
  domainId: z.string(),
  count: z.number().int().min(1).max(MAX_PER_REQUEST),
  difficulty: z.enum(["easy", "medium", "hard", "mixed"]).optional(),
  topic: z.string().optional(),
});

/** POST /api/generate: admin only. Generates questions for one domain and stores them. */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await isAdmin(session.user.id))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  try {
    return NextResponse.json(await generateQuestions(parsed.data));
  } catch (e) {
    if (e instanceof GenerateError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error("[generate]", e);
    return NextResponse.json({ error: "Generation failed." }, { status: 500 });
  }
}
