import { notFound, redirect } from "next/navigation";
import TestRunner from "@/components/TestRunner";
import { EngineError, getAttemptView } from "@/lib/engine";
import { getExam } from "@/lib/exams";
import { requireUserId } from "@/lib/session";

export default async function TestPage({ params }: PageProps<"/test/[id]">) {
  const { id } = await params;
  const userId = await requireUserId();
  let view;
  try {
    view = await getAttemptView(userId, id);
  } catch (e) {
    if (e instanceof EngineError) notFound();
    throw e;
  }
  if (view.status !== "IN_PROGRESS") redirect(`/test/${id}/results`);
  const exam = getExam(view.examId);
  return (
    <TestRunner
      attemptId={view.id}
      examName={exam?.name ?? view.examId}
      mode={view.mode}
      expiresAt={view.expiresAt}
      serverNow={view.serverNow}
      items={view.items}
      examLabel={exam ? `${exam.name} ${exam.code}` : view.examId}
      domainNames={Object.fromEntries((exam?.domains ?? []).map((d) => [d.id, d.name]))}
    />
  );
}
