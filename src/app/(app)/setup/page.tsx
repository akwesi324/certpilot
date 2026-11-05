import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { EXAMS } from "@/lib/exams";
import SetupForm from "@/components/SetupForm";

export default async function SetupPage() {
  const userId = await requireUserId();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { targetExamId: true, examDate: true, institution: true } });
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Which exam are you preparing for?</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Your dashboard, practice sets and simulations are built around this exam. You can change it any time.
        </p>
      </div>
      <SetupForm
        exams={EXAMS.map((e) => ({ id: e.id, name: e.name, code: e.code, vendor: e.vendor, questions: e.format.questions, minutes: e.format.minutes }))}
        current={{ examId: user.targetExamId ?? "", examDate: user.examDate?.toISOString().slice(0, 10) ?? "", institution: user.institution ?? "" }}
      />
    </div>
  );
}
