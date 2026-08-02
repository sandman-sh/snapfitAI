import React from 'react';

export default function PravaSecuritySection() {
  return (
    <section id="architecture" className="border-b border-[var(--bh-border)]">
      <div className="max-w-[1280px] mx-auto px-6 py-20">

        <div className="flex items-center gap-0 mb-3">
          <div className="h-1 w-8 bg-[#1B4FB6]"></div>
          <div className="h-1 w-5 bg-[#E8B825]"></div>
        </div>

        <h2 className="text-3xl font-bold text-[var(--bh-text-strong)] tracking-tight mb-2">How Prava Works</h2>
        <p className="text-sm text-[var(--bh-text-subtle)] mb-12 max-w-lg">
          The trust layer between your agent and merchant. Cards never leave the vault.
        </p>

        {/* Three columns — numbered steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-[var(--bh-border)] bg-[var(--bh-card-bg)]">

          <div className="p-6 border-b md:border-b-0 md:border-r border-[var(--bh-border)]">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 flex items-center justify-center bg-[#D42C2C] text-white font-['Space_Grotesk'] font-bold text-sm">1</span>
              <h3 className="text-base font-bold text-[var(--bh-text-strong)]">Standing Mandates</h3>
            </div>
            <p className="text-sm text-[var(--bh-text-muted)] leading-relaxed mb-4">
              Approve once with a biometric passkey. The agent receives a recurring spend cap 
              and charges automatically within limits — no prompt per renewal.
            </p>
            <code className="font-['JetBrains_Mono'] text-[11px] text-[#1B4FB6] font-semibold block">
              POST /v1/mandates/{'{id}'}/charge
            </code>
          </div>

          <div className="p-6 border-b md:border-b-0 md:border-r border-[var(--bh-border)]">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 flex items-center justify-center bg-[#1B4FB6] text-white font-['Space_Grotesk'] font-bold text-sm">2</span>
              <h3 className="text-base font-bold text-[var(--bh-text-strong)]">Scoped Credentials</h3>
            </div>
            <p className="text-sm text-[var(--bh-text-muted)] leading-relaxed mb-4">
              For upgrades or one-time purchases, a payment session mints a virtual card 
              locked to one merchant and one exact amount. Cannot be reused.
            </p>
            <code className="font-['JetBrains_Mono'] text-[11px] text-[#1B4FB6] font-semibold block">
              POST /v1/sessions
            </code>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 flex items-center justify-center bg-[#E8B825] text-[#0A0A0A] font-['Space_Grotesk'] font-bold text-sm">3</span>
              <h3 className="text-base font-bold text-[var(--bh-text-strong)]">Zero Card Exposure</h3>
            </div>
            <p className="text-sm text-[var(--bh-text-muted)] leading-relaxed mb-4">
              Cards enter Prava's secure surface and are tokenized. The agent, your backend, 
              and your app never see a raw card number. You stay out of PCI scope.
            </p>
            <code className="font-['JetBrains_Mono'] text-[11px] text-[#1A8C7E] font-semibold block">
              PCI-DSS Level 1 Compliant
            </code>
          </div>

        </div>

        {/* Payload example */}
        <div className="mt-8 border border-[var(--bh-border)] bg-[var(--bh-surface-raised)]">
          <div className="flex items-center justify-between px-5 py-2.5 border-b border-[var(--bh-border)] bg-[var(--bh-surface-overlay)]">
            <span className="font-['JetBrains_Mono'] text-[10px] text-[var(--bh-text-subtle)] uppercase tracking-widest font-semibold">Mandate Charge Protocol</span>
            <span className="font-['JetBrains_Mono'] text-[10px] text-[var(--bh-text-subtle)]">sandbox.api.prava.space</span>
          </div>
          <pre className="p-5 font-['JetBrains_Mono'] text-[12px] text-[var(--bh-text-main)] leading-relaxed overflow-x-auto">
{`POST /v1/mandates/mdt_gh_44102/charge
Authorization: Bearer sk_test_***

{ "amount": "420.00", "reference": "github_aug_2026" }

→ 200 OK
{
  "transactionId": "txn_881920",
  "status": "awaiting_result",
  "credentials": { "token": "4111-XXXX-9812", "dynamicCvv": "***" }
}`}
          </pre>
        </div>

      </div>
    </section>
  );
}
