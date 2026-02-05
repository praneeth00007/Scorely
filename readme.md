# Scorely: Confidential Credit Scoring on iExec

## 🚀 Overview

**Scorely** is a privacy-first credit scoring engine built on **iExec Confidential Computing**.
It enables users to generate a verifiable credit score (300–850) from sensitive off-chain financial data **without exposing raw inputs** to the frontend, the blockchain, or infrastructure operators.

All computations are executed inside a **Trusted Execution Environment (TEE)**, ensuring that only the final result is revealed to the user.

> *The code moves to the data, executes securely, and only the result comes out.*

---


## 🔐 Why Confidential Computing?

Traditional smart contracts and off-chain services cannot safely process sensitive financial data.
On public blockchains, all inputs and intermediate states are transparent by default. Off-chain servers, while private, require users to trust the operator with their raw data.

Credit scoring **fundamentally requires access to highly sensitive information** such as income, liabilities, and financial history. Revealing this data to a DApp backend, blockchain nodes, or third-party APIs introduces unacceptable privacy and compliance risks.

Confidential Computing addresses this problem by enabling computation over encrypted data inside **hardware-enforced Trusted Execution Environments (TEE)**:

* Raw financial inputs are never visible to the frontend after submission
* Decryption occurs only inside a remotely attested enclave
* Node operators and infrastructure providers cannot inspect data or logic
* Only the final result is released, encrypted for the user

In **Scorely**, confidential computing is not an optimization — it is a **hard requirement**.
Without TEEs, the system would either:

* leak private financial data on-chain, or
* rely on a trusted centralized backend, defeating the purpose of Web3.

By combining iExec’s DataProtector and TEE execution model, Scorely demonstrates how privacy-sensitive financial primitives — such as credit scoring, reputation systems, and under-collateralized lending — can be built

 **without sacrificing decentralization or user data ownership**.
---


## 🏗️ Architecture

Scorely separates **data confidentiality** from **computation logic** using iExec’s TEE-based execution model.

### High-Level Architecture

The system decouples **Compute** from **Visibility** Using Intel SGX enclaves. 
### High-Level System Architecture Diagram 

[![](https://mermaid.ink/img/pako:eNqFVG1P2zAQ_isnI_YpjRrSFxqkSQPKVAk2RMqQlk7IJE5qNbUjxxntKP995zgDF20jH9zz-bnnHt-d-0RSmTESkULRagmXNwsB-NXNg3Xc1kzdT8VPrqRYM6EhMR5wPD9shPkyrliquRQwP3313s6SC8RqJjK0HfgdLUumLaG1u0NELsQbITORK1pr1aS6UQwSPt2w9I33XSlXVK2Yrkqaso7A8TjR1_JMJqcMJaWyUXBaynSVLikXDia-ipOYpYppJBG0YE4x_naBM7muGs3uL-kW75t0W2i37wq_kyhTJfPptDPhC7bNCeOfqqq7ElpwKQue_kdMrKVCyZB0hsM0u76IE7PA_plDc3iItxHC6qyt73YGvd7HXeDjbKRqW2n4ADEvxK5r7R7qyIdrU3L4qjKm6p3bBgu0qw2Fno8xhgzmGwSb7thzJ6zlDX106XQJ54yWLtCuZt_iBj7Mab2CueJFwdSuK2qX1BbY4IY-XLCWj2q6a0uzjzHCPqNCOwioDafCzWjagkxw04gah7XmWSv0X_lGPsTNw5pruGF1U2r3Cg7MNAZr12icIFfVXo3HPnzj7PGFycJeGhjrbclFYfdpSev6nOWApeQCcl6W0UGe5x4-Lbli0UEYhp3de-SZXkZBtTlxYjGpZ5vlOT3xjHoPS-JZ8Z4ph9fOVpvohHj4v8MzEuELZh5ZM7WmZkueDPeC6CW-qgWJ0MyQdkEW4hljKiq-S7n-E6ZkUyxJlNOyxl1TZVSzc05x0l8hOL1MnclGaBIdtwwkeiIbEgWjiT8ejifHYX8yCgb9EE-3JOoFw6E_6o_740kwGAb9MHj2yK82aeCPB8fDCR4eBZMR_g6efwP0SqkU?type=png)](https://mermaid.live/edit#pako:eNqFVG1P2zAQ_isnI_YpjRrSFxqkSQPKVAk2RMqQlk7IJE5qNbUjxxntKP995zgDF20jH9zz-bnnHt-d-0RSmTESkULRagmXNwsB-NXNg3Xc1kzdT8VPrqRYM6EhMR5wPD9shPkyrliquRQwP3313s6SC8RqJjK0HfgdLUumLaG1u0NELsQbITORK1pr1aS6UQwSPt2w9I33XSlXVK2Yrkqaso7A8TjR1_JMJqcMJaWyUXBaynSVLikXDia-ipOYpYppJBG0YE4x_naBM7muGs3uL-kW75t0W2i37wq_kyhTJfPptDPhC7bNCeOfqqq7ElpwKQue_kdMrKVCyZB0hsM0u76IE7PA_plDc3iItxHC6qyt73YGvd7HXeDjbKRqW2n4ADEvxK5r7R7qyIdrU3L4qjKm6p3bBgu0qw2Fno8xhgzmGwSb7thzJ6zlDX106XQJ54yWLtCuZt_iBj7Mab2CueJFwdSuK2qX1BbY4IY-XLCWj2q6a0uzjzHCPqNCOwioDafCzWjagkxw04gah7XmWSv0X_lGPsTNw5pruGF1U2r3Cg7MNAZr12icIFfVXo3HPnzj7PGFycJeGhjrbclFYfdpSev6nOWApeQCcl6W0UGe5x4-Lbli0UEYhp3de-SZXkZBtTlxYjGpZ5vlOT3xjHoPS-JZ8Z4ph9fOVpvohHj4v8MzEuELZh5ZM7WmZkueDPeC6CW-qgWJ0MyQdkEW4hljKiq-S7n-E6ZkUyxJlNOyxl1TZVSzc05x0l8hOL1MnclGaBIdtwwkeiIbEgWjiT8ejifHYX8yCgb9EE-3JOoFw6E_6o_740kwGAb9MHj2yK82aeCPB8fDCR4eBZMR_g6efwP0SqkU)

---

### Execution Flow

1. **Client-side Data Protection**
   User financial inputs are encrypted locally in the browser using the **iExec DataProtector SDK**.

2. **On-chain Coordination**
   The encrypted dataset is registered on-chain as **Protected Data** on the Arbitrum Sepolia network.
   The user authorizes a specific iExec iApp to process this data.

3. **Confidential Execution**
   A TEE-enabled worker retrieves and decrypts the data **inside a secure enclave** after remote attestation.

4. **Result Delivery**
   The scoring logic runs entirely in a protected environment and outputs **only the final credit score**, which is returned to the user.

At no point is raw financial data exposed.

---

### UML Sequence Diagram

[![](https://mermaid.ink/img/pako:eNqFVV1v2jAU_SuWpU1UIojPwvKAxIBW1dS1Iq0qTbyY5BIsEjtz7LVZ1f--6zhpoWEtL_j6HN8vn-s801BGQH2aw28DIoQFZ7Fi6VoQ_DGjpTDpBlRlh1oqcp_XdsaU5iHPmNDk_oqwnFwoKTSICM0m5YElCWhLsy4qs0kLFj8shy-fILRGkzHfMS4s5zugi1Aa5baazLvl0vLs34NUe5u4I2muEyBLEXlaevhXheOzLCN2ZTSXglwk8rE-8eULud2xHEjP2T-lBiL_gGtIGyv2awIuFKKhJgummaNbkjedWtY84eGerOnKCBJgKAVJsaYV7QpJWLRPMufCemidORD3EXV980nAY0FaSxGqInORKpojeLUjy4PoIBXnpsTq01_JfZZIFv0_zlwBw4Ktlxz0h5Hung7dlDfjkxXEPNfYrcqDo5SgV_VlBdoowUVccsgsihTkeaP__c_63_fJpbK3PwvD0sFxY2OLOeijxjoGuVERqA_LLRknKr41m4TnO4cTLd1iI-X-RO1VtDJviBo1Dz6reeC_yfaEkqzzSpMQNSVVZXzNdFjlm5PWAlhy9i7V0p8FyNWCOElUmjlIUPF4p4ncksqt53kk0DiVZJYXIjyYL0QOA0ynOKi-dcK3xevAWhz3a3QhH4WV6rGQDgiX-MbgWCnQWERwHZw1GHbwyklvsSzrZEWTUc_FCnKTHIWoagrMJuU1juODzZXbT3pgn5mTHThxFfMd4BuBXdMGq5jLNEPlQXTyPu5YvidzKbZcpSe0M_xMO0N7pQlHqHgvnS2gIlyRx4o5voobozOjG6_LAurX5ZapHN7wo4EnQSgVHES2-eFhnmcJK6oW0zaNFY-or5WBNk1Bpcya9NkeXFO9gxTW1MdlxNTePqcveAY_Ar-kTOtjSpp4R_0tS3K0TBahfqsv3uuuws8XqLk0QlN_dF76oP4zfaJ-f9zrnE8G4_54MB4M--M2LajvDbqjzrdur9ftTgYDRF_a9G8Zs9-ZnA-7_fGo2-2N-qPJ5OUffwhPGw?type=png)](https://mermaid.live/edit#pako:eNqFVV1v2jAU_SuWpU1UIojPwvKAxIBW1dS1Iq0qTbyY5BIsEjtz7LVZ1f--6zhpoWEtL_j6HN8vn-s801BGQH2aw28DIoQFZ7Fi6VoQ_DGjpTDpBlRlh1oqcp_XdsaU5iHPmNDk_oqwnFwoKTSICM0m5YElCWhLsy4qs0kLFj8shy-fILRGkzHfMS4s5zugi1Aa5baazLvl0vLs34NUe5u4I2muEyBLEXlaevhXheOzLCN2ZTSXglwk8rE-8eULud2xHEjP2T-lBiL_gGtIGyv2awIuFKKhJgummaNbkjedWtY84eGerOnKCBJgKAVJsaYV7QpJWLRPMufCemidORD3EXV980nAY0FaSxGqInORKpojeLUjy4PoIBXnpsTq01_JfZZIFv0_zlwBw4Ktlxz0h5Hung7dlDfjkxXEPNfYrcqDo5SgV_VlBdoowUVccsgsihTkeaP__c_63_fJpbK3PwvD0sFxY2OLOeijxjoGuVERqA_LLRknKr41m4TnO4cTLd1iI-X-RO1VtDJviBo1Dz6reeC_yfaEkqzzSpMQNSVVZXzNdFjlm5PWAlhy9i7V0p8FyNWCOElUmjlIUPF4p4ncksqt53kk0DiVZJYXIjyYL0QOA0ynOKi-dcK3xevAWhz3a3QhH4WV6rGQDgiX-MbgWCnQWERwHZw1GHbwyklvsSzrZEWTUc_FCnKTHIWoagrMJuU1juODzZXbT3pgn5mTHThxFfMd4BuBXdMGq5jLNEPlQXTyPu5YvidzKbZcpSe0M_xMO0N7pQlHqHgvnS2gIlyRx4o5voobozOjG6_LAurX5ZapHN7wo4EnQSgVHES2-eFhnmcJK6oW0zaNFY-or5WBNk1Bpcya9NkeXFO9gxTW1MdlxNTePqcveAY_Ar-kTOtjSpp4R_0tS3K0TBahfqsv3uuuws8XqLk0QlN_dF76oP4zfaJ-f9zrnE8G4_54MB4M--M2LajvDbqjzrdur9ftTgYDRF_a9G8Zs9-ZnA-7_fGo2-2N-qPJ5OUffwhPGw)

---

## 📂 Project Structure

```text
Scorely/
├── frontend/              # React + Vite frontend
├── IAPP/                  # iExec TEE application (Python)
├── docs/                  # Documentation and references
└── README.md              # Project overview
```

---

## 🛠️ Components

### 1. Frontend

Built with **React 18** and **Vite**.

Responsibilities:

* Wallet connection using `@web3-onboard`
* Client-side encryption via `@iexec/dataprotector`
* Triggering confidential computation
* Monitoring execution status and fetching results

The frontend never accesses decrypted financial data after submission.

---

### 2. TEE iApp (Confidential Engine)

The core scoring logic resides in the `IAPP` directory.

* **Language**: Python
* **Execution**: Runs inside a Trusted Execution Environment
* **Logic**: Deterministic credit scoring based on financial metrics
* **Output**: A single JSON result containing the computed score

The application performs no network calls and produces no intermediate logs.

---

## 🚀 Setup and Usage

### Prerequisites

* Node.js (v18+)
* Docker
* iExec CLI and iApp CLI
* MetaMask with Arbitrum Sepolia test funds

---

### 1. iApp (Scoring Engine)

```bash
# Important:
# When prompted "Where do you want to save your wallet?", select:
# "> in the encrypted keystore"
# Avoid selecting "in iapp config file" for security reasons.

cd IAPP
npm install -g @iexec/iapp-generator
npm i  -g iexec
iapp wallet import
```

Create mock protected data for testing:
1. Run: `iapp mock --protectedData` 
2. Select **Choose file**.
3. Enter the path: `./test.json`.
4. Name your mock dataset (e.g., `my-test-data`).

Test locally using your mock data:
```bash
iapp test --protectedData my-test-data
```

Deploy the application to iExec:

```bash
iapp deploy
```

Publish the application to the marketplace:

```bash
iexec init

iexec app publish <APP_ADDRESS> --price <PRICE> --volume <VOLUME> --tag tee,scone
```

> Setting the price to `0` is optional and commonly used for testing or hackathon demos.

---

### 2. Frontend

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

---

### 3. Connecting Frontend to the iApp

If you deploy your own version of the scoring engine, update the following configuration:

```ts
const RESOURCE_APP_ADDRESS = "0xYourAppAddress";
const WORKERPOOL_ADDRESS = "0xb967057a21dc6a66a29721d96b8aa7454b7c383f";
```

If required, adjust execution pricing parameters in the computation call to match your marketplace configuration.

---

## 🧪 How It Works

1. User inputs are encrypted in the browser
2. Encrypted data is registered as Protected Data on-chain
3. The user grants execution permission to the iApp
4. A confidential computation is triggered
5. The encrypted result is returned and decrypted locally

Raw financial data is never revealed.

---

## ⚡ Key Design Choices

* Hardware-backed confidentiality using Trusted Execution Environments
* Client-side data protection before any on-chain interaction
* Deterministic execution for reproducibility
* Minimal output surface to reduce data exposure

---

## 🔮 Roadmap

### Phase 1 — MVP (Completed)

* Confidential credit scoring engine
* End-to-end encrypted data flow
* Frontend execution and result visualization

### Phase 2 — Enhanced Data Inputs

* Secure ingestion of additional financial signals
* Improved scoring logic

### Phase 3 — Ecosystem Integration

* Confidential data oracles
* Identity-linked financial reputation
* DeFi lending integrations
* Cross-chain score portability

---

## 🆘 Troubleshooting

Common deployment and execution issues encountered during development,
along with their resolutions, are documented here:

👉 **[Troubleshooting & Error Log](docs/errors.md)**

---

*Built for the iExec Hack4Privacy Hackathon.*
