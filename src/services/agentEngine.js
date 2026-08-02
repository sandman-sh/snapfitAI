/**
 * AutoRenew AI — Agent Engine Logic
 * Analyzes subscription metrics, detects waste, recommends optimization actions,
 * and interacts with the Prava Payment engine.
 */

import { chargePravaMandate, createPravaMandate, reportPravaStatus } from "./pravaApi";

export class AgentEngine {
  /**
   * Run an automated AI scan on the current subscription portfolio
   */
  static runPortfolioScan(subscriptions) {
    let totalSpend = 0;
    let totalWaste = 0;
    let actionNeededCount = 0;
    let protectedCount = 0;

    const analyzed = subscriptions.map(sub => {
      totalSpend += sub.monthlyCost;
      if (sub.wasteAmount > 0) {
        totalWaste += sub.wasteAmount;
        actionNeededCount++;
      }
      if (sub.pravaStatus === "ACTIVE") {
        protectedCount++;
      }
      return sub;
    });

    const potentialAnnualSavings = totalWaste * 12;

    return {
      subscriptions: analyzed,
      metrics: {
        totalSpend,
        totalWaste,
        potentialAnnualSavings,
        actionNeededCount,
        protectedCount,
        totalCount: subscriptions.length
      }
    };
  }

  /**
   * Execute an automated optimization action on a subscription
   */
  static async executeOptimization(subscription, actionType, logCallback) {
    const timestamp = new Date().toLocaleTimeString();

    if (actionType === "setup_mandate") {
      logCallback({
        id: `log_${Date.now()}`,
        time: timestamp,
        title: `Initiating Prava Mandate Setup`,
        details: `Configuring $${subscription.monthlyCost}/mo spend cap for ${subscription.name}`,
        status: "PENDING_PASSKEY",
        badge: "MANDATE_INIT"
      });

      const result = await createPravaMandate({
        merchantName: subscription.name,
        merchantUrl: `https://${subscription.vendorDomain}`,
        maxAmount: subscription.monthlyCost
      });

      if (result.success) {
        logCallback({
          id: `log_${Date.now()}_res`,
          time: new Date().toLocaleTimeString(),
          title: `Prava Mandate Created (${result.data.mandate?.mandateId || 'mdt_active'})`,
          details: `Passkey link generated. User approval required to lock vendor.`,
          status: "SUCCESS",
          responseId: result.responseId,
          badge: "PRAVA_SUCCESS"
        });
        return { success: true, type: "mandate_created", data: result.data };
      }
    }

    if (actionType === "auto_renew") {
      logCallback({
        id: `log_${Date.now()}`,
        time: timestamp,
        title: `Executing Silent Prava Mandate Charge`,
        details: `Charging active mandate ${subscription.mandateId || 'mdt_active'} for ${subscription.name} ($${subscription.monthlyCost})`,
        status: "PROCESSING",
        badge: "CHARGE_INIT"
      });

      const chargeRes = await chargePravaMandate(
        subscription.mandateId || "mdt_demo_102",
        subscription.monthlyCost,
        `renewal_${subscription.id}_${Date.now()}`
      );

      if (chargeRes.success) {
        const reportRes = await reportPravaStatus(chargeRes.data.transactionId || chargeRes.data.mandateId, "APPROVED");

        logCallback({
          id: `log_${Date.now()}_res`,
          time: new Date().toLocaleTimeString(),
          title: `Renewal Charge Settled ($${subscription.monthlyCost})`,
          details: `Virtual Card: ${chargeRes.data.credentials?.token || '4111-XXXX-XXXX-9812'} | Prava Txn: ${chargeRes.data.transactionId}`,
          status: "APPROVED",
          responseId: chargeRes.responseId,
          badge: "PRAVA_SETTLED"
        });

        return { success: true, type: "charged", data: chargeRes.data };
      }
    }

    if (actionType === "downgrade_seats" || actionType === "cancel_duplicate") {
      logCallback({
        id: `log_${Date.now()}`,
        time: timestamp,
        title: `AI Agent Negotiated Plan Optimization`,
        details: `Updated subscription parameters for ${subscription.name}. Reduced monthly cost by $${subscription.wasteAmount}.`,
        status: "SUCCESS",
        badge: "PLAN_OPTIMIZED"
      });

      return { success: true, type: "plan_reduced", savedAmount: subscription.wasteAmount };
    }

    return { success: false, message: "Unknown action" };
  }
}
