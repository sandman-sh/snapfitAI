<div align="center">

# ⚡ SnapFit AI × Prava

### **Autonomous Visual Commerce & Agentic Payments Engine**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--5.6--SOL-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
[![Prava](https://img.shields.io/badge/Prava-Agentic_Payments-10B981?style=for-the-badge&logo=shield&logoColor=white)](https://prava.payments)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

<p align="center">
  <b>SnapFit AI</b> is a next-generation agentic visual e-commerce platform that combines multimodal computer vision, generative AR virtual try-on, autonomous conversational shopping agents, and instant 1-click biometric checkout powered by <b>Prava Payments</b>.
</p>

[Key Features](#-key-features) •
[Architecture](#-system-architecture) •
[Quickstart](#-quickstart-guide) •
[Tech Stack](#-technology-stack) •
[Environment Variables](#-environment-variables)

---

</div>

## 🌟 Key Features

### 1. 👁️ GPT-5.6 SOL Vision Outfit Scanner
- **Background Removal & Model Stripping**: Automatically isolates clean clothing cutouts from any user photo or camera snap.
- **Multi-Piece Outfit Breakdown**: Slices complex layered outfits into individual pieces (outerwear, dresses, footwear, accessories).
- **Attribute Extraction**: Identifies exact color palettes, fabric textures, silhouette types, and estimated pricing.

### 2. 💃 Generative AI Virtual AR Try-On Studio
- **`gpt-image-1` Compositing Engine**: Generates real-time visual fitting of selected outfits onto full-body models or personal selfies.
- **Head-to-Toe Model Presets**: Built-in full-body standing models spanning Women, Men, and Kids collections.
- **Interactive Before/After Slider**: Compare original model photos against AI try-on renders with match fit scoring.

### 3. 🤖 KIRO Autonomous Agent Assistant
- **Full-Control Agent**: Powered by `gpt-5.6-sol`, KIRO understands natural language and executes real UI actions on behalf of the user.
- **Action Triggers**: Automates opening try-on sessions, triggering checkouts, applying category filters, and managing subscriptions.

### 4. 💳 Prava Agentic Payments & Passkey Checkout
- **Single-Use Virtual Cards**: Dynamically issues PCI-compliant encrypted virtual card telemetry for cross-merchant purchases.
- **Biometric Passkey Authentication**: 1-click Touch ID / Face ID payment approval with zero card exposure.
- **Autonomous Mandate Manager**: User-defined recurring spending rules, budget thresholds, and transparent transaction ledgers.

---

## 🏗️ System Architecture

```
                               ┌────────────────────────────────────────┐
                               │             USER INTERFACE             │
                               │   (Visual Hero / AR Try-On / KIRO)     │
                               └───────────────────┬────────────────────┘
                                                   │
                        ┌──────────────────────────┴──────────────────────────┐
                        ▼                                                     ▼
    ┌──────────────────────────────────────┐              ┌──────────────────────────────────────┐
    │     AI VISION & GENERATIVE ENGINE    │              │       PRAVA AGENTIC PAYMENTS         │
    │                                      │              │                                      │
    │  • GPT-5.6 SOL Vision Scanner        │              │  • Single-Use Virtual Card Telemetry │
    │  • gpt-image-1 AR Fitting Engine     │              │  • Biometric Passkey Gateway         │
    │  • Background Removal & Slicing      │              │  • Autonomous Mandate Engine         │
    └──────────────────────────────────────┘              └──────────────────────────────────────┘
                        │                                                     │
                        └──────────────────────────┬──────────────────────────┘
                                                   ▼
                               ┌────────────────────────────────────────┐
                               │     FULL-CONTROL AGENTIC WORKFLOW      │
                               │    (Discover -> Fit -> Decide -> Pay)  │
                               └────────────────────────────────────────┘
```

---

## ⚡ Quickstart Guide

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **OpenAI API Key**: Valid API key with access to `gpt-5.6-sol` / `gpt-image-1`

### 1. Clone the Repository
```bash
git clone https://github.com/sandman-sh/snapfitAI.git
cd snapfitAI
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Start the Local Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### 5. Build for Production
```bash
npm run build
```

---

## 🛠️ Technology Stack

| Layer | Technology | Usage |
| :--- | :--- | :--- |
| **Frontend Core** | React 18, Vite 5 | SPA Architecture & fast HMR development |
| **Styling & Motion** | Vanilla CSS, TailwindCSS, Lucide Icons | Responsive modern UI with glassmorphism & dark mode |
| **AI Vision & Chat** | OpenAI API (`gpt-5.6-sol`) | Multimodal photo parsing & KIRO Agent reasoning |
| **AI AR Try-On** | OpenAI API (`gpt-image-1`) & HTML5 Canvas | Generative outfit compositing & background keying |
| **Payments Layer** | Prava Payments SDK & API | Virtual card provisioning, passkeys & mandates |

---

## 🔑 Environment Variables Reference

| Variable | Required | Description |
| :--- | :---: | :--- |
| `VITE_OPENAI_API_KEY` | **Yes** | OpenAI API Key used for GPT-5.6 SOL Vision & AR Image Generation |

---

## 📂 Project Structure

```
snapfitAI/
├── public/
│   └── garments/              # Local high-definition product cutout PNGs
├── src/
│   ├── components/
│   │   ├── VisualSearchHero.jsx   # Photo Scanner & BG Removal Header
│   │   ├── ProductCatalog.jsx     # Multi-Category Catalog & Lookalikes
│   │   ├── MixMatchStudio.jsx     # AI Virtual AR Try-On Studio
│   │   ├── KiroChatbot.jsx        # Full-Control Agent Chat Interface
│   │   ├── PravaCheckoutModal.jsx # 1-Click Biometric Passkey Checkout
│   │   ├── MandateManager.jsx     # Autonomous Mandates & Subscriptions
│   │   └── TransactionLedger.jsx  # Spending Telemetry & Order History
│   ├── services/
│   │   ├── openaiService.js       # OpenAI API Client Helper
│   │   ├── visionService.js       # GPT-5.6 SOL Vision Parsing
│   │   ├── aiTryOnService.js      # gpt-image-1 AR Composite Engine
│   │   └── kiroService.js         # KIRO Autonomous Agent Reasoner
│   ├── data/
│   │   └── ecommerceProducts.js   # Product Catalog Data
│   ├── App.jsx                    # Core Application Controller
│   └── main.jsx                   # React DOM Entrypoint
├── .env                       # Environment Configuration
├── package.json
└── README.md
```

---

<div align="center">

**Built with ❤️ for Autonomous Commerce & Agentic Payments**

</div>
