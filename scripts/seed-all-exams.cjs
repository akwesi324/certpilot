const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const { EXAMS } = require('./dist/exams.js');

const prisma = new PrismaClient();

function contentHash(stem, options) {
  return crypto.createHash("sha256").update(JSON.stringify([stem.trim(), ["A", "B", "C", "D"].map((k) => options[k].trim())])).digest("hex");
}

// Generate realistic question templates for a given domain and topic
function generateDomainQuestions(exam, domain) {
  const questions = [];
  const topics = domain.topics && domain.topics.length ? domain.topics : [domain.name];

  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i];
    const difficulty = i % 3 === 0 ? "easy" : i % 3 === 1 ? "medium" : "hard";

    // Create realistic cybersecurity questions tailored to the exam and topic
    const q = createRealisticQuestion(exam, domain, topic, difficulty, i);
    if (q) questions.push(q);
  }

  // Ensure every domain has at least 2 questions
  if (questions.length < 2) {
    const fallbackTopic = topics[0] || domain.name;
    questions.push(createRealisticQuestion(exam, domain, fallbackTopic, "medium", 99));
  }

  return questions;
}

function createRealisticQuestion(exam, domain, topic, difficulty, seed) {
  // Diverse scenarios based on domain and topic themes
  const scenarios = [
    {
      stem: `When designing controls for ${topic.toLowerCase()} in an enterprise ${exam.name} environment, which strategy provides the most effective defense-in-depth?`,
      options: {
        A: `Implement layered verification controls alongside continuous monitoring and strict least-privilege enforcement.`,
        B: `Rely solely on border boundary inspection to avoid internal operational latency.`,
        C: `Disable logging on critical pathways to maximize network throughput and minimize storage overhead.`,
        D: `Deploy identical default credentials across all segment nodes to facilitate rapid recovery.`
      },
      answer: "A",
      explanations: {
        A: `Correct. Defense-in-depth requires multiple complementary security layers, combining access controls, monitoring, and least privilege.`,
        B: `Border-only security fails when an internal boundary is breached or insider threats occur.`,
        C: `Disabling logging destroys auditability and incident response visibility.`,
        D: `Using default or shared credentials creates severe lateral movement vulnerabilities.`
      }
    },
    {
      stem: `An analyst preparing for ${exam.code} is assessing an incident involving ${topic.toLowerCase()}. What should be the initial containment action?`,
      options: {
        A: `Power down the host immediately without volatile memory capture.`,
        B: `Isolate the affected system from the network segment while preserving volatile evidence for forensic analysis.`,
        C: `Delete all related system event logs to prevent attacker tampering.`,
        D: `Send a broadcast announcement across all external customer channels before verification.`
      },
      answer: "B",
      explanations: {
        A: `Abruptly powering down the machine wipes RAM, destroying active process and network socket evidence.`,
        B: `Correct. Isolating the system stops lateral movement and command-and-control communication while preserving RAM and forensic artifacts.`,
        C: `Deleting logs destroys forensic history and violates incident handling procedures.`,
        D: `Public announcements without triage verification induce premature panic and breach disclosure protocols.`
      }
    },
    {
      stem: `In the context of ${exam.name} (${domain.name}), how does ${topic.toLowerCase()} align with organizational risk management objectives?`,
      options: {
        A: `It eliminates 100% of residual and operational risks permanently.`,
        B: `It establishes quantifiable metrics and baseline controls to keep risk exposure within the organization's risk tolerance.`,
        C: `It transfers all financial and legal liability to junior system administrators.`,
        D: `It bypasses regulatory compliance mandates to expedite service deployment.`
      },
      answer: "B",
      explanations: {
        A: `Zero residual risk is practically impossible in real-world systems.`,
        B: `Correct. Risk management establishes measurable baselines and controls to maintain residual risk within acceptable organizational appetite.`,
        C: `Legal and governance accountability rests with executive leadership and the board, not junior staff.`,
        D: `Regulatory mandates cannot be arbitrarily bypassed without legal and financial penalties.`
      }
    },
    {
      stem: `Which of the following best describes a key audit consideration for ${topic.toLowerCase()} under ${domain.name}?`,
      options: {
        A: `Verifying that changes are formally requested, reviewed, tested, approved, and logged prior to production release.`,
        B: `Ensuring developers push untested hotfixes straight to production repositories.`,
        C: `Permitting shared root credentials among all project contractors.`,
        D: `Restricting audit log access exclusively to the personnel being audited.`
      },
      answer: "A",
      explanations: {
        A: `Correct. Formal change control ensures segregation of duties, testing validation, management approval, and audit trails.`,
        B: `Deploying untested hotfixes directly to production violates basic configuration and change management standards.`,
        C: `Shared root credentials eliminate non-repudiation and individual accountability.`,
        D: `Allowing audited personnel exclusive control over audit logs creates an irreconcilable conflict of interest.`
      }
    }
  ];

  const template = scenarios[seed % scenarios.length];

  // Rotate answer positions to prevent all answers from being A
  const choices = ["A", "B", "C", "D"];
  const rot = seed % 4; // 0: A, 1: B, 2: C, 3: D
  const targetAnswer = choices[rot];

  const originalAnswer = template.answer; // "A" or "B"
  const opts = { ...template.options };
  const expls = { ...template.explanations };

  if (targetAnswer !== originalAnswer) {
    // Swap targetAnswer and originalAnswer
    const tempOpt = opts[targetAnswer];
    opts[targetAnswer] = opts[originalAnswer];
    opts[originalAnswer] = tempOpt;

    const tempExpl = expls[targetAnswer];
    expls[targetAnswer] = expls[originalAnswer];
    expls[originalAnswer] = tempExpl;
  }

  return {
    examId: exam.id,
    domainId: domain.id,
    topic: topic,
    difficulty: difficulty,
    stem: template.stem,
    options: opts,
    answer: targetAnswer,
    explanations: expls
  };
}

async function main() {
  console.log(`Starting question generation for ${EXAMS.length} exams...`);
  let added = 0;
  let skipped = 0;

  for (const exam of EXAMS) {
    for (const domain of exam.domains) {
      const questions = generateDomainQuestions(exam, domain);
      for (const q of questions) {
        const hash = contentHash(q.stem, q.options);
        const exists = await prisma.question.findUnique({ where: { contentHash: hash }, select: { id: true } });
        if (exists) {
          skipped++;
          continue;
        }

        await prisma.question.create({
          data: {
            examId: q.examId,
            domainId: q.domainId,
            topic: q.topic,
            difficulty: q.difficulty,
            stem: q.stem,
            options: q.options,
            answer: q.answer,
            explanations: q.explanations,
            source: "STARTER",
            contentHash: hash,
          }
        });
        added++;
      }
    }
  }

  console.log(`Done! Added: ${added}, Already existed: ${skipped}`);
  const totalInDb = await prisma.question.count();
  console.log(`Total questions in database: ${totalInDb}`);

  const examsWithQ = await prisma.question.groupBy({ by: ['examId'], _count: true });
  console.log(`Exams with active questions: ${examsWithQ.length} / ${EXAMS.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
