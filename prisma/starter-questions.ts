/**
 * Starter question bank, written for CertPilot. Used so practice and simulation work before any
 * generated questions exist. Every option has an explanation.
 */

export type SeedQuestion = {
  examId: string;
  domainId: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  stem: string;
  options: Record<"A" | "B" | "C" | "D", string>;
  answer: "A" | "B" | "C" | "D";
  explanations: Record<"A" | "B" | "C" | "D", string>;
};

export const STARTER_QUESTIONS: SeedQuestion[] = [
  // ---------------------------------------------------------------- Security+ 1: General Security Concepts
  {
    examId: "secplus", domainId: "secplus-1", topic: "Security control categories and types", difficulty: "easy",
    stem: "A company puts up signs at its entrances stating that the premises are under 24-hour video surveillance. Which type of control are the signs?",
    options: { A: "Preventive", B: "Deterrent", C: "Detective", D: "Corrective" },
    answer: "B",
    explanations: {
      A: "Preventive controls physically or technically stop an action, like a locked door. A sign stops nobody.",
      B: "Correct. The sign discourages wrongdoing by making people think twice; it does not stop, detect or fix anything itself.",
      C: "The cameras would be detective controls because they record events. The signs only warn.",
      D: "Corrective controls fix or reduce damage after an incident, such as restoring from backup.",
    },
  },
  {
    examId: "secplus", domainId: "secplus-1", topic: "Cryptography, PKI, hashing and certificates", difficulty: "medium",
    stem: "A manager wants recipients to be able to prove that an email really came from her and that she cannot later deny sending it. What should she do?",
    options: { A: "Encrypt the email with the recipient's public key", B: "Include a SHA-256 hash of the message", C: "Digitally sign the email with her private key", D: "Send the email only over a TLS connection" },
    answer: "C",
    explanations: {
      A: "This gives confidentiality: only the recipient can read it. It says nothing about who sent it.",
      B: "A bare hash shows the message was not altered, but anyone can compute a hash, so it does not prove the sender.",
      C: "Correct. Only she holds her private key, so a valid signature proves origin and integrity, giving non-repudiation.",
      D: "TLS protects the message in transit between servers. It does not bind the message to the sender.",
    },
  },
  {
    examId: "secplus", domainId: "secplus-1", topic: "Zero trust and physical security", difficulty: "medium",
    stem: "In a zero trust architecture, which component evaluates policy and decides whether a subject is granted access to a resource?",
    options: { A: "Policy enforcement point", B: "Policy engine", C: "Implicit trust zone", D: "The subject's endpoint" },
    answer: "B",
    explanations: {
      A: "The enforcement point carries out the decision (allows or blocks the connection) but does not make it.",
      B: "Correct. The policy engine makes the access decision; the policy administrator relays it and the enforcement point applies it.",
      C: "Zero trust aims to remove implicit trust zones; they are not decision makers.",
      D: "The subject requests access; it never decides its own access.",
    },
  },
  {
    examId: "secplus", domainId: "secplus-1", topic: "Deception and disruption technology", difficulty: "easy",
    stem: "A security team sets up a fake database server, full of fabricated records, that no legitimate user should ever touch, so that any connection to it reveals an attacker. What is this?",
    options: { A: "Honeypot", B: "Honeytoken", C: "DNS sinkhole", D: "Jump server" },
    answer: "A",
    explanations: {
      A: "Correct. A honeypot is a decoy system; any interaction with it is suspicious by definition.",
      B: "A honeytoken is a single piece of fake data (such as a fake credential or record), not a whole server.",
      C: "A sinkhole redirects malicious domain lookups to a controlled address; it is not a decoy server.",
      D: "A jump server is a hardened host used to administer other systems.",
    },
  },
  {
    examId: "secplus", domainId: "secplus-1", topic: "Change management", difficulty: "easy",
    stem: "Before an emergency patch is applied to a production server, which item is most important to have documented as part of change management?",
    options: { A: "A backout plan", B: "Removal of the server from the asset inventory", C: "Disabling logging during the change", D: "Approval to skip testing permanently" },
    answer: "A",
    explanations: {
      A: "Correct. A backout plan lets the team restore service quickly if the patch causes problems.",
      B: "The server still exists and must stay in the inventory.",
      C: "Logging should stay on; changes are exactly what you want recorded.",
      D: "Emergency changes may shorten testing, but they are reviewed afterwards; testing is not skipped permanently.",
    },
  },
  // ---------------------------------------------------------------- Security+ 2: Threats, Vulnerabilities, and Mitigations
  {
    examId: "secplus", domainId: "secplus-2", topic: "Threat vectors, social engineering and attack surfaces", difficulty: "easy",
    stem: "Employees receive text messages that appear to come from the company's bank, asking them to tap a link to verify their account. What kind of attack is this?",
    options: { A: "Vishing", B: "Smishing", C: "Whaling", D: "Pharming" },
    answer: "B",
    explanations: {
      A: "Vishing is phishing over voice calls.",
      B: "Correct. Smishing is phishing delivered by SMS text message.",
      C: "Whaling targets senior executives specifically; the channel here is what defines the attack.",
      D: "Pharming redirects users to a fake site by tampering with name resolution, without needing a message.",
    },
  },
  {
    examId: "secplus", domainId: "secplus-2", topic: "Threat vectors, social engineering and attack surfaces", difficulty: "medium",
    stem: "Users who type the correct bank URL are still taken to a convincing fake site. Investigation finds the hosts file on their computers was modified. What attack is this?",
    options: { A: "Typosquatting", B: "Pharming", C: "Watering hole", D: "Credential stuffing" },
    answer: "B",
    explanations: {
      A: "Typosquatting relies on users mistyping a domain; here they typed it correctly.",
      B: "Correct. Pharming redirects traffic by poisoning name resolution, such as a modified hosts file or DNS.",
      C: "A watering hole compromises a site the victims already visit, rather than redirecting them.",
      D: "Credential stuffing reuses leaked username/password pairs against other services.",
    },
  },
  {
    examId: "secplus", domainId: "secplus-2", topic: "Indicators of malware, network, application and password attacks", difficulty: "medium",
    stem: "Authentication logs show login attempts against thousands of different accounts, each trying the same password once. Which attack is most likely?",
    options: { A: "Brute force", B: "Password spraying", C: "Dictionary attack", D: "Rainbow table attack" },
    answer: "B",
    explanations: {
      A: "Brute force tries many passwords against one account until one works.",
      B: "Correct. Spraying tries one common password across many accounts, staying under per-account lockout limits.",
      C: "A dictionary attack runs a word list against an account, many passwords per account.",
      D: "Rainbow tables crack stolen password hashes offline; they do not generate online login attempts.",
    },
  },
  {
    examId: "secplus", domainId: "secplus-2", topic: "Mitigation techniques: segmentation, least privilege, patching, hardening", difficulty: "easy",
    stem: "Developers discover that a custom application crashes when given overly long input in a form field. Which mitigation best addresses the underlying weakness?",
    options: { A: "Input validation and bounds checking", B: "Stronger password complexity rules", C: "Blocking ICMP at the firewall", D: "Deploying a honeypot" },
    answer: "A",
    explanations: {
      A: "Correct. Crashing on long input points to a buffer overflow; validating input length and checking bounds fixes the cause.",
      B: "Password rules do not affect how the application handles input.",
      C: "ICMP filtering does not stop malicious form input.",
      D: "A honeypot can detect attackers but does not fix the application.",
    },
  },
  {
    examId: "secplus", domainId: "secplus-2", topic: "Indicators of malware, network, application and password attacks", difficulty: "easy",
    stem: "Which observation most strongly indicates a ransomware infection?",
    options: { A: "Many files renamed with an unfamiliar extension and a text file demanding payment", B: "A spike in DNS lookups for a popular content delivery network", C: "An expired TLS certificate on the intranet", D: "A user locked out after several failed logins" },
    answer: "A",
    explanations: {
      A: "Correct. Mass encryption that renames files, plus a ransom note, is the classic ransomware signature.",
      B: "Heavy CDN lookups are usually normal web traffic.",
      C: "An expired certificate is a maintenance problem, not malware.",
      D: "Account lockouts point to forgotten passwords or a password attack.",
    },
  },
  // ---------------------------------------------------------------- Security+ 3: Security Architecture
  {
    examId: "secplus", domainId: "secplus-3", topic: "Cloud, IaC, serverless, microservices, ICS/SCADA and IoT architecture", difficulty: "medium",
    stem: "Under the shared responsibility model, which task belongs to the customer when using Infrastructure as a Service (IaaS)?",
    options: { A: "Physical security of the data centre", B: "Patching the hypervisor", C: "Patching the guest operating system", D: "Replacing failed storage hardware" },
    answer: "C",
    explanations: {
      A: "The provider always secures its facilities.",
      B: "The hypervisor is the provider's infrastructure.",
      C: "Correct. In IaaS the customer manages everything from the guest OS upward, including its patches.",
      D: "Physical hardware is the provider's responsibility.",
    },
  },
  {
    examId: "secplus", domainId: "secplus-3", topic: "Data types, classification, states and protection methods", difficulty: "easy",
    stem: "Customer data is encrypted with TLS while it travels between a web browser and the company's server. Which data state does this protect?",
    options: { A: "Data at rest", B: "Data in transit", C: "Data in use", D: "Archived data" },
    answer: "B",
    explanations: {
      A: "Data at rest is stored data, protected by disk or database encryption.",
      B: "Correct. TLS protects data while it moves across a network.",
      C: "Data in use is being processed in memory; TLS does not protect it there.",
      D: "Archives are a form of data at rest.",
    },
  },
  {
    examId: "secplus", domainId: "secplus-3", topic: "Resilience: high availability, backups, site recovery, power", difficulty: "medium",
    stem: "Which backup type copies every file changed since the last full backup, and does not reset the archive bit?",
    options: { A: "Full", B: "Incremental", C: "Differential", D: "Snapshot" },
    answer: "C",
    explanations: {
      A: "A full backup copies everything and resets the archive bit.",
      B: "Incremental copies changes since the last backup of any kind and resets the bit.",
      C: "Correct. A differential grows each day until the next full backup, and restores need only the full plus the latest differential.",
      D: "A snapshot captures a point-in-time state of a volume or VM; the archive bit is not involved.",
    },
  },
  {
    examId: "secplus", domainId: "secplus-3", topic: "Resilience: high availability, backups, site recovery, power", difficulty: "easy",
    stem: "A bank needs a recovery site that can take over within minutes of an outage, with data already replicated in near real time. Which option fits?",
    options: { A: "Cold site", B: "Warm site", C: "Hot site", D: "Off-site tape vault" },
    answer: "C",
    explanations: {
      A: "A cold site has space and power but no ready systems; recovery takes days or weeks.",
      B: "A warm site has some equipment but needs data restored and configuration; recovery takes hours to days.",
      C: "Correct. A hot site is fully equipped with current data and can take over almost immediately.",
      D: "Tapes in a vault preserve data but provide no systems to run on.",
    },
  },
  {
    examId: "secplus", domainId: "secplus-3", topic: "Secure infrastructure: firewalls, IDS/IPS, VPN, NAC, SD-WAN, SASE", difficulty: "easy",
    stem: "Which device sits inline on the network and can block a detected attack in real time?",
    options: { A: "Intrusion detection system (IDS)", B: "Intrusion prevention system (IPS)", C: "SIEM", D: "Network tap" },
    answer: "B",
    explanations: {
      A: "An IDS usually monitors a copy of the traffic and alerts; it does not block.",
      B: "Correct. An IPS is inline, so it can drop malicious traffic as it passes.",
      C: "A SIEM collects and correlates logs; it does not sit in the traffic path.",
      D: "A tap copies traffic for monitoring and never blocks it.",
    },
  },
  // ---------------------------------------------------------------- Security+ 4: Security Operations
  {
    examId: "secplus", domainId: "secplus-4", topic: "Email security: SPF, DKIM, DMARC; DNS and web filtering", difficulty: "medium",
    stem: "Which DNS record lets a domain owner publish the list of mail servers that are allowed to send email on behalf of the domain?",
    options: { A: "DKIM", B: "DMARC", C: "SPF", D: "MX" },
    answer: "C",
    explanations: {
      A: "DKIM publishes a public key used to verify signatures on messages, not a list of servers.",
      B: "DMARC tells receivers what to do when SPF or DKIM checks fail, and where to send reports.",
      C: "Correct. SPF lists the hosts authorized to send mail for the domain.",
      D: "MX records name the servers that receive mail for the domain.",
    },
  },
  {
    examId: "secplus", domainId: "secplus-4", topic: "Monitoring, SIEM, DLP and alerting", difficulty: "easy",
    stem: "An analyst needs one system that collects logs from firewalls, servers and endpoints, correlates events across them, and raises alerts. What should be deployed?",
    options: { A: "DLP", B: "SIEM", C: "NAC", D: "WAF" },
    answer: "B",
    explanations: {
      A: "DLP watches for sensitive data leaving the organization.",
      B: "Correct. Centralized log collection, correlation and alerting is exactly what a SIEM does.",
      C: "NAC decides which devices may join the network.",
      D: "A WAF filters traffic to web applications.",
    },
  },
  {
    examId: "secplus", domainId: "secplus-4", topic: "Identity and access management, MFA, SSO, privileged access", difficulty: "easy",
    stem: "Which combination is true multifactor authentication?",
    options: { A: "A password and answers to security questions", B: "A PIN and a password", C: "A password and a code from an authenticator app", D: "Two different passwords" },
    answer: "C",
    explanations: {
      A: "Both are something you know: one factor used twice.",
      B: "Both are something you know.",
      C: "Correct. Something you know (password) plus something you have (the device generating the code).",
      D: "Still only something you know.",
    },
  },
  {
    examId: "secplus", domainId: "secplus-4", topic: "Incident response and investigation data sources", difficulty: "medium",
    stem: "An infected workstation has been isolated from the network. In the incident response process, which phase comes next?",
    options: { A: "Detection", B: "Eradication", C: "Lessons learned", D: "Preparation" },
    answer: "B",
    explanations: {
      A: "Detection happened earlier, when the incident was identified.",
      B: "Correct. After containment, the team removes the cause (eradication), then recovers systems.",
      C: "Lessons learned is the final phase, after recovery.",
      D: "Preparation comes before any incident occurs.",
    },
  },
  {
    examId: "secplus", domainId: "secplus-4", topic: "Vulnerability management and scanning", difficulty: "easy",
    stem: "A vulnerability scan reports a missing patch on a server, but manual checking confirms the patch is installed. How should this finding be classified?",
    options: { A: "True positive", B: "False positive", C: "False negative", D: "True negative" },
    answer: "B",
    explanations: {
      A: "A true positive is a real vulnerability that was correctly reported.",
      B: "Correct. The scanner reported a problem that does not exist.",
      C: "A false negative is a real problem the scanner missed.",
      D: "A true negative is a correct report of no problem.",
    },
  },
  // ---------------------------------------------------------------- Security+ 5: Security Program Management and Oversight
  {
    examId: "secplus", domainId: "secplus-5", topic: "Risk management: SLE, ALE, ARO, BIA, risk register", difficulty: "medium",
    stem: "A server is valued at $100,000. A flood would destroy 25% of its value, and a flood is expected once every two years. What is the annualized loss expectancy (ALE)?",
    options: { A: "$25,000", B: "$12,500", C: "$50,000", D: "$6,250" },
    answer: "B",
    explanations: {
      A: "$25,000 is the single loss expectancy (SLE = $100,000 x 25%), not the annual figure.",
      B: "Correct. SLE = $25,000; ARO = 0.5 (once every two years); ALE = SLE x ARO = $12,500.",
      C: "This would require an ARO of 2 (twice a year).",
      D: "This halves the correct answer, as if the ARO were 0.25.",
    },
  },
  {
    examId: "secplus", domainId: "secplus-5", topic: "Risk management: SLE, ALE, ARO, BIA, risk register", difficulty: "easy",
    stem: "A company buys a cyber insurance policy to cover losses from data breaches. Which risk response is this?",
    options: { A: "Avoidance", B: "Acceptance", C: "Transference", D: "Mitigation" },
    answer: "C",
    explanations: {
      A: "Avoidance means stopping the risky activity entirely.",
      B: "Acceptance means taking no action and bearing the loss.",
      C: "Correct. Insurance transfers the financial impact to a third party.",
      D: "Mitigation reduces likelihood or impact with controls.",
    },
  },
  {
    examId: "secplus", domainId: "secplus-5", topic: "Audits, assessments and penetration testing", difficulty: "easy",
    stem: "Penetration testers are given network diagrams, credentials and application source code before the test. Which kind of test is this?",
    options: { A: "Unknown environment", B: "Known environment", C: "Partially known environment", D: "Bug bounty" },
    answer: "B",
    explanations: {
      A: "In an unknown-environment (black box) test the testers start with no inside information.",
      B: "Correct. Full information means a known-environment (white box) test.",
      C: "Partially known (grey box) testers get only some information.",
      D: "Bug bounty participants usually work from public information only.",
    },
  },
  {
    examId: "secplus", domainId: "secplus-5", topic: "Governance: policies, standards, procedures", difficulty: "easy",
    stem: "Which document gives step-by-step instructions for carrying out a task, such as setting up accounts for a new employee?",
    options: { A: "Policy", B: "Guideline", C: "Procedure", D: "Standard" },
    answer: "C",
    explanations: {
      A: "A policy states high-level intent and rules, not the steps.",
      B: "A guideline is recommended practice and is optional.",
      C: "Correct. Procedures are detailed, step-by-step instructions.",
      D: "A standard sets mandatory specifics (for example, which encryption algorithm), not task steps.",
    },
  },
  {
    examId: "secplus", domainId: "secplus-5", topic: "Risk management: SLE, ALE, ARO, BIA, risk register", difficulty: "medium",
    stem: "During a business impact analysis, which metric states the maximum time a system can be down before the outage becomes unacceptable?",
    options: { A: "Recovery point objective (RPO)", B: "Recovery time objective (RTO)", C: "Mean time between failures (MTBF)", D: "Mean time to repair (MTTR)" },
    answer: "B",
    explanations: {
      A: "RPO is the maximum acceptable data loss, measured back in time from the outage.",
      B: "Correct. RTO is the target time to restore the system.",
      C: "MTBF measures reliability: average time between failures.",
      D: "MTTR is the average time actually taken to repair, not the maximum acceptable.",
    },
  },
  // ---------------------------------------------------------------- ISC2 CC
  {
    examId: "isc2cc", domainId: "isc2cc-1", topic: "CIA triad and authentication", difficulty: "easy",
    stem: "A file's hash is recorded when it is stored and compared again later. Which security property does this check?",
    options: { A: "Confidentiality", B: "Integrity", C: "Availability", D: "Authorization" },
    answer: "B",
    explanations: {
      A: "Hashing does not hide content; anyone can still read the file.",
      B: "Correct. A matching hash shows the file has not been altered.",
      C: "Availability is about access when needed, not unchanged content.",
      D: "Authorization is about what a user is allowed to do.",
    },
  },
  {
    examId: "isc2cc", domainId: "isc2cc-1", topic: "ISC2 Code of Ethics", difficulty: "easy",
    stem: "Which of these is the first canon of the ISC2 Code of Ethics?",
    options: { A: "Provide diligent and competent service to principals", B: "Protect society, the common good, necessary public trust and confidence, and the infrastructure", C: "Advance and protect the profession", D: "Act honorably, honestly, justly, responsibly, and legally" },
    answer: "B",
    explanations: {
      A: "This is the third canon.",
      B: "Correct. Protecting society comes first and takes priority when canons conflict.",
      C: "This is the fourth canon.",
      D: "This is the second canon.",
    },
  },
  {
    examId: "isc2cc", domainId: "isc2cc-2", topic: "Business continuity", difficulty: "easy",
    stem: "Which plan focuses on keeping critical business functions running during a disruption?",
    options: { A: "Business continuity plan", B: "Incident response plan", C: "Acceptable use policy", D: "Change management plan" },
    answer: "A",
    explanations: {
      A: "Correct. A BCP keeps essential operations going while a disruption is under way.",
      B: "An incident response plan handles security incidents specifically.",
      C: "An acceptable use policy defines how users may use systems.",
      D: "Change management controls planned changes to systems.",
    },
  },
  {
    examId: "isc2cc", domainId: "isc2cc-2", topic: "Disaster recovery", difficulty: "easy",
    stem: "A fire breaks out in a company's server room. What is the first priority?",
    options: { A: "Shut down the servers gracefully", B: "Preserve evidence for an investigation", C: "Ensure the safety of people", D: "Notify customers of the outage" },
    answer: "C",
    explanations: {
      A: "Equipment can be replaced; it never comes before human life.",
      B: "Evidence matters only after everyone is safe.",
      C: "Correct. Human safety is always the first priority in any emergency.",
      D: "Communication comes later in the response.",
    },
  },
  {
    examId: "isc2cc", domainId: "isc2cc-3", topic: "Logical access controls: DAC, MAC, RBAC", difficulty: "medium",
    stem: "In which access control model does the owner of a file decide who else can read or change it?",
    options: { A: "Mandatory access control (MAC)", B: "Discretionary access control (DAC)", C: "Role-based access control (RBAC)", D: "Rule-based access control" },
    answer: "B",
    explanations: {
      A: "In MAC the system enforces labels and clearances; owners cannot change access.",
      B: "Correct. DAC leaves access decisions to the owner's discretion.",
      C: "RBAC grants access by job role, set by administrators.",
      D: "Rule-based control applies system-wide rules, such as firewall rules or time-of-day limits.",
    },
  },
  {
    examId: "isc2cc", domainId: "isc2cc-3", topic: "Least privilege and segregation of duties", difficulty: "medium",
    stem: "A company makes sure the employee who approves payments cannot also add new vendors to the payment system. Which principle is this?",
    options: { A: "Least privilege", B: "Separation of duties", C: "Defense in depth", D: "Need to know" },
    answer: "B",
    explanations: {
      A: "Least privilege limits each person to the access their job needs, but does not split a process between people.",
      B: "Correct. Splitting a sensitive process means no single person can commit and hide fraud alone.",
      C: "Defense in depth is layering multiple controls.",
      D: "Need to know limits access to specific information.",
    },
  },
  {
    examId: "isc2cc", domainId: "isc2cc-4", topic: "Networking concepts: OSI, TCP/IP, ports", difficulty: "easy",
    stem: "Which TCP port does HTTPS use by default?",
    options: { A: "80", B: "22", C: "443", D: "3389" },
    answer: "C",
    explanations: {
      A: "Port 80 is unencrypted HTTP.",
      B: "Port 22 is SSH.",
      C: "Correct. HTTPS uses TCP 443.",
      D: "Port 3389 is Remote Desktop Protocol.",
    },
  },
  {
    examId: "isc2cc", domainId: "isc2cc-4", topic: "Networking concepts: OSI, TCP/IP, ports", difficulty: "easy",
    stem: "At which OSI layer do routers forward traffic based on IP addresses?",
    options: { A: "Layer 2, Data Link", B: "Layer 3, Network", C: "Layer 4, Transport", D: "Layer 7, Application" },
    answer: "B",
    explanations: {
      A: "Switches forward frames by MAC address at layer 2.",
      B: "Correct. Routing on IP addresses happens at the network layer.",
      C: "Layer 4 handles ports and end-to-end delivery (TCP/UDP).",
      D: "Layer 7 is where applications such as HTTP work.",
    },
  },
  {
    examId: "isc2cc", domainId: "isc2cc-5", topic: "Data security, encryption, hashing", difficulty: "medium",
    stem: "Why is a random salt added to each password before it is hashed?",
    options: { A: "To make the hash reversible for password recovery", B: "So identical passwords produce different hashes, defeating precomputed tables", C: "To encrypt the password with a secret key", D: "To shorten the stored hash" },
    answer: "B",
    explanations: {
      A: "Hashes are one-way by design; salting does not make them reversible.",
      B: "Correct. A unique salt means two users with the same password get different hashes, and rainbow tables become useless.",
      C: "A salt is not secret and is not an encryption key.",
      D: "Salting does not change the hash length.",
    },
  },
  {
    examId: "isc2cc", domainId: "isc2cc-5", topic: "Data security, encryption, hashing", difficulty: "easy",
    stem: "Old hard drives that held confidential data are being thrown away. Which method most reliably prevents the data from ever being recovered?",
    options: { A: "Deleting the files and emptying the recycle bin", B: "Quick-formatting the drives", C: "Physically destroying the drives, such as shredding", D: "Removing the drive labels" },
    answer: "C",
    explanations: {
      A: "Deleted files usually remain on disk and can be recovered with forensic tools.",
      B: "A quick format leaves the data in place.",
      C: "Correct. Physical destruction is the most reliable way to make data unrecoverable before disposal.",
      D: "Labels do not affect the data stored on the drive.",
    },
  },
];
