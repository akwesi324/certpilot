/**
 * Exam catalogue: every exam sits in one category (Cybersecurity) and is grouped by the body that
 * awards it. Formats and domain weightings come from each body's public exam outline, with a
 * short summary of what each domain covers. Practice questions are written against these
 * objectives; no real exam content is used. Formats change, so each exam links to its official page.
 */

export type Domain = {
  id: string;
  name: string;
  weight: number; // percent of the exam
  topics: string[];
  videoUrl?: string; // YouTube playlist or video for this domain
};

export const CATEGORY = "Cybersecurity";

export const VENDORS = [
  { name: "CompTIA", fullName: "CompTIA", url: "https://www.comptia.org/certifications", accredited: true, about: "Vendor-neutral certifications from foundations to advanced practitioner." },
  { name: "ISC2", fullName: "ISC2", url: "https://www.isc2.org/certifications", accredited: true, about: "Security management, cloud, software and architecture credentials." },
  { name: "ISACA", fullName: "ISACA", url: "https://www.isaca.org/credentialing", accredited: true, about: "Audit, governance, risk and security management." },
  { name: "EC-Council", fullName: "EC-Council", url: "https://www.eccouncil.org/train-certify/", accredited: true, about: "Ethical hacking, defence, forensics and security leadership." },
  { name: "GIAC", fullName: "GIAC (SANS)", url: "https://www.giac.org/certifications/", accredited: true, about: "Hands-on technical certifications aligned with SANS courses." },
  { name: "PECB", fullName: "PECB", url: "https://pecb.com/en/education-and-certification-for-individuals", accredited: true, about: "ISO/IEC 27001 implementation and audit." },
  { name: "OffSec", fullName: "OffSec (Offensive Security)", url: "https://www.offsec.com/courses-and-certifications/", accredited: false, about: "Practical penetration testing, exploit and defence exams." },
  { name: "INE", fullName: "INE Security (eLearnSecurity)", url: "https://ine.com/security", accredited: false, about: "Practical penetration testing certifications." },
  { name: "CREST", fullName: "CREST", url: "https://www.crest-approved.org/skills-certifications-careers/", accredited: false, about: "Penetration testing and security analyst examinations." },
  { name: "Cisco", fullName: "Cisco", url: "https://www.cisco.com/site/us/en/learn/training-certifications/certifications/security/index.html", accredited: false, about: "Security operations and network security." },
  { name: "Microsoft", fullName: "Microsoft", url: "https://learn.microsoft.com/credentials/browse/?terms=security", accredited: false, about: "Security, identity and compliance on Microsoft and Azure." },
  { name: "AWS", fullName: "Amazon Web Services", url: "https://aws.amazon.com/certification/certified-security-specialty/", accredited: false, about: "Securing workloads on AWS." },
  { name: "Google Cloud", fullName: "Google Cloud", url: "https://cloud.google.com/learn/certification/cloud-security-engineer", accredited: false, about: "Securing workloads on Google Cloud." },
  { name: "CSA", fullName: "Cloud Security Alliance", url: "https://cloudsecurityalliance.org/education/ccsk", accredited: false, about: "Vendor-neutral cloud security knowledge." },
  { name: "Linux Foundation", fullName: "The Linux Foundation", url: "https://training.linuxfoundation.org/certification-catalog/", accredited: false, about: "Kubernetes and cloud native security." },
] as const;

export type Vendor = (typeof VENDORS)[number];
export type VendorName = Vendor["name"];

export type Exam = {
  id: string;
  vendor: VendorName;
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

type Outline = [name: string, topics: string[]][];
type WeightedOutline = [name: string, weight: number, topics: string[]][];

/** Domains with published weights. */
function weighted(prefix: string, outline: WeightedOutline): Domain[] {
  return outline.map(([name, weight, topics], i) => ({ id: `${prefix}-${i + 1}`, name, weight, topics }));
}

/** Domains where the body publishes objectives but no weighting: weighted equally. */
function equal(prefix: string, outline: Outline): Domain[] {
  const weight = Number((100 / outline.length).toFixed(2));
  return outline.map(([name, topics], i) => ({ id: `${prefix}-${i + 1}`, name, weight, topics }));
}

const NO_WEIGHTS = "No per-domain weighting is published; domains are weighted equally here.";
const PRACTICAL = (real: string) => `The real exam is ${real}. Simulations here test the knowledge behind it with multiple-choice questions.`;

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
  // ------------------------------------------------------------ CompTIA
  {
    id: "securityx",
    vendor: "CompTIA",
    code: "CAS-005",
    name: "CompTIA SecurityX",
    format: { questions: 90, minutes: 165, note: "Formerly CASP+. Includes performance-based questions on the real exam." },
    officialPassing: "Pass/fail (no scaled score)",
    objectivesUrl: "https://www.comptia.org/certifications/securityx",
    domains: weighted("securityx", [
      ["Governance, Risk, and Compliance", 20, ["Security program governance", "Risk management strategies", "Compliance and regulatory frameworks", "Threat modeling", "AI adoption risks and controls"]],
      ["Security Architecture", 27, ["Resilient system design", "Security in the SDLC and CI/CD", "Zero trust architecture", "Cloud, hybrid and data security architecture", "Identity and access architecture"]],
      ["Security Engineering", 31, ["Endpoint and server hardening", "Specialized and OT systems", "Automation and scripting for security", "Advanced cryptography and PKI", "Troubleshooting IAM and network security"]],
      ["Security Operations", 22, ["Monitoring and detection engineering", "Vulnerability and attack surface analysis", "Threat hunting and threat intelligence", "Incident response and forensic analysis"]],
    ]),
  },

  // ------------------------------------------------------------ ISC2
  {
    id: "sscp",
    vendor: "ISC2",
    code: "SSCP",
    name: "ISC2 Systems Security Certified Practitioner",
    format: { questions: 125, minutes: 120, note: "The real exam is adaptive (CAT, 100-125 items in 2 hours); simulations here are a fixed 125 questions." },
    officialPassing: "700 out of 1000",
    objectivesUrl: "https://www.isc2.org/certifications/sscp",
    domains: weighted("sscp", [
      ["Security Concepts and Practices", 16, ["Code of ethics", "Security controls and baselines", "Asset and change management", "Security awareness"]],
      ["Access Controls", 15, ["Authentication methods and MFA", "Trust architectures and federation", "Identity lifecycle", "Access control models"]],
      ["Risk Identification, Monitoring, and Analysis", 15, ["Risk management process", "Vulnerability assessment", "Monitoring and log analysis", "Reporting findings"]],
      ["Incident Response and Recovery", 14, ["Incident lifecycle", "Forensic investigation support", "Business continuity and disaster recovery"]],
      ["Cryptography", 9, ["Symmetric and asymmetric cryptography", "Hashing and digital signatures", "PKI and certificates", "Secure protocols"]],
      ["Network and Communications Security", 16, ["OSI and TCP/IP models", "Network attacks and countermeasures", "Network access controls and segmentation", "Wireless security"]],
      ["Systems and Application Security", 15, ["Malware and malicious activity", "Endpoint security", "Cloud and virtualization security", "Securing applications"]],
    ]),
  },
  {
    id: "ccsp",
    vendor: "ISC2",
    code: "CCSP",
    name: "ISC2 Certified Cloud Security Professional",
    format: { questions: 125, minutes: 180, note: "The real exam is adaptive (CAT, 100-150 items in 3 hours); simulations here are a fixed 125 questions." },
    officialPassing: "700 out of 1000",
    objectivesUrl: "https://www.isc2.org/certifications/ccsp",
    domains: weighted("ccsp", [
      ["Cloud Concepts, Architecture and Design", 17, ["Cloud computing concepts and reference architecture", "Security concepts for cloud", "Secure cloud design principles", "Evaluating cloud service providers"]],
      ["Cloud Data Security", 20, ["Cloud data lifecycle", "Storage architectures", "Data security technologies: encryption, tokenization, masking", "Data discovery, classification and IRM"]],
      ["Cloud Platform and Infrastructure Security", 17, ["Infrastructure components", "Designing a secure data center", "Risk analysis for cloud infrastructure", "Business continuity and disaster recovery"]],
      ["Cloud Application Security", 17, ["Secure SDLC for cloud", "Application security testing", "Cloud application architecture", "Identity and access management for apps"]],
      ["Cloud Security Operations", 16, ["Building and operating physical and logical infrastructure", "Operational controls and standards (ITIL, ISO/IEC 20000)", "Digital forensics in the cloud", "Security operations: SOC, monitoring, incident management"]],
      ["Legal, Risk and Compliance", 13, ["Legal requirements and unique risks in cloud", "Privacy issues", "Audit process in the cloud", "Enterprise risk management and outsourcing"]],
    ]),
  },
  {
    id: "csslp",
    vendor: "ISC2",
    code: "CSSLP",
    name: "ISC2 Certified Secure Software Lifecycle Professional",
    format: { questions: 125, minutes: 180 },
    officialPassing: "700 out of 1000",
    objectivesUrl: "https://www.isc2.org/certifications/csslp",
    domains: weighted("csslp", [
      ["Secure Software Concepts", 10, ["Core security concepts", "Security design principles"]],
      ["Secure Software Lifecycle Management", 11, ["Security in the SDLC", "Security standards and frameworks", "Metrics and documentation"]],
      ["Secure Software Requirements", 14, ["Functional and non-functional security requirements", "Privacy requirements", "Misuse and abuse cases", "Requirements traceability"]],
      ["Secure Software Architecture and Design", 15, ["Threat modeling", "Secure architecture patterns", "Security design reviews", "Interface and component security"]],
      ["Secure Software Implementation", 14, ["Secure coding practices", "Common vulnerabilities and mitigations", "Code review and static analysis", "Third-party component use"]],
      ["Secure Software Testing", 14, ["Security test strategy and test cases", "Dynamic testing and fuzzing", "Verification and validation", "Test data management"]],
      ["Secure Software Deployment, Operations, Maintenance", 11, ["Secure configuration and release", "Operational risk", "Patching and vulnerability management", "Secure decommissioning"]],
      ["Secure Software Supply Chain", 11, ["Supplier risk management", "SBOM and provenance", "Code signing and pedigree", "Contractual requirements"]],
    ]),
  },
  {
    id: "cgrc",
    vendor: "ISC2",
    code: "CGRC",
    name: "ISC2 Governance, Risk and Compliance",
    format: { questions: 125, minutes: 180 },
    officialPassing: "700 out of 1000",
    objectivesUrl: "https://www.isc2.org/certifications/cgrc",
    domains: weighted("cgrc", [
      ["Security and Privacy Governance, Risk Management, and Compliance Program", 16, ["Governance and risk frameworks (NIST RMF)", "Roles and responsibilities", "Privacy program requirements"]],
      ["Scope of the System", 10, ["System boundaries", "Information types and categorization", "Security and privacy requirements"]],
      ["Selection and Approval of Security and Privacy Controls", 14, ["Control baselines and tailoring", "Common and hybrid controls", "Continuous monitoring strategy"]],
      ["Implementation of Security and Privacy Controls", 17, ["Implementing controls", "Documenting control implementation"]],
      ["Assessment/Audit of Security and Privacy Controls", 16, ["Assessment plans", "Conducting assessments", "Reporting results and POA&M"]],
      ["System Compliance", 14, ["Authorization packages", "Risk determination and acceptance", "Authorization decisions"]],
      ["Compliance Maintenance", 13, ["Continuous monitoring", "Change impact analysis", "Ongoing authorization and decommissioning"]],
    ]),
  },
  {
    id: "issap",
    vendor: "ISC2",
    code: "CISSP-ISSAP",
    name: "ISC2 Information Systems Security Architecture Professional",
    format: { questions: 125, minutes: 180 },
    officialPassing: "700 out of 1000",
    objectivesUrl: "https://www.isc2.org/certifications/issap",
    domains: weighted("issap", [
      ["Governance, Compliance and Risk Management", 17, ["Legal and regulatory requirements", "Risk-based architecture decisions", "Architecture governance"]],
      ["Security Architecture Modeling", 15, ["Architecture frameworks (SABSA, TOGAF)", "Requirements analysis", "Architecture validation"]],
      ["Infrastructure Security Architecture", 21, ["Network and segmentation design", "Cryptographic solutions", "Cloud and hybrid infrastructure"]],
      ["Identity and Access Management Architecture", 16, ["Identity design and federation", "Authorization architecture", "Privileged access"]],
      ["Architecting for Application Security", 13, ["Secure SDLC integration", "Application security controls", "Third-party and API security"]],
      ["Security Operations Architecture", 18, ["Monitoring and SOC design", "Incident response architecture", "Business continuity design"]],
    ]),
  },
  {
    id: "issep",
    vendor: "ISC2",
    code: "CISSP-ISSEP",
    name: "ISC2 Information Systems Security Engineering Professional",
    format: { questions: 125, minutes: 180 },
    officialPassing: "700 out of 1000",
    objectivesUrl: "https://www.isc2.org/certifications/issep",
    domains: weighted("issep", [
      ["Systems Security Engineering Foundations", 22, ["Systems engineering principles", "Security engineering standards (NIST SP 800-160)", "Trust and assurance"]],
      ["Risk Management", 24, ["Risk management process", "Threat and vulnerability analysis", "Supply chain risk"]],
      ["Security Planning and Design", 22, ["Security requirements", "Security architecture and design", "Design trade-offs"]],
      ["Systems Implementation, Verification and Validation", 18, ["Secure implementation", "Verification and testing", "Validation against requirements"]],
      ["Secure Operations, Change Management and Disposal", 14, ["Operations and maintenance", "Change and configuration management", "Secure disposal"]],
    ]),
  },
  {
    id: "issmp",
    vendor: "ISC2",
    code: "CISSP-ISSMP",
    name: "ISC2 Information Systems Security Management Professional",
    format: { questions: 125, minutes: 180 },
    officialPassing: "700 out of 1000",
    objectivesUrl: "https://www.isc2.org/certifications/issmp",
    domains: weighted("issmp", [
      ["Leadership and Business Management", 20, ["Security strategy and alignment", "Budgets, metrics and resources", "Security culture and communication"]],
      ["Systems Lifecycle Management", 18, ["Security in projects and acquisitions", "Change management", "Integrating security into the lifecycle"]],
      ["Risk Management", 19, ["Risk frameworks and appetite", "Risk treatment", "Third-party risk"]],
      ["Threat Intelligence and Incident Management", 17, ["Threat intelligence programs", "Incident management program", "Lessons learned"]],
      ["Contingency Management", 15, ["Business continuity planning", "Disaster recovery planning", "Testing and maintenance"]],
      ["Law, Ethics and Security Compliance Management", 11, ["Legal and regulatory compliance", "Investigations", "Professional ethics"]],
    ]),
  },

  // ------------------------------------------------------------ ISACA
  {
    id: "cisa",
    vendor: "ISACA",
    code: "CISA",
    name: "ISACA Certified Information Systems Auditor",
    format: { questions: 150, minutes: 240 },
    officialPassing: "450 on a 200-800 scale",
    objectivesUrl: "https://www.isaca.org/credentialing/cisa",
    domains: weighted("cisa", [
      ["Information System Auditing Process", 18, ["Audit planning and risk-based audits", "Audit standards and ethics", "Evidence collection and sampling", "Reporting and follow-up"]],
      ["Governance and Management of IT", 18, ["IT governance and strategy", "IT policies and organizational structure", "Enterprise risk and IT resource management", "Performance monitoring"]],
      ["Information Systems Acquisition, Development, and Implementation", 12, ["Project governance and business cases", "SDLC and control design", "Testing and implementation", "Post-implementation review"]],
      ["Information Systems Operations and Business Resilience", 26, ["IT operations and service management", "Problem, change and configuration management", "Backup and recovery", "Business continuity and disaster recovery"]],
      ["Protection of Information Assets", 26, ["Information security frameworks and controls", "Identity and access management", "Network and endpoint security", "Data classification and privacy", "Security event management"]],
    ]),
  },
  {
    id: "cism",
    vendor: "ISACA",
    code: "CISM",
    name: "ISACA Certified Information Security Manager",
    format: { questions: 150, minutes: 240 },
    officialPassing: "450 on a 200-800 scale",
    objectivesUrl: "https://www.isaca.org/credentialing/cism",
    domains: weighted("cism", [
      ["Information Security Governance", 17, ["Enterprise governance and culture", "Security strategy", "Roles, responsibilities and frameworks"]],
      ["Information Security Risk Management", 20, ["Risk assessment and analysis", "Risk treatment and acceptance", "Risk monitoring and reporting"]],
      ["Information Security Program", 33, ["Program development and resources", "Control design and implementation", "Security awareness", "Third-party security", "Program metrics"]],
      ["Incident Management", 30, ["Incident response planning", "Business impact analysis", "Business continuity and disaster recovery", "Incident handling and post-incident review"]],
    ]),
  },
  {
    id: "crisc",
    vendor: "ISACA",
    code: "CRISC",
    name: "ISACA Certified in Risk and Information Systems Control",
    format: { questions: 150, minutes: 240 },
    officialPassing: "450 on a 200-800 scale",
    objectivesUrl: "https://www.isaca.org/credentialing/crisc",
    domains: weighted("crisc", [
      ["Governance", 26, ["Organizational governance", "Risk governance and appetite", "Risk frameworks and policies"]],
      ["IT Risk Assessment", 20, ["Risk identification", "Risk analysis and evaluation", "Risk registers and scenarios"]],
      ["Risk Response and Reporting", 32, ["Risk response options", "Control design and ownership", "Risk monitoring, KRIs and reporting"]],
      ["Information Technology and Security", 22, ["Enterprise architecture and IT operations", "Information security principles", "Data lifecycle and privacy", "Emerging technologies"]],
    ]),
  },
  {
    id: "ccoa",
    vendor: "ISACA",
    code: "CCOA",
    name: "ISACA Certified Cybersecurity Operations Analyst",
    format: { questions: 115, minutes: 240, note: "The real exam also has 25 performance-based tasks." },
    officialPassing: "450 on a 200-800 scale",
    objectivesUrl: "https://www.isaca.org/credentialing/ccoa",
    domains: weighted("ccoa", [
      ["Technology Essentials", 25, ["Networking and protocols", "Operating systems and virtualization", "Cloud and containers", "Data and application fundamentals"]],
      ["Cybersecurity Principles and Risk", 20, ["Security frameworks and controls", "Risk management", "Vulnerability management"]],
      ["Adversarial Tactics, Techniques, and Procedures", 10, ["Threat actors and attack lifecycle", "MITRE ATT&CK", "Common exploits and malware"]],
      ["Incident Detection and Response", 34, ["Log analysis and SIEM", "Detection engineering", "Incident handling", "Digital forensics basics"]],
      ["Securing Assets", 11, ["Endpoint and network controls", "Identity and access", "Data protection"]],
    ]),
  },

  // ------------------------------------------------------------ EC-Council
  {
    id: "cnd",
    vendor: "EC-Council",
    code: "312-38 (CND)",
    name: "Certified Network Defender",
    format: { questions: 100, minutes: 240, note: NO_WEIGHTS },
    officialPassing: "60-85% depending on the exam form",
    objectivesUrl: "https://www.eccouncil.org/train-certify/certified-network-defender-cnd/",
    domains: equal("cnd", [
      ["Network Defense Management", ["Network attacks and defence strategies", "Administrative controls and policies"]],
      ["Network Perimeter Protection", ["Firewalls, IDS/IPS", "Network segmentation", "VPN and secure remote access"]],
      ["Endpoint Protection", ["Windows and Linux hardening", "Mobile and IoT security"]],
      ["Application and Data Protection", ["Application whitelisting and WAF", "Data encryption, backup and loss prevention"]],
      ["Enterprise Virtual, Cloud, and Wireless Network Protection", ["Virtualization security", "Cloud security", "Wireless security"]],
      ["Incident Detection", ["Traffic monitoring and analysis", "Log management and SIEM"]],
      ["Incident Response", ["Incident handling process", "Forensic investigation basics"]],
      ["Business Continuity and Risk Management", ["Business continuity and disaster recovery", "Risk and vulnerability management", "Threat intelligence and attack surface analysis"]],
    ]),
  },
  {
    id: "ecsa",
    vendor: "EC-Council",
    code: "312-39 (CSA)",
    name: "Certified SOC Analyst",
    format: { questions: 100, minutes: 180, note: NO_WEIGHTS },
    officialPassing: "70%",
    objectivesUrl: "https://www.eccouncil.org/train-certify/certified-soc-analyst-csa/",
    domains: equal("ecsa", [
      ["Security Operations and Management", ["SOC models, roles and workflows", "SOC metrics"]],
      ["Cyber Threats, IoCs, and Attack Methodology", ["Network, host and application attacks", "Indicators of compromise"]],
      ["Incidents, Events, and Logging", ["Log sources and formats", "Windows, Linux and network logging"]],
      ["Incident Detection with SIEM", ["SIEM architecture and deployment", "Use cases and correlation rules", "Alert triage"]],
      ["Enhanced Incident Detection with Threat Intelligence", ["Threat intelligence types and sources", "Integrating intelligence into the SOC"]],
      ["Incident Response", ["Incident response process", "Containment and eradication", "Escalation and reporting"]],
    ]),
  },
  {
    id: "ecih",
    vendor: "EC-Council",
    code: "212-89 (ECIH)",
    name: "EC-Council Certified Incident Handler",
    format: { questions: 100, minutes: 180, note: NO_WEIGHTS },
    officialPassing: "70%",
    objectivesUrl: "https://www.eccouncil.org/train-certify/ec-council-certified-incident-handler-ecih/",
    domains: equal("ecih", [
      ["Incident Handling and Response Process", ["Incident response lifecycle", "Policies, plans and teams"]],
      ["First Response and Forensic Readiness", ["Evidence handling", "First responder procedures"]],
      ["Handling Malware Incidents", ["Malware detection and analysis", "Containment and recovery"]],
      ["Handling Email Security Incidents", ["Phishing and spam", "Header analysis"]],
      ["Handling Network Security Incidents", ["Unauthorized access", "Denial of service", "Wireless incidents"]],
      ["Handling Web Application Incidents", ["Web attacks and detection", "Response to web compromise"]],
      ["Handling Cloud Security Incidents", ["Cloud incident detection", "Provider coordination"]],
      ["Handling Insider Threats and Endpoint Incidents", ["Insider threat indicators", "Endpoint and OT incident response"]],
    ]),
  },
  {
    id: "cpent",
    vendor: "EC-Council",
    code: "CPENT",
    name: "Certified Penetration Testing Professional",
    format: { questions: 100, minutes: 180, note: PRACTICAL("a 24-hour hands-on range") + " " + NO_WEIGHTS },
    officialPassing: "70% (90% for LPT Master)",
    objectivesUrl: "https://www.eccouncil.org/train-certify/certified-penetration-testing-professional-cpent/",
    domains: equal("cpent", [
      ["Penetration Testing Scoping and Methodology", ["Scoping and rules of engagement", "Methodologies"]],
      ["Open Source Intelligence and Social Engineering", ["OSINT", "Social engineering"]],
      ["Network Penetration Testing", ["External and internal network testing", "Perimeter devices"]],
      ["Active Directory and Windows Attacks", ["AD enumeration", "Kerberos and credential attacks", "Privilege escalation"]],
      ["Web Application and Cloud Penetration Testing", ["Web app vulnerabilities", "Cloud attacks"]],
      ["Wireless, IoT and OT Penetration Testing", ["Wireless attacks", "IoT and OT testing"]],
      ["Binary Analysis and Exploitation", ["Buffer overflows", "Reverse engineering basics"]],
      ["Pivoting and Reporting", ["Pivoting and double pivoting", "Report writing"]],
    ]),
  },
  {
    id: "cciso",
    vendor: "EC-Council",
    code: "712-50 (CCISO)",
    name: "Certified Chief Information Security Officer",
    format: { questions: 150, minutes: 150, note: NO_WEIGHTS },
    officialPassing: "60-85% depending on the exam form",
    objectivesUrl: "https://www.eccouncil.org/train-certify/certified-chief-information-security-officer-cciso/",
    domains: equal("cciso", [
      ["Governance, Risk, and Compliance", ["Security governance programs", "Risk management", "Compliance and audit"]],
      ["Information Security Controls and Audit Management", ["Control frameworks", "Audit management"]],
      ["Security Program Management and Operations", ["Program and project management", "Security operations oversight"]],
      ["Information Security Core Competencies", ["Access control", "Incident management", "Business continuity", "Physical security"]],
      ["Strategic Planning, Finance, Procurement and Vendor Management", ["Security strategy", "Budgeting and finance", "Procurement and vendor management"]],
    ]),
  },

  // ------------------------------------------------------------ GIAC
  {
    id: "gsec",
    vendor: "GIAC",
    code: "GSEC",
    name: "GIAC Security Essentials",
    format: { questions: 106, minutes: 240, note: NO_WEIGHTS },
    officialPassing: "72%",
    objectivesUrl: "https://www.giac.org/certifications/security-essentials-gsec/",
    domains: equal("gsec", [
      ["Network Security and Protocols", ["Networking concepts and protocols", "Network device security", "Wireless security"]],
      ["Defence in Depth and Access Control", ["Defence in depth", "Access control and password management", "Security policies"]],
      ["Cryptography", ["Cryptographic concepts", "Applied cryptography and PKI"]],
      ["Vulnerability Management and Web Security", ["Vulnerability scanning", "Web application security"]],
      ["Incident Handling and Security Operations", ["Incident handling", "Logging and monitoring", "Endpoint security"]],
      ["Windows, Linux and Cloud Security", ["Windows security", "Linux security", "Cloud security fundamentals"]],
    ]),
  },
  {
    id: "gcih",
    vendor: "GIAC",
    code: "GCIH",
    name: "GIAC Certified Incident Handler",
    format: { questions: 106, minutes: 240, note: NO_WEIGHTS },
    officialPassing: "Shown in your GIAC account for each attempt",
    objectivesUrl: "https://www.giac.org/certifications/certified-incident-handler-gcih/",
    domains: equal("gcih", [
      ["Incident Handling Process", ["Preparation and identification", "Containment, eradication and recovery", "Lessons learned"]],
      ["Detecting Attacks and Analysis", ["Network and host investigation", "Memory and log analysis"]],
      ["Reconnaissance and Scanning", ["OSINT", "Network scanning and enumeration"]],
      ["Password and Credential Attacks", ["Password cracking", "Pass-the-hash and credential theft"]],
      ["Exploitation and Web Attacks", ["Exploitation frameworks", "Web application attacks"]],
      ["Post-Exploitation and Evasion", ["Persistence", "Lateral movement", "Covering tracks"]],
      ["Cloud and Endpoint Attacks", ["Cloud attacks", "Endpoint attack techniques"]],
    ]),
  },
  {
    id: "gcia",
    vendor: "GIAC",
    code: "GCIA",
    name: "GIAC Certified Intrusion Analyst",
    format: { questions: 106, minutes: 240, note: NO_WEIGHTS },
    officialPassing: "Shown in your GIAC account for each attempt",
    objectivesUrl: "https://www.giac.org/certifications/certified-intrusion-analyst-gcia/",
    domains: equal("gcia", [
      ["TCP/IP and Packet Analysis", ["IP, TCP, UDP and ICMP headers", "Fragmentation", "tcpdump and Wireshark"]],
      ["Application Protocols", ["DNS, HTTP, SMTP and TLS analysis", "Protocol anomalies"]],
      ["IDS/IPS and Signatures", ["Snort and Suricata rules", "Signature tuning"]],
      ["Network Traffic Analysis", ["Zeek logs", "NetFlow analysis", "Network forensics"]],
      ["Detection Architecture", ["Sensor placement", "Evasion techniques"]],
    ]),
  },
  {
    id: "gpen",
    vendor: "GIAC",
    code: "GPEN",
    name: "GIAC Penetration Tester",
    format: { questions: 82, minutes: 180, note: NO_WEIGHTS },
    officialPassing: "Shown in your GIAC account for each attempt",
    objectivesUrl: "https://www.giac.org/certifications/penetration-tester-gpen/",
    domains: equal("gpen", [
      ["Planning and Reconnaissance", ["Scoping and rules of engagement", "Reconnaissance"]],
      ["Scanning and Enumeration", ["Port and service scanning", "Vulnerability scanning"]],
      ["Exploitation", ["Initial access", "Metasploit and payloads"]],
      ["Password Attacks", ["Password guessing and spraying", "Hash cracking"]],
      ["Post-Exploitation and Lateral Movement", ["Privilege escalation", "Pivoting", "Persistence"]],
      ["Active Directory and Azure Attacks", ["Kerberos attacks", "AD enumeration", "Azure AD/Entra attacks"]],
    ]),
  },
  {
    id: "gwapt",
    vendor: "GIAC",
    code: "GWAPT",
    name: "GIAC Web Application Penetration Tester",
    format: { questions: 82, minutes: 180, note: NO_WEIGHTS },
    officialPassing: "Shown in your GIAC account for each attempt",
    objectivesUrl: "https://www.giac.org/certifications/web-application-penetration-tester-gwapt/",
    domains: equal("gwapt", [
      ["Web Application Recon and Mapping", ["HTTP and TLS", "Spidering and mapping", "Proxy tools"]],
      ["Authentication and Session Attacks", ["Authentication flaws", "Session management", "Access control flaws"]],
      ["Injection Attacks", ["SQL injection", "Command injection", "XXE and SSRF"]],
      ["Client-Side Attacks", ["Cross-site scripting", "CSRF", "Same-origin policy"]],
      ["APIs and Testing Methodology", ["API testing", "Reporting"]],
    ]),
  },
  {
    id: "gcfa",
    vendor: "GIAC",
    code: "GCFA",
    name: "GIAC Certified Forensic Analyst",
    format: { questions: 82, minutes: 180, note: NO_WEIGHTS },
    officialPassing: "Shown in your GIAC account for each attempt",
    objectivesUrl: "https://www.giac.org/certifications/certified-forensic-analyst-gcfa/",
    domains: equal("gcfa", [
      ["Advanced Incident Response and Threat Hunting", ["Threat hunting", "Incident response methodology"]],
      ["Memory Forensics", ["Memory acquisition", "Volatility analysis", "Process and injection analysis"]],
      ["Timeline Analysis", ["File system timelines", "Super timelines"]],
      ["Intrusion Analysis and Lateral Movement", ["Credential theft artifacts", "Lateral movement artifacts", "Event log analysis"]],
      ["Anti-Forensics Detection", ["Timestomping", "Wiping and hiding"]],
    ]),
  },
  {
    id: "gcfe",
    vendor: "GIAC",
    code: "GCFE",
    name: "GIAC Certified Forensic Examiner",
    format: { questions: 82, minutes: 180, note: NO_WEIGHTS },
    officialPassing: "Shown in your GIAC account for each attempt",
    objectivesUrl: "https://www.giac.org/certifications/certified-forensic-examiner-gcfe/",
    domains: equal("gcfe", [
      ["Windows Registry Forensics", ["Registry hives", "User and system artifacts"]],
      ["File System and Evidence Acquisition", ["NTFS analysis", "Acquisition and triage"]],
      ["Program Execution and File Usage", ["Prefetch, Amcache and Shimcache", "LNK files and jump lists", "Shellbags"]],
      ["Browser and Email Forensics", ["Browser artifacts", "Email analysis"]],
      ["Event Logs and USB Devices", ["Windows event logs", "USB device history"]],
      ["Cloud and Microsoft 365 Artifacts", ["Cloud storage artifacts", "Microsoft 365 logs"]],
    ]),
  },
  {
    id: "gcti",
    vendor: "GIAC",
    code: "GCTI",
    name: "GIAC Cyber Threat Intelligence",
    format: { questions: 82, minutes: 180, note: NO_WEIGHTS },
    officialPassing: "Shown in your GIAC account for each attempt",
    objectivesUrl: "https://www.giac.org/certifications/cyber-threat-intelligence-gcti/",
    domains: equal("gcti", [
      ["Intelligence Fundamentals", ["Intelligence lifecycle", "Requirements and analysis of competing hypotheses"]],
      ["Kill Chain, Diamond Model and ATT&CK", ["Intrusion analysis models", "Mapping to ATT&CK"]],
      ["Collection and Pivoting", ["Malware and infrastructure pivoting", "Open-source collection"]],
      ["Attribution and Campaigns", ["Clustering activity", "Attribution pitfalls"]],
      ["Dissemination and Sharing", ["Intelligence reporting", "STIX/TAXII and sharing"]],
    ]),
  },
  {
    id: "gicsp",
    vendor: "GIAC",
    code: "GICSP",
    name: "GIAC Global Industrial Cyber Security Professional",
    format: { questions: 82, minutes: 180, note: NO_WEIGHTS },
    officialPassing: "Shown in your GIAC account for each attempt",
    objectivesUrl: "https://www.giac.org/certifications/global-industrial-cyber-security-professional-gicsp/",
    domains: equal("gicsp", [
      ["ICS Components and Architecture", ["PLCs, HMIs and historians", "Purdue model"]],
      ["ICS Protocols and Networks", ["Modbus, DNP3 and industrial protocols", "Network segmentation"]],
      ["ICS Attacks and Threats", ["Attacks on ICS", "Threat landscape"]],
      ["Securing ICS Hosts and Networks", ["Host hardening", "Monitoring and detection"]],
      ["ICS Governance and Incident Response", ["Standards: IEC 62443 and NIST 800-82", "ICS incident response"]],
    ]),
  },

  // ------------------------------------------------------------ PECB
  {
    id: "iso27001li",
    vendor: "PECB",
    code: "ISO/IEC 27001 LI",
    name: "PECB ISO/IEC 27001 Lead Implementer",
    format: { questions: 80, minutes: 180, note: NO_WEIGHTS },
    officialPassing: "70%",
    objectivesUrl: "https://pecb.com/en/education-and-certification-for-individuals/iso-iec-27001/iso-iec-27001-lead-implementer",
    domains: equal("iso27001li", [
      ["Fundamental Principles and Concepts of an ISMS", ["ISO/IEC 27000 family", "Information security concepts"]],
      ["Information Security Controls", ["Annex A controls", "Statement of Applicability"]],
      ["Planning an ISMS Implementation", ["Context, scope and leadership", "Risk assessment and treatment"]],
      ["Implementing an ISMS", ["Documented information", "Awareness and communication", "Operations"]],
      ["Monitoring and Measurement", ["Performance evaluation", "Internal audit and management review"]],
      ["Continual Improvement and Certification Audit", ["Nonconformities and corrective action", "Preparing for certification"]],
    ]),
  },
  {
    id: "iso27001la",
    vendor: "PECB",
    code: "ISO/IEC 27001 LA",
    name: "PECB ISO/IEC 27001 Lead Auditor",
    format: { questions: 80, minutes: 180, note: NO_WEIGHTS },
    officialPassing: "70%",
    objectivesUrl: "https://pecb.com/en/education-and-certification-for-individuals/iso-iec-27001/iso-iec-27001-lead-auditor",
    domains: equal("iso27001la", [
      ["Fundamental Principles and Concepts of an ISMS", ["ISO/IEC 27001 requirements", "Information security concepts"]],
      ["Fundamental Audit Concepts and Principles", ["ISO 19011 principles", "Audit evidence and approaches"]],
      ["Preparing an ISO/IEC 27001 Audit", ["Audit planning", "Stage 1 audit"]],
      ["Conducting an ISO/IEC 27001 Audit", ["Stage 2 audit", "Interviews and sampling", "Nonconformity reports"]],
      ["Closing an ISO/IEC 27001 Audit", ["Audit conclusions and report", "Follow-up"]],
      ["Managing an Audit Program", ["Audit program management", "Auditor competence"]],
    ]),
  },

  // ------------------------------------------------------------ OffSec
  {
    id: "oscp",
    vendor: "OffSec",
    code: "PEN-200 (OSCP+)",
    name: "OffSec Certified Professional",
    format: { questions: 60, minutes: 120, note: PRACTICAL("a 24-hour hands-on lab plus a report") + " " + NO_WEIGHTS },
    officialPassing: "70 of 100 points",
    objectivesUrl: "https://www.offsec.com/courses/pen-200/",
    domains: equal("oscp", [
      ["Information Gathering and Enumeration", ["Passive and active recon", "Service enumeration"]],
      ["Web Application Attacks", ["SQL injection", "Directory traversal and file inclusion", "Command injection"]],
      ["Public Exploits and Client-Side Attacks", ["Finding and fixing exploits", "Phishing payloads"]],
      ["Privilege Escalation", ["Windows privilege escalation", "Linux privilege escalation"]],
      ["Port Redirection and Tunnelling", ["Port forwarding", "SSH and other tunnels"]],
      ["Active Directory Attacks", ["AD enumeration", "Kerberoasting and AS-REP roasting", "Lateral movement"]],
      ["Password Attacks and Reporting", ["Password cracking", "Report writing"]],
    ]),
  },
  {
    id: "osep",
    vendor: "OffSec",
    code: "PEN-300 (OSEP)",
    name: "OffSec Experienced Penetration Tester",
    format: { questions: 60, minutes: 120, note: PRACTICAL("a 48-hour hands-on lab plus a report") + " " + NO_WEIGHTS },
    officialPassing: "100 points or the final objective",
    objectivesUrl: "https://www.offsec.com/courses/pen-300/",
    domains: equal("osep", [
      ["Client-Side Code Execution", ["Office macros", "JScript and HTA"]],
      ["Antivirus and AMSI Evasion", ["Signature evasion", "AMSI bypass"]],
      ["Application Whitelisting Bypass", ["AppLocker bypass", "Living off the land"]],
      ["Process Injection and Migration", ["Process injection techniques", "Shellcode runners"]],
      ["Lateral Movement and Active Directory", ["Windows and Linux lateral movement", "AD exploitation and trusts"]],
      ["Network Filter Bypass", ["Egress filtering", "Proxies and tunnelling"]],
    ]),
  },
  {
    id: "oswe",
    vendor: "OffSec",
    code: "WEB-300 (OSWE)",
    name: "OffSec Web Expert",
    format: { questions: 60, minutes: 120, note: PRACTICAL("a 48-hour white-box lab plus a report") + " " + NO_WEIGHTS },
    officialPassing: "85 of 100 points",
    objectivesUrl: "https://www.offsec.com/courses/web-300/",
    domains: equal("oswe", [
      ["Source Code Review", ["Tracing user input", "Debugging web applications"]],
      ["Authentication Bypass", ["Logic flaws", "Session handling"]],
      ["Injection Vulnerabilities", ["SQL injection", "Server-side template injection"]],
      ["Deserialization and Prototype Pollution", ["Insecure deserialization", "JavaScript prototype pollution"]],
      ["Exploit Chaining and Automation", ["Chaining bugs to RCE", "Python exploit scripting"]],
    ]),
  },
  {
    id: "osda",
    vendor: "OffSec",
    code: "SOC-200 (OSDA)",
    name: "OffSec Defense Analyst",
    format: { questions: 60, minutes: 120, note: PRACTICAL("a 24-hour hands-on SIEM investigation plus a report") + " " + NO_WEIGHTS },
    officialPassing: "75 of 100 points",
    objectivesUrl: "https://www.offsec.com/courses/soc-200/",
    domains: equal("osda", [
      ["SOC Fundamentals and Attacker Methodology", ["SOC roles", "Attack lifecycle and ATT&CK"]],
      ["Windows and Linux Endpoint Detection", ["Windows event logs and Sysmon", "Linux logs"]],
      ["Network Detection", ["Network traffic analysis", "IDS alerts"]],
      ["SIEM Investigations", ["SIEM queries", "Correlation and triage"]],
      ["Detecting Common Attacks", ["Web and phishing attacks", "Privilege escalation and persistence", "Active Directory attacks"]],
    ]),
  },

  // ------------------------------------------------------------ INE
  {
    id: "ejpt",
    vendor: "INE",
    code: "eJPT",
    name: "INE Junior Penetration Tester",
    format: { questions: 35, minutes: 120, note: PRACTICAL("35 questions answered from a 48-hour hands-on lab") },
    officialPassing: "70%",
    objectivesUrl: "https://ine.com/security/certifications/ejpt-certification",
    domains: weighted("ejpt", [
      ["Assessment Methodologies", 25, ["Information gathering", "Footprinting and scanning", "Enumeration", "Vulnerability assessment"]],
      ["Host and Network Auditing", 25, ["Auditing fundamentals", "Host and network discovery"]],
      ["Host and Network Penetration Testing", 35, ["System and host exploitation", "Network-based attacks", "Metasploit", "Post-exploitation"]],
      ["Web Application Penetration Testing", 15, ["HTTP and web enumeration", "Common web attacks"]],
    ]),
  },
  {
    id: "ecppt",
    vendor: "INE",
    code: "eCPPT",
    name: "INE Certified Professional Penetration Tester",
    format: { questions: 60, minutes: 120, note: PRACTICAL("a hands-on lab with questions answered from it") + " " + NO_WEIGHTS },
    officialPassing: "70%",
    objectivesUrl: "https://ine.com/security/certifications/ecppt-certification",
    domains: equal("ecppt", [
      ["Information Gathering and Enumeration", ["Network and service enumeration", "OSINT"]],
      ["Exploitation and Post-Exploitation", ["Windows and Linux exploitation", "Privilege escalation"]],
      ["Active Directory Penetration Testing", ["AD enumeration", "AD attacks"]],
      ["Pivoting and Lateral Movement", ["Tunnelling", "Lateral movement"]],
      ["Web Application Penetration Testing", ["Web attacks"]],
      ["Command and Control and Evasion", ["C2 frameworks", "AV evasion basics"]],
    ]),
  },

  // ------------------------------------------------------------ CREST
  {
    id: "cpsa",
    vendor: "CREST",
    code: "CPSA",
    name: "CREST Practitioner Security Analyst",
    format: { questions: 120, minutes: 120, note: NO_WEIGHTS },
    officialPassing: "Set by CREST",
    objectivesUrl: "https://www.crest-approved.org/skills-certifications-careers/crest-practitioner-security-analyst/",
    domains: equal("cpsa", [
      ["Soft Skills and Assessment Management", ["Engagement lifecycle", "Legal and compliance", "Reporting"]],
      ["Core Technical Skills", ["IP protocols and networking", "Cryptography", "Common tools"]],
      ["Background Information Gathering and Open Source", ["Registration records and DNS", "OSINT"]],
      ["Networking Equipment", ["Routers, switches and firewalls", "VPNs and VoIP"]],
      ["Microsoft Windows Security Assessment", ["Domain and host enumeration", "Windows services and vulnerabilities"]],
      ["Unix Security Assessment", ["Unix enumeration", "Unix services and vulnerabilities"]],
      ["Web Technologies and Testing", ["Web servers and protocols", "Web testing methodology", "Common web vulnerabilities"]],
      ["Databases", ["Database enumeration", "SQL injection"]],
    ]),
  },

  // ------------------------------------------------------------ Cisco
  {
    id: "cbrops",
    vendor: "Cisco",
    code: "200-201 CBROPS",
    name: "Cisco Certified CyberOps Associate",
    format: { questions: 100, minutes: 120 },
    officialPassing: "Not published",
    objectivesUrl: "https://learningnetwork.cisco.com/s/cyberops-associate-exam-topics",
    domains: weighted("cbrops", [
      ["Security Concepts", 20, ["CIA triad and security deployments", "Security terms: threat intelligence, hunting, malware analysis", "Access control models", "CVSS and risk"]],
      ["Security Monitoring", 25, ["Attack surface and vulnerabilities", "Data types: full packet, NetFlow, session, alert", "Encryption and evasion effects on visibility", "Network and web application attacks"]],
      ["Host-Based Analysis", 20, ["Endpoint technologies", "Windows and Linux components", "Attribution and evidence", "Interpreting OS, application and command-line logs"]],
      ["Network Intrusion Analysis", 20, ["Mapping events to sources", "Impact of technologies on visibility", "Interpreting protocol headers", "Regular expressions"]],
      ["Security Policies and Procedures", 15, ["Incident handling (NIST 800-61)", "Cyber kill chain and Diamond Model", "SOC metrics", "Profiling network and server activity"]],
    ]),
  },
  {
    id: "scor",
    vendor: "Cisco",
    code: "350-701 SCOR",
    name: "Cisco CCNP Security Core (SCOR)",
    format: { questions: 100, minutes: 120 },
    officialPassing: "Not published",
    objectivesUrl: "https://learningnetwork.cisco.com/s/scor-exam-topics",
    domains: weighted("scor", [
      ["Security Concepts", 25, ["Common threats and vulnerabilities", "Cryptography and VPNs", "Security intelligence and APIs"]],
      ["Network Security", 20, ["Firewalls and IPS", "Segmentation and NetFlow", "Device hardening and management plane"]],
      ["Securing the Cloud", 15, ["Cloud service models and shared responsibility", "DevSecOps", "Cloud logging and monitoring"]],
      ["Content Security", 15, ["Web proxy and URL filtering", "Email security", "DNS security"]],
      ["Endpoint Protection and Detection", 10, ["EPP and EDR", "Outbreak control", "Device posture and MDM"]],
      ["Secure Network Access, Visibility and Enforcement", 15, ["802.1X and MAB", "Network access control", "Change of authorization"]],
    ]),
  },

  // ------------------------------------------------------------ Microsoft
  {
    id: "sc900",
    vendor: "Microsoft",
    code: "SC-900",
    name: "Microsoft Security, Compliance, and Identity Fundamentals",
    format: { questions: 45, minutes: 45, note: "Weights are the midpoints of Microsoft's published ranges." },
    officialPassing: "700 out of 1000",
    objectivesUrl: "https://learn.microsoft.com/credentials/certifications/security-compliance-and-identity-fundamentals/",
    domains: weighted("sc900", [
      ["Concepts of Security, Compliance, and Identity", 12, ["Shared responsibility and defence in depth", "Zero trust", "Encryption and hashing", "Identity concepts"]],
      ["Capabilities of Microsoft Entra", 28, ["Entra ID identity types", "Authentication and MFA", "Conditional Access", "Identity governance and PIM"]],
      ["Capabilities of Microsoft Security Solutions", 37, ["Azure network security", "Microsoft Defender for Cloud", "Microsoft Sentinel", "Microsoft Defender XDR"]],
      ["Capabilities of Microsoft Compliance Solutions", 23, ["Service Trust Portal and privacy", "Microsoft Purview data protection", "Compliance Manager", "eDiscovery and audit"]],
    ]),
  },
  {
    id: "sc200",
    vendor: "Microsoft",
    code: "SC-200",
    name: "Microsoft Security Operations Analyst",
    format: { questions: 50, minutes: 100, note: "Weights are the midpoints of Microsoft's published ranges." },
    officialPassing: "700 out of 1000",
    objectivesUrl: "https://learn.microsoft.com/credentials/certifications/security-operations-analyst/",
    domains: weighted("sc200", [
      ["Manage a Security Operations Environment", 26, ["Configure Defender XDR settings", "Manage assets and environments", "Design and configure a Sentinel workspace", "Ingest data sources"]],
      ["Configure Protections and Detections", 21, ["Defender for Endpoint protections", "Detections in Defender XDR", "Analytics rules in Sentinel"]],
      ["Manage Incident Response", 32, ["Respond to Defender XDR alerts and incidents", "Investigate with Defender for Endpoint", "Investigate in Sentinel", "Automated response and playbooks"]],
      ["Manage Security Threats", 21, ["Threat hunting with KQL", "Threat analytics", "Workbooks and visualizations"]],
    ]),
  },
  {
    id: "sc300",
    vendor: "Microsoft",
    code: "SC-300",
    name: "Microsoft Identity and Access Administrator",
    format: { questions: 50, minutes: 100, note: "Weights are the midpoints of Microsoft's published ranges." },
    officialPassing: "700 out of 1000",
    objectivesUrl: "https://learn.microsoft.com/credentials/certifications/identity-and-access-administrator/",
    domains: weighted("sc300", [
      ["Implement and Manage User Identities", 24, ["Configure Entra tenant", "Users, groups and licenses", "External identities", "Hybrid identity"]],
      ["Implement Authentication and Access Management", 29, ["Authentication methods and MFA", "Conditional Access", "Identity Protection", "Global Secure Access"]],
      ["Plan and Implement Workload Identities", 24, ["Managed identities and service principals", "App registrations", "Enterprise apps and SSO"]],
      ["Plan and Automate Identity Governance", 23, ["Entitlement management", "Access reviews", "Privileged Identity Management", "Monitoring and reporting"]],
    ]),
  },
  {
    id: "sc100",
    vendor: "Microsoft",
    code: "SC-100",
    name: "Microsoft Cybersecurity Architect",
    format: { questions: 50, minutes: 120, note: "Weights are the midpoints of Microsoft's published ranges." },
    officialPassing: "700 out of 1000",
    objectivesUrl: "https://learn.microsoft.com/credentials/certifications/cybersecurity-architect-expert/",
    domains: weighted("sc100", [
      ["Design Solutions That Align with Security Best Practices", 22, ["Zero Trust and MCRA", "Microsoft cloud security benchmark", "Ransomware resiliency"]],
      ["Design Security Operations, Identity, and Compliance", 28, ["Security operations design", "Identity and access design", "Regulatory compliance design"]],
      ["Design Security Solutions for Infrastructure", 28, ["Security posture management", "Endpoint and server security", "SaaS, PaaS and IaaS security"]],
      ["Design Security Solutions for Applications and Data", 22, ["Application security", "Data security", "AI security"]],
    ]),
  },
  {
    id: "az500",
    vendor: "Microsoft",
    code: "AZ-500",
    name: "Microsoft Azure Security Engineer",
    format: { questions: 50, minutes: 100, note: "Weights are the midpoints of Microsoft's published ranges." },
    officialPassing: "700 out of 1000",
    objectivesUrl: "https://learn.microsoft.com/credentials/certifications/azure-security-engineer/",
    domains: weighted("az500", [
      ["Secure Identity and Access", 18, ["Azure RBAC", "Entra ID security", "Application access"]],
      ["Secure Networking", 24, ["Virtual network security", "Private access to Azure resources", "Public access: firewall, WAF, DDoS"]],
      ["Secure Compute, Storage, and Databases", 24, ["Advanced security for compute", "Storage security", "Azure SQL security"]],
      ["Secure Azure with Defender for Cloud and Sentinel", 34, ["Governance and Azure Policy", "Key Vault", "Defender for Cloud posture and workload protection", "Microsoft Sentinel monitoring"]],
    ]),
  },

  // ------------------------------------------------------------ AWS
  {
    id: "awsscs",
    vendor: "AWS",
    code: "SCS-C03",
    name: "AWS Certified Security - Specialty",
    format: { questions: 65, minutes: 170 },
    officialPassing: "750 out of 1000",
    objectivesUrl: "https://docs.aws.amazon.com/aws-certification/latest/examguides/security-specialty-03.html",
    domains: weighted("awsscs", [
      ["Detection", 16, ["Monitoring and alerting with CloudWatch, GuardDuty and Security Hub", "Logging solutions: CloudTrail, VPC Flow Logs", "Troubleshooting monitoring and logging"]],
      ["Incident Response", 14, ["Incident response plans", "Responding to compromised resources", "Forensic capture and analysis"]],
      ["Infrastructure Security", 18, ["Edge services: WAF, Shield, CloudFront", "Network security: VPC, security groups, NACLs", "Compute workload security"]],
      ["Identity and Access Management", 20, ["Authentication for AWS resources", "IAM policies and permission boundaries", "Federation and IAM Identity Center"]],
      ["Data Protection", 18, ["Data in transit", "Data at rest and KMS", "Secrets management and data lifecycle"]],
      ["Security Foundations and Governance", 14, ["Multi-account strategy and Organizations", "Secure deployment and configuration", "Compliance evaluation"]],
    ]),
  },

  // ------------------------------------------------------------ Google Cloud
  {
    id: "gcpse",
    vendor: "Google Cloud",
    code: "PCSE",
    name: "Google Cloud Professional Cloud Security Engineer",
    format: { questions: 55, minutes: 120 },
    officialPassing: "Not published",
    objectivesUrl: "https://cloud.google.com/learn/certification/cloud-security-engineer",
    domains: weighted("gcpse", [
      ["Configuring Access", 27, ["Cloud Identity and workforce identity", "Service accounts and workload identity", "IAM roles, policies and organization constraints"]],
      ["Securing Communications and Boundary Protection", 21, ["Perimeter security: Cloud Armor, load balancers", "VPC boundary segmentation and firewalls", "Private connectivity and VPC Service Controls"]],
      ["Ensuring Data Protection", 20, ["Sensitive data protection (DLP)", "Encryption at rest and in transit, Cloud KMS", "Securing AI workloads"]],
      ["Managing Operations", 22, ["Infrastructure and application security", "Security Command Center", "Logging, monitoring and incident response"]],
      ["Supporting Compliance Requirements", 10, ["Regulatory compliance", "Assured Workloads", "Shared responsibility"]],
    ]),
  },

  // ------------------------------------------------------------ CSA
  {
    id: "ccsk",
    vendor: "CSA",
    code: "CCSK v5",
    name: "CSA Certificate of Cloud Security Knowledge",
    format: { questions: 60, minutes: 120, note: NO_WEIGHTS },
    officialPassing: "80%",
    objectivesUrl: "https://cloudsecurityalliance.org/education/ccsk",
    domains: equal("ccsk", [
      ["Cloud Computing Concepts and Architectures", ["Cloud models and characteristics", "Shared responsibility"]],
      ["Cloud Governance", ["Governance hierarchy", "Policies and frameworks"]],
      ["Risk, Audit and Compliance", ["Cloud risk management", "Compliance inheritance", "Audit"]],
      ["Organization Management", ["Multi-account and organization hierarchy", "Landing zones"]],
      ["Identity and Access Management", ["Federation", "Least privilege in cloud"]],
      ["Security Monitoring", ["Cloud telemetry", "Detection in cloud"]],
      ["Infrastructure and Networking", ["Cloud network security", "Infrastructure as code"]],
      ["Cloud Workload Security", ["VMs, containers and serverless", "Image and workload hardening"]],
      ["Application Security", ["Secure SDLC in cloud", "DevSecOps"]],
      ["Data Security", ["Encryption and key management", "Data classification"]],
      ["Incident Response and Resilience", ["Cloud incident response", "Resilience design"]],
      ["Related Technologies and Strategies", ["Zero trust", "AI and emerging technologies"]],
    ]),
  },

  // ------------------------------------------------------------ Linux Foundation
  {
    id: "kcsa",
    vendor: "Linux Foundation",
    code: "KCSA",
    name: "Kubernetes and Cloud Native Security Associate",
    format: { questions: 60, minutes: 90 },
    officialPassing: "75%",
    objectivesUrl: "https://training.linuxfoundation.org/certification/kubernetes-and-cloud-native-security-associate-kcsa/",
    domains: weighted("kcsa", [
      ["Overview of Cloud Native Security", 14, ["The 4Cs of cloud native security", "Cloud provider and infrastructure security", "Isolation techniques"]],
      ["Kubernetes Cluster Component Security", 22, ["API server, etcd and kubelet", "Container runtime", "Networking and storage"]],
      ["Kubernetes Security Fundamentals", 22, ["Pod Security Standards and admission", "Authentication and authorization (RBAC)", "Secrets", "Network policies", "Audit logging"]],
      ["Kubernetes Threat Model", 16, ["Trust boundaries and data flow", "Persistence and privilege escalation", "Denial of service and malicious code"]],
      ["Platform Security", 16, ["Supply chain security", "Image repository security", "Service mesh and PKI", "Observability"]],
      ["Compliance and Security Frameworks", 10, ["Compliance frameworks", "Threat modeling frameworks", "Automation and tooling"]],
    ]),
  },
  {
    id: "cks",
    vendor: "Linux Foundation",
    code: "CKS",
    name: "Certified Kubernetes Security Specialist",
    format: { questions: 60, minutes: 120, note: PRACTICAL("a 2-hour performance-based exam on live clusters") },
    officialPassing: "67%",
    objectivesUrl: "https://training.linuxfoundation.org/certification/certified-kubernetes-security-specialist/",
    domains: weighted("cks", [
      ["Cluster Setup", 15, ["Network policies", "CIS benchmark", "Ingress TLS", "Protecting node metadata"]],
      ["Cluster Hardening", 15, ["RBAC", "Service account security", "API server access", "Upgrading Kubernetes"]],
      ["System Hardening", 10, ["Host OS footprint", "IAM roles", "Network access", "AppArmor and seccomp"]],
      ["Minimize Microservice Vulnerabilities", 20, ["Pod Security Standards", "Secrets management", "Sandboxed runtimes", "Pod-to-pod encryption"]],
      ["Supply Chain Security", 20, ["Base image footprint", "SBOM and image signing", "Allowed registries", "Static analysis of workloads"]],
      ["Monitoring, Logging and Runtime Security", 20, ["Behavioural analytics (Falco)", "Detecting threats", "Container immutability", "Audit logs"]],
    ]),
  },
];

/** All exams in the Cybersecurity section, grouped by awarding body in VENDORS order. */
export function examsByVendor(): { vendor: Vendor; exams: Exam[] }[] {
  return VENDORS.map((vendor) => ({ vendor, exams: EXAMS.filter((e) => e.vendor === vendor.name) })).filter((g) => g.exams.length > 0);
}

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
