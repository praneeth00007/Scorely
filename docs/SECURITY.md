# Security Policy

**Scorely** is a privacy-first confidential credit scoring engine built on iExec's Trusted Execution Environments (TEEs). Security and data confidentiality are core to our mission — we treat every potential vulnerability with the highest priority.

## Supported Versions

We currently support the following versions with security updates:

| Version | Branch    | Supported | Security Fixes | Notes                  |
|---------|-----------|-----------|----------------|------------------------|
| v0.1.x  | main      | ✅ Yes     | Yes            | Hackathon MVP / Testnet |
| < v0.1  | —         | ❌ No      | No             | Pre-MVP prototypes     |

Security patches will be backported to supported versions where feasible. We plan to adopt semantic versioning (SemVer) more formally post-hackathon.

## Reporting a Vulnerability

**We take security reports very seriously**, especially those involving:
- Potential data leakage (browser-side, enclave egress, encryption flaws)
- TEE side-channel or attestation bypass
- Wallet / signature / authentication issues
- Supply-chain attacks (dependencies, Docker/SCONE images)
- Denial-of-service in compute tasks

**⛔ DO NOT** report security vulnerabilities via public GitHub issues, discussions, or pull requests — doing so could expose users before a fix is available.

### Preferred Reporting Channels
- **Email**: praneethkothagundhu@gmail.com

- **Alternative (preferred for detailed reports)**: If you prefer, use GitHub's **Private vulnerability reporting** feature .


Please include in your report:
- Clear description of the vulnerability
- Steps to reproduce (with testnet/Bellecour if possible)
- Impact assessment (e.g., "could leak user salary/debt data")
- Suggested fix or mitigation (if you have one)
- Any proof-of-concept code (do **not** include real user data)

### Our Response Timeline (Best Effort)
- **Acknowledgment**: Within 24–48 hours (usually faster)
- **Initial Triage & Severity Assessment**: Within 72 hours
- **Regular Updates**: At least every 5–7 days during investigation
- **Patch Release Target**:
  - Critical (data leak, remote code exec): 7 days or less
  - High: 14–30 days
  - Medium/Low: Next release cycle

We follow **responsible disclosure** principles: We ask that you give us reasonable time to validate, develop, and deploy a fix before public disclosure. We'll credit you (unless you prefer anonymity) in our release notes, blog post, or Hall of Fame section (once we have one).

## Scope

**In scope**:
- Code in this repository (frontend, TEE app logic, smart contract interactions if any)
- iExec Bellecour testnet deployments
- Client-side encryption flows (@iexec/dataprotector)
- Deterministic scoring engine inside SCONE enclaves

**Out of scope** (for now):
- Underlying iExec infrastructure / Intel SGX hardware vulnerabilities
- Phishing / social engineering attacks
- Denial-of-service against public RPC endpoints
- Issues in third-party dependencies (report upstream)

## Severity Guidelines (Informal)

We use a rough CVSS-like scale:

| Severity   | Description                                      | Example Impact                              | Target Fix Time |
|------------|--------------------------------------------------|---------------------------------------------|-----------------|
| Critical   | Active data exfiltration, enclave compromise    | User financial data leaked                  | <7 days         |
| High       | Potential leak under specific conditions         | Side-channel possible with effort           | <30 days        |
| Medium     | Denial-of-service, logic flaw without leak       | Scoring task fails repeatedly               | Next release    |
| Low        | Best-practice improvements, minor issues         | Verbose logging (no PII)                    | As time allows  |

## Acknowledgments

We greatly appreciate security researchers who help make Scorely safer.  
Future plans include:
- A public Hall of Fame page
- Bug bounty program (post-mainnet)
- Integration with platforms like Immunefi or HackerOne (for Web3 security)

Thank you for helping protect user privacy in decentralized finance!

Last updated: January 2026