# Contributing to Scorely

Thank you for considering contributing to **Scorely**! 🎉  
We’re building a **privacy-first confidential credit scoring engine** on iExec, and every contribution helps make decentralized, sovereign credit assessment a reality.

Whether you're fixing a bug, improving docs, adding a feature, or suggesting better privacy practices — your help is welcome.

## Code of Conduct

We follow the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).  
Please be kind, respectful, and mindful that this project deals with sensitive financial data and user privacy.

## Ways to Contribute

- Reporting bugs or privacy/security concerns  
- Suggesting new features or use cases  
- Improving documentation  
- Writing or improving tests  
- Fixing typos or UX issues in the frontend  
- Refactoring code for better readability/privacy  
- Adding support for new scoring factors (with determinism in mind)

## Development Setup

### 1. Prerequisites
- Node.js ≥ 18  
- npm ≥ 9  
- Git  
- MetaMask or OKX or another Web3 wallet (for local testing)

### 2. Fork & Clone
```bash
git clone https://github.com/praneeth00007/Scorely.git
cd Scorely
```

### 3. Install Dependencies
```bash
npm install
``` 

### 4. Run Locally
```bash
npm run dev
# Opens http://localhost:5173
```

You should now see the Scorely dashboard. Connect a wallet (preferably on iExec Bellecour testnet) to test the full flow.

**Common issues**:
- If TEE tasks fail → check you're on the correct chain and have testnet RL C tokens.
- Wallet connection stuck → clear cache or try incognito mode.

## Coding & Privacy Standards

- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS utility classes (avoid custom CSS unless absolutely needed)
- **Privacy Rules** — **MUST follow**:
  - **Never** `console.log` or log any user-provided data (income, debt, wallet addresses, etc.)
  - Do not store sensitive data in localStorage/sessionStorage without encryption
  - Use `@iexec/dataprotector` correctly for client-side encryption
  - Minimize data sent to the frontend — most logic lives in the TEE
- **Naming**: Use `camelCase` for variables/functions, `PascalCase` for types/interfaces
- **Comments**: Explain **why** (not just what) when logic is non-obvious, especially around privacy or scoring math

## Commit Message Convention

We loosely follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add multi-model scoring selector
fix: prevent console leak of protected data
docs: update execution flow diagram
chore: upgrade ethers to v6
refactor: extract scoring schema validation
test: add unit tests for creditUtilization factor
```

## Branch Naming

- `feature/short-description`  
- `fix/issue-123-description`  
- `docs/update-readme`  
- `chore/upgrade-deps`

## Submitting a Pull Request (PR)

1. Create a branch from `main`:
   ```bash
   git checkout -b feature/your-cool-feature
   ```

2. Make your changes

3. Commit with clear messages (see convention above)

4. Push:
   ```bash
   git push origin feature/your-cool-feature
   ```

5. Open a Pull Request against `main`

### PR Checklist
- [ ] My code follows the coding & privacy standards above
- [ ] I verified no sensitive data is logged to console or network (search for `console.log`, `debug`, etc.)
- [ ] I tested the feature with a connected wallet (preferably on Bellecour testnet)
- [ ] I added/updated tests if relevant (unit or manual flow test)
- [ ] I updated documentation (README, inline comments) if needed
- [ ] My PR description explains **what** changed and **why**

We review PRs within a few days (faster during hackathons). Feel free to @mention maintainers if urgent.

## Reporting Bugs or Security Issues

- **Security vulnerabilities** → **Do NOT** open a public issue.  
  → Follow instructions in [SECURITY.md](SECURITY.md)  
  → Email: praneethkothagundhu@gmail.com (PGP welcome)

- **Regular bugs / UX issues** → Open an issue with:
  - Browser & version
  - Wallet (MetaMask/Rabby/etc.) & version
  - Network (Bellecour / Ethereum mainnet?)
  - Clear steps to reproduce
  - Screenshots or screen recordings (especially helpful)
  - Expected vs. actual behavior

## Getting Help / Questions

- Most of the errors are solved by reading  **[Errors](docs/errors.md)**
- Open a **Discussion** on GitHub (great for questions, ideas, architecture feedback)
- Join our community channels (Discord/Telegram link coming soon)
- Tag maintainers in issues/PRs if you need guidance

## Thank You!

Your contributions — big or small — help build a more private and fair financial future.  
We appreciate you! ❤️

Happy coding,  
The Scorely Team
