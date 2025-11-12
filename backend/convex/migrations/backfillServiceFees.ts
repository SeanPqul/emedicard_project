/**
 * Backfill Service Fees Migration
 * 
 * Fixes payments with missing or incorrect serviceFee values
 * Calculates: serviceFee = netAmount - amount
 */

import { internalMutation } from "../_generated/server";

export const backfillServiceFees = internalMutation({
  handler: async (ctx) => {
    const payments = await ctx.db.query("payments").collect();
    
    let fixed = 0;
    let skipped = 0;
    
    for (const payment of payments) {
      const calculatedServiceFee = payment.netAmount - payment.amount;
      
      // Fix if serviceFee is missing, 0, or incorrect
      if (
        payment.serviceFee === undefined ||
        payment.serviceFee === null ||
        (payment.serviceFee === 0 && calculatedServiceFee !== 0) ||
        payment.serviceFee !== calculatedServiceFee
      ) {
        await ctx.db.patch(payment._id, {
          serviceFee: calculatedServiceFee,
          updatedAt: Date.now(),
        });
        
        console.log(
          `Fixed payment ${payment._id}: ${payment.referenceNumber} - ` +
          `serviceFee ${payment.serviceFee} → ${calculatedServiceFee}`
        );
        fixed++;
      } else {
        skipped++;
      }
    }
    
    return {
      success: true,
      totalPayments: payments.length,
      fixed,
      skipped,
      message: `Backfilled ${fixed} payments, skipped ${skipped} correct payments`,
    };
  },
});
