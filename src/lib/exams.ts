/**
 * Exam catalogue: format and domain weightings from each vendor's public exam outline, with a
 * short summary of what each domain covers. Practice questions are written against these
 * objectives; no real exam content is used.
 */

export type Domain = {
  id: string;
  name: string;
  weight: number; // percent of the exam
  topics: string[];
  videoUrl?: string; // YouTube playlist or video for this domain
};

export type Exam = {
  id: string;
  vendor: "CompTIA" | "EC-Council" | "ISC2";
  code: string;
  name: string;
  format: {
    questions: number; // questions in a full simulation
    minutes: number;
    note?: string;
  };
  officialPassing: string;
  objectivesUrl: string;
  domains: Domain[];
};

export const PASS_MARK = 80; // percent, CertPilot's own standard for every exam

export const EXAMS: Exam[] = [
  {
    id: "secplus",
    vendor: "CompTIA",
    code: "SY0-701",
    name: "CompTIA Security+",
    format: { questions: 90, minutes: 90 },
    officialPassing: "750 on a 100-900 scale",
    objectivesUrl: "https://www.comptia.org/certifications/security",
    domains: [
      { id: "secplus-1", name: "General Security Concepts", weight: 12, topics: ["Security control categories and types", "CIA triad, non-repudiation and AAA", "Zero trust and physical security", "Deception and disruption technology", "Change management", "Cryptography, PKI, hashing and certificates"] },
      { id: "secplus-2", name: "Threats, Vulnerabilities, and Mitigations", weight: 22, topics: ["Threat actors and motivations", "Threat vectors, social engineering and attack surfaces", "Application, OS, web, cloud, mobile and supply-chain vulnerabilities", "Indicators of malware, network, application and password attacks", "Mitigation techniques: segmentation, least privilege, patching, hardening"] },
      { id: "secplus-3", name: "Security Architecture", weight: 18, topics: ["Cloud, IaC, serverless, microservices, ICS/SCADA and IoT architecture", "Secure infrastructure: firewalls, IDS/IPS, VPN, NAC, SD-WAN, SASE", "Data types, classification, states and protection methods", "Resilience: high availability, backups, site recovery, power"] },
      { id: "secplus-4", name: "Security Operations", weight: 28, topics: ["Hardening systems, mobile devices and wireless", "Asset management", "Vulnerability management and scanning", "Monitoring, SIEM, DLP and alerting", "Email security: SPF, DKIM, DMARC; DNS and web filtering", "Identity and access management, MFA, SSO, privileged access", "Automation and orchestration", "Incident response and investigation data sources"] },
      { id: "secplus-5", name: "Security Program Management and Oversight", weight: 20, topics: ["Governance: policies, standards, procedures", "Risk management: SLE, ALE, ARO, BIA, risk register", "Third-party and vendor risk", "Compliance and privacy", "Audits, assessments and penetration testing", "Security awareness training"] },
    ],
  },
  {
    id: "cysaplus",
    vendor: "CompTIA",
    code: "CS0-003",
    name: "CompTIA CySA+",
    format: { questions: 85, minutes: 165 },
    officialPassing: "750 on a 100-900 scale",
    objectivesUrl: "https://www.comptia.org/certifications/cybersecurity-analyst",
    domains: [
      { id: "cysaplus-1", name: "Security Operations", weight: 33, topics: ["System and network architecture in security operations", "Indicators of malicious activity", "Tools: SIEM, SOAR, EDR, packet capture", "Threat intelligence and threat hunting", "Process improvement and automation"] },
      { id: "cysaplus-2", name: "Vulnerability Management", weight: 30, topics: ["Vulnerability scanning methods", "Analyzing scan output and CVSS", "Prioritization and risk", "Controls against common attacks (injection, XSS, overflow)", "Response, handling and patch management"] },
      { id: "cysaplus-3", name: "Incident Response and Management", weight: 20, topics: ["Kill chain, Diamond Model and MITRE ATT&CK", "Detection, analysis, containment, eradication and recovery", "Preparation and post-incident activity"] },
      { id: "cysaplus-4", name: "Reporting and Communication", weight: 17, topics: ["Vulnerability management reporting", "Incident response reporting and stakeholder communication", "Metrics and KPIs"] },
    ],
  },
  {
    id: "pentestplus",
    vendor: "CompTIA",
    code: "PT0-003",
    name: "CompTIA PenTest+",
    format: { questions: 90, minutes: 165 },
    officialPassing: "750 on a 100-900 scale",
    objectivesUrl: "https://www.comptia.org/certifications/pentest",
    domains: [
      { id: "pentestplus-1", name: "Engagement Management", weight: 13, topics: ["Scoping, rules of engagement and legal agreements", "Frameworks and methodologies", "Collaboration, communication and reporting"] },
      { id: "pentestplus-2", name: "Reconnaissance and Enumeration", weight: 21, topics: ["Passive and active reconnaissance, OSINT", "Network, host and service enumeration", "Scripting for recon"] },
      { id: "pentestplus-3", name: "Vulnerability Discovery and Analysis", weight: 17, topics: ["Vulnerability scanning and tooling", "Analyzing results and false positives", "Physical security weaknesses"] },
      { id: "pentestplus-4", name: "Attacks and Exploits", weight: 35, topics: ["Network attacks", "Authentication attacks", "Host-based attacks", "Web application attacks", "Cloud, wireless and social engineering attacks", "AI and specialized system attacks"] },
      { id: "pentestplus-5", name: "Post-exploitation and Lateral Movement", weight: 14, topics: ["Persistence", "Lateral movement and pivoting", "Staging, exfiltration and cleanup"] },
    ],
  },
  {
    id: "ceh",
    vendor: "EC-Council",
    code: "312-50 (CEH v13)",
    name: "Certified Ethical Hacker",
    format: { questions: 125, minutes: 240 },
    officialPassing: "60-85% depending on the exam form",
    objectivesUrl: "https://www.eccouncil.org/train-certify/certified-ethical-hacker-ceh/",
    domains: [
      { id: "ceh-1", name: "Information Security and Ethical Hacking Overview", weight: 6, topics: ["Security fundamentals and laws", "Hacking phases and methodologies", "Ethical hacking concepts"] },
      { id: "ceh-2", name: "Reconnaissance Techniques", weight: 21, topics: ["Footprinting and OSINT", "Network scanning", "Enumeration", "Vulnerability analysis"] },
      { id: "ceh-3", name: "System Hacking Phases and Attack Techniques", weight: 17, topics: ["Gaining access and password cracking", "Privilege escalation", "Malware threats", "Covering tracks"] },
      { id: "ceh-4", name: "Network and Perimeter Hacking", weight: 14, topics: ["Sniffing", "Social engineering", "Denial of service", "Session hijacking", "Evading IDS, firewalls and honeypots"] },
      { id: "ceh-5", name: "Web Application Hacking", weight: 16, topics: ["Web server attacks", "Web application attacks", "SQL injection"] },
      { id: "ceh-6", name: "Wireless Network Hacking", weight: 6, topics: ["Wireless encryption and attacks", "Wireless countermeasures"] },
      { id: "ceh-7", name: "Mobile Platform, IoT, and OT Hacking", weight: 8, topics: ["Mobile platform attacks", "IoT attacks", "OT and ICS attacks"] },
      { id: "ceh-8", name: "Cloud Computing", weight: 6, topics: ["Cloud concepts and threats", "Container and serverless security"] },
      { id: "ceh-9", name: "Cryptography", weight: 6, topics: ["Ciphers and algorithms", "PKI", "Cryptanalysis"] },
    ],
  },
  {
    id: "chfi",
    vendor: "EC-Council",
    code: "312-49 (CHFI v11)",
    name: "Computer Hacking Forensic Investigator",
    format: { questions: 150, minutes: 240, note: "No per-module weighting is published; modules are weighted equally here." },
    officialPassing: "60-85% depending on the exam form",
    objectivesUrl: "https://www.eccouncil.org/train-certify/computer-hacking-forensic-investigator-chfi/",
    domains: [
      ["Computer Forensics in Today's World", ["Types of investigations", "Rules of evidence", "Forensic readiness"]],
      ["Computer Forensics Investigation Process", ["First response", "Chain of custody", "Reporting and testimony"]],
      ["Understanding Hard Disks and File Systems", ["Disk structure, MBR and GPT", "NTFS, FAT and ext", "Slack space and deleted data"]],
      ["Data Acquisition and Duplication", ["Write blocking", "Live and dead acquisition", "Image formats and hash verification"]],
      ["Defeating Anti-forensics Techniques", ["Timestomping and log clearing", "Steganography and encryption", "File signature analysis"]],
      ["Windows Forensics", ["Registry artifacts", "Event logs", "Prefetch, LNK and shellbags"]],
      ["Linux and Mac Forensics", ["Linux logs and shell history", "macOS unified log and plists"]],
      ["Network Forensics", ["Packet capture analysis", "Flow and DNS logs"]],
      ["Malware Forensics", ["Static and dynamic analysis", "Memory analysis"]],
      ["Investigating Web Attacks", ["Web server logs", "Injection and web shells"]],
      ["Dark Web Forensics", ["Tor artifacts", "Memory evidence"]],
      ["Cloud Forensics", ["Provider logs", "Sync client artifacts"]],
      ["Email and Social Media Forensics", ["Header analysis, SPF/DKIM/DMARC", "Preserving social media content"]],
      ["Mobile Forensics", ["Acquisition methods", "App databases"]],
      ["IoT Forensics", ["Device, app and cloud evidence"]],
    ].map(([name, topics], i) => ({ id: `chfi-${i + 1}`, name: name as string, weight: Number((100 / 15).toFixed(2)), topics: topics as string[] })),
  },
  {
    id: "isc2cc",
    vendor: "ISC2",
    code: "CC",
    name: "ISC2 Certified in Cybersecurity",
    format: { questions: 100, minutes: 120 },
    officialPassing: "700 out of 1000",
    objectivesUrl: "https://www.isc2.org/certifications/cc",
    domains: [
      { id: "isc2cc-1", name: "Security Principles", weight: 26, topics: ["CIA triad and authentication", "Risk management", "Security controls", "ISC2 Code of Ethics", "Governance processes"] },
      { id: "isc2cc-2", name: "Business Continuity, Disaster Recovery & Incident Response Concepts", weight: 10, topics: ["Business continuity", "Disaster recovery", "Incident response"] },
      { id: "isc2cc-3", name: "Access Controls Concepts", weight: 22, topics: ["Physical access controls", "Logical access controls: DAC, MAC, RBAC", "Least privilege and segregation of duties"] },
      { id: "isc2cc-4", name: "Network Security", weight: 24, topics: ["Networking concepts: OSI, TCP/IP, ports", "Network threats and attacks", "Network security infrastructure", "Cloud and on-premises networks"] },
      { id: "isc2cc-5", name: "Security Operations", weight: 18, topics: ["Data security, encryption, hashing", "System hardening and configuration management", "Policies", "Security awareness training"] },
    ],
  },
  {
    id: "cissp",
    vendor: "ISC2",
    code: "CISSP",
    name: "ISC2 CISSP",
    format: { questions: 125, minutes: 180, note: "The real exam is adaptive (CAT, 100-150 questions in 3 hours); simulations here are a fixed 125 questions." },
    officialPassing: "700 out of 1000",
    objectivesUrl: "https://www.isc2.org/certifications/cissp",
    domains: [
      { id: "cissp-1", name: "Security and Risk Management", weight: 16, topics: ["Governance and compliance", "Professional ethics", "Risk management concepts", "Business continuity requirements"] },
      { id: "cissp-2", name: "Asset Security", weight: 10, topics: ["Data classification and ownership", "Data lifecycle and retention", "Data security controls"] },
      { id: "cissp-3", name: "Security Architecture and Engineering", weight: 13, topics: ["Secure design principles", "Security models", "Cryptography", "Physical and site security"] },
      { id: "cissp-4", name: "Communication and Network Security", weight: 13, topics: ["Secure network architecture", "Network components", "Secure communication channels"] },
      { id: "cissp-5", name: "Identity and Access Management", weight: 13, topics: ["Identification and authentication", "Federation and SSO", "Authorization models", "Identity lifecycle"] },
      { id: "cissp-6", name: "Security Assessment and Testing", weight: 12, topics: ["Assessment strategies", "Security control testing", "Audits"] },
      { id: "cissp-7", name: "Security Operations", weight: 13, topics: ["Investigations", "Logging and monitoring", "Incident management", "Disaster recovery"] },
      { id: "cissp-8", name: "Software Development Security", weight: 10, topics: ["SDLC security", "Secure coding", "Assessing software security"] },
    ],
  },
];

export function getExam(id: string): Exam | undefined {
  return EXAMS.find((e) => e.id === id);
}

export function getDomain(examId: string, domainId: string): Domain | undefined {
  return getExam(examId)?.domains.find((d) => d.id === domainId);
}

/**
 * How many questions from each domain a test of `total` questions should have, in proportion to
 * the domain weights (largest-remainder rounding, so the counts always add up to `total`).
 */
export function questionsPerDomain(exam: Exam, total: number, domainIds?: string[]): Map<string, number> {
  const domains = domainIds?.length ? exam.domains.filter((d) => domainIds.includes(d.id)) : exam.domains;
  const weightSum = domains.reduce((a, d) => a + d.weight, 0);
  const raw = domains.map((d) => ({ id: d.id, exact: (d.weight / weightSum) * total }));
  const counts = new Map(raw.map((r) => [r.id, Math.floor(r.exact)]));
  let left = total - [...counts.values()].reduce((a, b) => a + b, 0);
  for (const r of [...raw].sort((a, b) => (b.exact % 1) - (a.exact % 1))) {
    if (left <= 0) break;
    counts.set(r.id, (counts.get(r.id) ?? 0) + 1);
    left -= 1;
  }
  return counts;
}

// ---------------------------------------------------------------- video lessons

export type VideoLink = { title: string; url: string; source: string };

/** Free full-length courses (checked links). Exams without one fall back to per-domain searches. */
const COURSES: Record<string, VideoLink> = {
  secplus: {
    title: "Professor Messer SY0-701 Security+ course (free)",
    url: "https://www.professormesser.com/security-plus/sy0-701/sy0-701-video/sy0-701-comptia-security-plus-course/",
    source: "Professor Messer",
  },
};

const youtube = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

/** Free video lessons for a domain: a course (if the exam has one) and a focused video search. */
export function domainVideos(exam: Exam, domain: Domain, institution?: string | null): VideoLink[] {
  const links: VideoLink[] = [];
  const course = COURSES[exam.id];
  if (course) links.push(course);
  links.push({ title: `${domain.name}: ${exam.code} lessons`, url: youtube(`${exam.name} ${exam.code} ${domain.name}`), source: "YouTube" });
  if (institution) links.push({ title: `${institution}: ${domain.name}`, url: youtube(`${institution} ${exam.name} ${domain.name}`), source: institution });
  return links;
}

/** The single best link for a domain (used next to answers and domain bars). */
export function primaryVideo(exam: Exam, domain: Domain, topic?: string): VideoLink {
  const q = topic ? `${exam.name} ${exam.code} ${topic}` : `${exam.name} ${exam.code} ${domain.name}`;
  return { title: topic ? `Watch: ${topic}` : `Watch: ${domain.name}`, url: youtube(q), source: "YouTube" };
}
