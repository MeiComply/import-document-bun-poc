/**
 * Tax calculation utility for validation engine
 * Groups line items by tax categories and calculates tax totals
 */

export interface TaxSubtotal {
  taxableAmount: number;
  taxAmount: number;
  taxCategory: string;
  percent: number;
  taxScheme: string;
}

export interface TaxTotal {
  taxAmount: number;
  taxSubtotals: TaxSubtotal[];
}

/**
 * Calculates tax totals from line items by grouping them by tax categories
 * @param document - The document containing line items
 * @returns Array of tax totals grouped by tax categories
 */
export function calculateTaxTotalsFromLineItems(document: Record<string, any>): TaxTotal[] {
  try {
    console.log('🧮 Starting tax calculation from line items...');

    // Extract line items from the document
    const lineItems = document.lineItems || document.items?.items || [];

    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      console.log('⚠️ No line items found for tax calculation');
      return [];
    }

    console.log(`📊 Found ${lineItems.length} line items for tax calculation`);

    // Group line items by tax category
    const taxCategoryGroups: Map<
      string,
      {
        taxableAmount: number;
        taxAmount: number;
        percent: number;
        taxScheme: string;
        count: number;
      }
    > = new Map();

    // Process each line item
    lineItems.forEach((item, index) => {
      try {
        console.log(`📋 Processing line item ${index + 1}:`, JSON.stringify(item, null, 2));

        // Extract tax information from the line item
        // Based on the sample document, line items have direct taxCategory, taxRate, and lineTaxableValue
        const taxCategory = item.taxCategory;
        const taxRate = item.taxRate;
        const lineTaxableValue = item.lineTaxableValue;
        const taxAmount = item.taxAmount;

        if (taxCategory && taxRate !== undefined && lineTaxableValue !== undefined) {
          const category = taxCategory.toString();
          const percent = parseFloat(taxRate.toString()) || 0;
          const taxableAmount = parseFloat(lineTaxableValue.toString()) || 0;

          // Use existing tax amount if available, otherwise calculate it
          let calculatedTaxAmount = taxAmount ? parseFloat(taxAmount.toString()) : 0;
          if (!calculatedTaxAmount && taxableAmount && percent) {
            calculatedTaxAmount = (taxableAmount * percent) / 100;
          }

          // Default tax scheme based on country (can be enhanced later)
          const taxScheme = 'VAT'; // For Malaysia, use VAT as requested

          console.log(
            `📊 Line item ${index + 1}: Category ${category}, Taxable Amount: ${taxableAmount}, Tax Rate: ${percent}%, Tax Amount: ${calculatedTaxAmount}`
          );

          // Get or create the tax category group
          const existingGroup = taxCategoryGroups.get(category);
          if (existingGroup) {
            existingGroup.taxableAmount += taxableAmount;
            existingGroup.taxAmount += calculatedTaxAmount;
            existingGroup.count += 1;
            console.log(
              `🔄 Updated existing group for category ${category}: Total taxable: ${existingGroup.taxableAmount}, Total tax: ${existingGroup.taxAmount}`
            );
          } else {
            taxCategoryGroups.set(category, {
              taxableAmount: taxableAmount,
              taxAmount: calculatedTaxAmount,
              percent: percent,
              taxScheme: taxScheme,
              count: 1,
            });
            console.log(
              `🆕 Created new group for category ${category}: Taxable: ${taxableAmount}, Tax: ${calculatedTaxAmount}`
            );
          }
        } else {
          console.log(
            `⚠️ Line item ${index + 1} missing required tax fields: taxCategory=${taxCategory}, taxRate=${taxRate}, lineTaxableValue=${lineTaxableValue}`
          );
        }
      } catch (itemError) {
        console.warn(`⚠️ Error processing line item ${index + 1}:`, itemError);
      }
    });

    // Convert grouped data to tax totals structure
    const taxTotals: TaxTotal[] = [];

    taxCategoryGroups.forEach((group, category) => {
      // Round amounts to 2 decimal places for currency
      const roundedTaxableAmount = Math.round(group.taxableAmount * 100) / 100;
      const roundedTaxAmount = Math.round(group.taxAmount * 100) / 100;

      const taxSubtotal: TaxSubtotal = {
        taxableAmount: roundedTaxableAmount,
        taxAmount: roundedTaxAmount,
        taxCategory: category,
        percent: group.percent,
        taxScheme: group.taxScheme,
      };

      const taxTotal: TaxTotal = {
        taxAmount: roundedTaxAmount,
        taxSubtotals: [taxSubtotal],
      };

      taxTotals.push(taxTotal);

      console.log(
        `💰 Tax Category ${category}: Total Amount: ${roundedTaxableAmount}, Total Tax: ${roundedTaxAmount}, Percent: ${group.percent}%`
      );
    });

    console.log(`✅ Tax calculation completed. Generated ${taxTotals.length} tax total groups`);
    return taxTotals;
  } catch (error) {
    console.error('❌ Error in tax calculation:', error);
    return [];
  }
}

/**
 * Validates if the calculated tax totals match the expected structure
 * @param calculatedTaxTotals - The calculated tax totals
 * @param expectedTaxTotals - The expected tax totals from the document
 * @returns Validation result with any discrepancies
 */
export function validateTaxTotals(
  calculatedTaxTotals: TaxTotal[],
  expectedTaxTotals: any[]
): { isValid: boolean; discrepancies: string[] } {
  const discrepancies: string[] = [];

  try {
    if (!Array.isArray(expectedTaxTotals)) {
      discrepancies.push('Expected tax totals is not an array');
      return { isValid: false, discrepancies };
    }

    // Compare calculated vs expected
    calculatedTaxTotals.forEach((calculated, index) => {
      const expected = expectedTaxTotals[index];

      if (!expected) {
        discrepancies.push(`Missing expected tax total at index ${index}`);
        return;
      }

      // Compare tax amounts
      if (Math.abs(calculated.taxAmount - (expected.taxAmount || 0)) > 0.01) {
        discrepancies.push(
          `Tax amount mismatch at index ${index}: calculated ${calculated.taxAmount}, expected ${expected.taxAmount}`
        );
      }

      // Compare tax subtotals
      if (calculated.taxSubtotals.length !== (expected.taxSubtotals?.length || 0)) {
        discrepancies.push(
          `Tax subtotals count mismatch at index ${index}: calculated ${calculated.taxSubtotals.length}, expected ${expected.taxSubtotals?.length || 0}`
        );
      }
    });

    return {
      isValid: discrepancies.length === 0,
      discrepancies,
    };
  } catch (error) {
    discrepancies.push(
      `Error during tax validation: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return { isValid: false, discrepancies };
  }
}
