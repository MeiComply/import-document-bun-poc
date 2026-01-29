// Base mapping structure that all countries use
export interface InvoiceMapping {
  [excelColumn: string]: string;
}

// Country-specific mappings
const countryMappings: Record<string, InvoiceMapping> = {
  MY: {
    // Meta fields
    'Source name': 'meta.source.name',
    'Source Version': 'meta.source.version',

    // Header fields
    'e-Invoice Type Code': 'invoiceTypeFromExcel',
    'E-Invoice Sub-type': 'header.documentSubtype',
    'e-Invoice Code / Number': 'header.documentNumber',
    'Original e-Invoice Reference Number': 'header.referenceId',
    'e-Invoice Date': 'header.issueDate',
    'e-Invoice Time': 'header.issueTime',
    'Invoice Currency Code': 'header.currency',
    'Currency Exchange Rate': 'header.exchangeRate.rate',
    'Frequency of Billing': 'extensions.my_billingFrequency',
    'Billing Period Start Date': 'header.invoicePeriod.startDate',
    'Billing Period End Date': 'header.invoicePeriod.endDate',

    // Supplier/Seller fields
    'Supplier ID': 'parties.seller.partyId',
    'Supplier Peppol ID': 'parties.seller.peppolId',
    "Supplier's Name": 'parties.seller.name',
    "Supplier's TIN": 'parties.seller.taxIds[type="TIN"].value',
    "Supplier's Registration scheme ID": 'parties.seller.registrationNumbers[].type',
    "Supplier's Registration Number": 'parties.seller.registrationNumbers[].value',
    "Supplier's SST Registration Number": 'parties.seller.registrationNumbers[type="SST"].value',
    "Supplier's Tourism Tax Registration": 'parties.seller.registrationNumbers[type="TTR"].value',
    "Supplier's e-mail": 'parties.seller.contact.email',
    "Supplier's MSIC Code": 'parties.seller.industryClassification.code',
    "Supplier's Business Activity": 'parties.seller.businessActivityDescription',
    "Supplier's Contact Number": 'parties.seller.contact.phone',

    // Supplier Address
    'Supplier Address Line 1': 'parties.seller.address.addressLine1',
    'Supplier Address Line 2': 'parties.seller.address.addressLine2',
    'Supplier Address Line 3': 'parties.seller.address.addressLine3',
    'Supplier Postal Zone': 'parties.seller.address.postalCode',
    'Supplier City Name': 'parties.seller.address.city',
    'Supplier State': 'parties.seller.address.stateOrProvince',
    'Supplier Country': 'parties.seller.address.country',

    // Buyer fields
    'Buyer ID': 'parties.buyer.partyId',
    'Buyer Peppol ID': 'parties.buyer.peppolId',
    "Buyer's Name": 'parties.buyer.name',
    "Buyer's TIN": 'parties.buyer.taxIds[type="TIN"].value',
    "Buyer's Registration Scheme ID": 'parties.buyer.registrationNumbers[].type',
    "Buyer's Registration Number": 'parties.buyer.registrationNumbers[].value',
    "Buyer's SST Registration Number": 'parties.buyer.registrationNumbers[type="SST"].value',
    "Buyer's e-mail": 'parties.buyer.contact.email',
    "Buyer's Contact Number": 'parties.buyer.contact.phone',

    // Buyer Address
    'Buyer Address Line 1': 'parties.buyer.address.addressLine1',
    'Buyer Address Line 2': 'parties.buyer.address.addressLine2',
    'Buyer Address Line 3': 'parties.buyer.address.addressLine3',
    'Buyer Postal Zone': 'parties.buyer.address.postalCode',
    'Buyer City Name': 'parties.buyer.address.city',
    'Buyer State': 'parties.buyer.address.stateOrProvince',
    'Buyer Country': 'parties.buyer.address.country',

    // Shipping/Delivery fields
    'Shipping Recipient ID': 'parties.delivery.partyId',
    "Shipping Recipient's Name": 'parties.delivery.name',
    "Shipping Recipient's TIN": 'parties.delivery.taxIds[type="TIN"].value',
    "Shipping Recipient's Registration Type": 'parties.delivery.registrationNumbers[].type',
    "Shipping Recipient's Registration Number": 'parties.delivery.registrationNumbers[].value',

    // Shipping Address
    'Shipping Address Line 1': 'parties.delivery.address.addressLine1',
    'Shipping Address Line 2': 'parties.delivery.address.addressLine2',
    'Shipping Address Line 3': 'parties.delivery.address.addressLine3',
    'Shipping Postal Zone': 'parties.delivery.address.postalCode',
    'Shipping City Name': 'parties.delivery.address.city',
    'Shipping State': 'parties.delivery.address.stateOrProvince',
    'Shipping Country': 'parties.delivery.address.country',

    // Line Items
    'Line ID': 'lineItems[].id',
    Classification: 'lineItems[].commodityClassification.code',
    'Product Tariff Code': 'lineItems[].commodityCode',
    'Country of Origin': 'lineItems[].countryOfOrigin',
    Description: 'lineItems[].description',
    'Unit Price': 'lineItems[].price.amount',
    Measurement: 'lineItems[].unitCode',
    Quantity: 'lineItems[].quantity',
    Subtotal: 'lineItems[].price.amount*quantity',
    'Discount Rate': 'lineItems[].discountsOrCharges[isCharge=false].percent',
    'Discount Amount': 'lineItems[].discountsOrCharges[isCharge=false].amount',
    'Charge Rate': 'lineItems[].discountsOrCharges[isCharge=true].percent',
    'Charge Amount': 'lineItems[].discountsOrCharges[isCharge=true].amount',
    'Line Item Total Excluding Tax': 'lineItems[].lineTaxableValue',
    'Tax Type': 'lineItems[].taxCategory',
    'Tax Rate': 'lineItems[].taxRate',
    'Tax Amount': 'lineItems[].taxAmount',
    'Details of Tax Exemption': 'lineItems[].taxExemptionReason',
    'Amount Exempted from Tax': 'extensions.my_taxExemptionAmount',
    'Line Total': 'lineItems[].lineTotal',

    // Summary/Totals
    'Sum of Line Level Taxable Amounts': 'totals.totalLineTaxableAmount',
    'Total Discount Value': 'totals.totalAllowances',
    'Total Fee / Charge Amount': 'totals.totalCharges',
    'Invoice Additional Discount': 'allowancesAndCharges[isCharge=false].amount',
    'Invoice Additional Charge': 'allowancesAndCharges[isCharge=true].amount',
    'Invoice Total Excluding Tax': 'totals.totalAmountExcludingTax',
    'Total Tax Amount': 'totals.totalTaxAmount',
    'Invoice Total Including Tax': 'totals.totalAmountIncludingTax',
    'PrePayment Amount': 'totals.prepaidAmount',
    'Total Payable Amount': 'totals.amountDue',
    'Rounding Amount': 'totals.roundingAmount',

    // Payment Details
    'Payment Mode': 'payment.paymentMeans[].paymentMeansCode',
    "Supplier's Bank Account": 'payment.paymentMeans[].creditTransferInfo.payeeFinancialAccountId',
    'Payment Terms': 'payment.paymentTerms[].note',
    'PrePayment Date': 'extensions.my_prepaymentDate',
    'PrePayment Time': 'extensions.my_prepaymentTime',
    'PrePayment Reference': 'payment.paymentMeans[].paymentId',
    'Bill Reference Number': 'supportingDocuments[documentType="bill"].id',

    // Export/Additional Documents
    'Customs Form Reference': 'supportingDocuments[documentType="customs_form"].id',
    Incoterms: 'parties.delivery.deliveryTerms[].incoterms',
    'FTA Information': 'supportingDocuments[documentType="FTA"].id',
    'Certified Exporter Auth': 'supportingDocuments[documentType="export_auth"].id',
    'Shipment ID': 'supportingDocuments[documentType="shipment"].id',
    'Shipment Amount': 'extensions.my_shipmentAmount',
    'Shipment Charge Reason': 'extensions.my_shipmentChargeReason',
  },

  SA: {
    // Meta fields
    'Source name': 'meta.source.name',
    'Source Version': 'meta.source.version',

    // Header fields
    'Document Type': 'invoiceTypeFromExcel',
    'Document ID': 'header.documentNumber',
    Currency: 'header.currency',
    'Exchange rate': 'header.exchangeRate.rate',
    'VAT Currency': 'header.taxCurrency',
    'Issue Date': 'header.issueDate',
    'Issue Time': 'header.issueTime',
    'Supply Start Date': 'header.invoicePeriod.startDate',
    'Supply End Date': 'header.invoicePeriod.endDate',
    'Billing Frequency': 'extensions.ksa_billingFrequency',
    'Due Date': 'payment.paymentDueDate',
    'Reference Invoice Number': 'header.referenceId',
    'Note Issuance Reason': 'header.noteIssuanceReason',

    // Seller fields
    'Seller ID': 'parties.seller.partyId',
    'Seller Name': 'parties.seller.name',
    'VAT Number': 'parties.seller.taxIds[type="VAT"].value',
    'Group VAT Number': 'parties.seller.taxIds[type="VAT"].value',
    'Additional Seller ID Type': 'parties.seller.registrationNumbers[].type',
    'Additional Seller ID Number': 'parties.seller.registrationNumbers[].value',

    // Seller Address
    'Address Line 1': 'parties.seller.address.addressLine1',
    'Address Line 2': 'parties.seller.address.addressLine2',
    'Building Number': 'parties.seller.address.additionalAddressData.buildingNumber',
    'Additional Number': 'parties.seller.address.additionalAddressData.additionalbuildingNumber',
    'District/Neighbourhood': 'parties.seller.address.additionalAddressData.district',
    City: 'parties.seller.address.city',
    State: 'parties.seller.address.stateOrProvince',
    'Zip Code': 'parties.seller.address.postalCode',
    Country: 'parties.seller.address.country',

    // Buyer fields
    'Buyer ID': 'parties.buyer.partyId',
    'Buyer Name': 'parties.buyer.name',
    'Buyer VAT Number': 'parties.buyer.taxIds[type="VAT"].value',
    'Buyer Group VAT Number': 'parties.buyer.taxIds[type="VAT"].value',
    'Additional Buyer ID Type': 'parties.buyer.registrationNumbers[].type',
    'Additional Buyer ID Number': 'parties.buyer.registrationNumbers[].value',

    // Buyer Address
    'Buyer Address Line 1': 'parties.buyer.address.addressLine1',
    'Buyer Address Line 2': 'parties.buyer.address.addressLine2',
    'Buyer Building Number': 'parties.buyer.address.additionalAddressData.buildingNumber',
    'Buyer Additional Number':
      'parties.buyer.address.additionalAddressData.additionalBuildingNumber',
    'Buyer District/Neighbourhood': 'parties.buyer.address.additionalAddressData.district',
    'Buyer City': 'parties.buyer.address.city',
    'Buyer State': 'parties.buyer.address.stateOrProvince',
    'Buyer Zip Code': 'parties.buyer.address.postalCode',
    'Buyer Country': 'parties.buyer.address.country',

    // Line Items
    'Line Item ID': 'lineItems[].id',
    'Line Item Type': 'lineItems[].lineType',
    'Item Description': 'lineItems[].description',
    'Unit Price': 'lineItems[].price.amount',
    'Discount per Unit': 'lineItems[].discountsOrCharges[isCharge=false].amount',
    'Net Unit Price': 'lineItems[].netPrice',
    'Line Item Qty': 'lineItems[].quantity',
    'Units of Measurement': 'lineItems[].unitCode',
    Charges: 'lineItems[].discountsOrCharges[isCharge=true].amount',
    'Line Item Discount': 'lineItems[].discountsOrCharges[isCharge=false].amount',
    'Line Item Taxable Amount': 'lineItems[].lineTaxableValue',
    'VAT Category Code': 'lineItems[].taxCategory',
    'VAT Exemption Reason Code': 'lineItems[].taxExemptionReasonCode',
    'VAT Exemption Reason Text': 'lineItems[].taxExemptionReason',
    'VAT Rate On Line Item': 'lineItems[].taxRate',
    'Line Item VAT Amount': 'lineItems[].taxAmount',
    'Line Item Sub Total': 'lineItems[].lineTotal',

    // Payment
    'Payment Means': 'payment.paymentMeans[].paymentMeansCode',
    'Payment Terms': 'payment.paymentTerms[].note',
    'Payee Account Number': 'payment.paymentMeans[].creditTransferInfo.payeeFinancialAccountId',

    // Summary/Totals
    'Summation of Line Taxable Values': 'totals.totalLineTaxableAmount',
    'Discount at document level': 'totals.totalAllowances',
    'Total Taxable Amount Excluding VAT': 'totals.totalAmountExcludingTax',
    'VAT Total': 'totals.totalTaxAmount',
    'Invoice Total Amount': 'totals.totalAmountIncludingTax',
    'Pre-Paid Amount': 'totals.prepaidAmount',
    'Amount Due for Payment': 'totals.amountDue',
    'Rounding Amount': 'totals.roundingAmount',

    // Prepayment Details
    'Prepayment ID': 'extensions.sa_prepayment[].paymentId',
    'Prepayment Issue Date': 'extensions.sa_prepayment[].issueDate',
    'Prepayment Issue Time': 'extensions.sa_prepayment[].issueTime',
    'Prepayment VAT Category Code': 'extensions.sa_prepayment[].taxCategory',
    'Prepayment VAT Rate': 'extensions.sa_prepayment[].taxRate',
    'Prepayment Taxable Amount': 'extensions.sa_prepayment[].taxableAmount',
    'Prepayment Tax Amount': 'extensions.sa_prepayment[].taxAmount',
    'Prepayment Adjustment Amount': 'extensions.sa_prepayment[].adjustmentAmount',
    'Prepayment Paid Amount': 'extensions.sa_prepayment[].paidAmount',
  },

  BE: {
    // Meta fields
    'Source Name': 'meta.source.name',
    'Source Version': 'meta.source.version',

    // Header fields
    'Document Type Code': 'invoiceTypeFromExcel',
    'Document Number': 'header.documentNumber',
    'Reference Invoice ID': 'header.referenceId',
    'Issue Date': 'header.issueDate',
    'Issue Time': 'header.issueTime',
    Currency: 'header.currency',
    'Tax Currency': 'header.taxCurrency',
    'Period Start Date': 'header.invoicePeriod.startDate',
    'Period End Date': 'header.invoicePeriod.endDate',
    'Due Date': 'payment.paymentDueDate',
    'Order Reference': 'header.orderReference',
    'Note Issuance Reason': 'header.note',

    // Seller fields
    'Seller Peppol ID': 'parties.seller.peppolId',
    'Seller Name': 'parties.seller.name',
    'Seller Trading Name': 'parties.seller.tradingName',
    'Seller VAT Number': 'parties.seller.taxIds[type="VAT"].value',
    'Seller Registration Type': 'parties.seller.registrationNumbers[].type',
    'Seller Registration Number': 'parties.seller.registrationNumbers[].value',
    'Seller Legal Form': 'parties.seller.legalForm',
    'Seller Street Name': 'parties.seller.address.addressLine1',
    'Seller Building Number': 'parties.seller.address.buildingNumber',
    'Seller Additional Address': 'parties.seller.address.addressLine2',
    'Seller City': 'parties.seller.address.city',
    'Seller Province': 'parties.seller.address.stateOrProvince',
    'Seller Postal Code': 'parties.seller.address.postalCode',
    'Seller Country': 'parties.seller.address.country',
    'Seller Email': 'parties.seller.contact.email',
    'Seller Phone': 'parties.seller.contact.phone',

    // Buyer fields
    'Buyer Peppol ID': 'parties.buyer.peppolId',
    'Buyer Name': 'parties.buyer.name',
    'Buyer VAT Number': 'parties.buyer.taxIds[type="VAT"].value',
    'Buyer Registration Type': 'parties.buyer.registrationNumbers[].type',
    'Buyer Registration Number': 'parties.buyer.registrationNumbers[].value',
    'Buyer Street Name': 'parties.buyer.address.addressLine1',
    'Buyer Building Number': 'parties.buyer.address.buildingNumber',
    'Buyer Additional Address': 'parties.buyer.address.addressLine2',
    'Buyer City': 'parties.buyer.address.city',
    'Buyer Province': 'parties.buyer.address.stateOrProvince',
    'Buyer Postal Code': 'parties.buyer.address.postalCode',
    'Buyer Country': 'parties.buyer.address.country',
    'Buyer Email': 'parties.buyer.contact.email',
    'Buyer Phone': 'parties.buyer.contact.phone',

    // Business Configuration Flags
    'Is B2B': 'meta.config.isB2B',
    'Is B2C': 'meta.config.isB2C',
    'Is B2G': 'meta.config.isB2G',
    'Is Intra-EU': 'meta.config.isIntraEU',
    'Is Export': 'meta.config.isExport',
    'Is Import': 'meta.config.isImport',
    'Is Reverse Charge': 'meta.config.isReverseCharge',
    'Is Triangulation': 'meta.config.isTriangulation',
    'Is Peppol Compliant': 'meta.config.isPeppolCompliant',
    'Is Self Billed': 'meta.config.isSelfBilled',

    // Line Items
    'Line ID': 'lineItems[].id',
    'Line Name': 'lineItems[].name',
    'Line Description': 'lineItems[].description',
    'Line Quantity': 'lineItems[].quantity',
    'Line Unit Code': 'lineItems[].unitCode',
    'Line Unit Price': 'lineItems[].price.amount',
    'Line Discount Amount': 'lineItems[].discountsOrCharges[isCharge=false].amount',
    'Line Tax Category': 'lineItems[].taxCategory',
    'Line Tax Rate': 'lineItems[].taxRate',
    'Line Tax Exemption Code': 'lineItems[].taxExemptionReasonCode',
    'Line Tax Exemption Reason': 'lineItems[].taxExemptionReason',
    'Line Line Total Ex Tax': 'lineItems[].lineTaxableValue',

    // Payment Details
    'Payment Means Code': 'payment.paymentMeans[].paymentMeansCode',
    'Payment ID': 'payment.paymentMeans[].paymentId',
    'Payee IBAN': 'payment.paymentMeans[].creditTransferInfo.payeeFinancialAccountId',
    'Payee BIC': 'payment.paymentMeans[].creditTransferInfo.bic',
    'Payee Account Name': 'payment.paymentMeans[].creditTransferInfo.accountName',
    'Payment Terms Note': 'payment.paymentTerms[].note',
    'Payment Instruction': 'payment.paymentTerms[].instruction',
    'Settlement Discount %': 'payment.paymentTerms[].settlementDiscountPercent',
    'Penalty Surcharge %': 'payment.paymentTerms[].penaltySurchargePercent',

    // Summary/Totals
    'Total Line Taxable Amount': 'totals.totalLineTaxableAmount',
    'Total Allowances': 'totals.totalAllowances',
    'Total Charges': 'totals.totalCharges',
    'Total Amount Ex Tax': 'totals.totalAmountExcludingTax',
    'Total Tax Amount': 'totals.totalTaxAmount',
    'Total Amount Inc Tax': 'totals.totalAmountIncludingTax',
    'Prepaid Amount': 'totals.prepaidAmount',
    'Amount Due': 'totals.amountDue',
    'Rounding Amount': 'totals.roundingAmount',

    // Destination fields
    'Desitnation 1': 'destinations[0].details',
    'Destination 2': 'destinations[1].details',
  },

  DE: {
    // Meta fields
    'Source Name': 'meta.source.name',
    'Source Version': 'meta.source.version',

    // Header fields
    'Invoice number': 'header.documentNumber',
    'Invoice issue date': 'header.issueDate',
    'Invoice type code': 'invoiceTypeFromExcel',
    'Currency code': 'header.currency',
    'VAT accounting currency': 'header.taxCurrency',
    'VAT point date': 'extensions.de_vatPointDate',
    'VAT point date code': 'extensions.de_vatPointDateCode',
    'Payment due date': 'header.dueDate',
    'Buyer reference': 'header.referenceNumbers[0]',
    'Invoiced object identifier': 'extensions.de_invoicedObjectId',
    'Buyer accounting reference': 'extensions.de_buyerAccountingRef',
    'Payment terms': 'payment.paymentTerms[0].note',
    'Invoice note': 'header.additionalNotes',
    'Invoice note subject code': 'extensions.de_noteSubjectCode',

    // Seller fields
    'Seller name': 'parties.seller.name',
    'Seller trading name': 'parties.seller.tradeName',
    'Seller identifier': 'parties.seller.partyId',
    'Seller legal registration identifier': 'parties.seller.registrationNumbers[0].value',
    'Seller VAT identifier': 'parties.seller.taxIds[0].value',
    'Seller tax registration identifier': 'parties.seller.taxIds[1].value',
    'Seller additional legal information': 'extensions.de_sellerLegalInfo',
    'Seller electronic address': 'parties.seller.peppolId',
    'Seller electronic address scheme': 'extensions.de_sellerElectronicAddressScheme',
    'Seller address line 1': 'parties.seller.address.addressLine1',
    'Seller address line 2': 'parties.seller.address.addressLine2',
    'Seller address line 3': 'parties.seller.address.addressLine3',
    'Seller city': 'parties.seller.address.city',
    'Seller post code': 'parties.seller.address.postalCode',
    'Seller country code': 'parties.seller.address.country',
    'Seller contact point': 'parties.seller.contact.name',
    'Seller contact telephone': 'parties.seller.contact.telephone',
    'Seller contact email': 'parties.seller.contact.email',

    // Buyer fields
    'Buyer name': 'parties.buyer.name',
    'Buyer trading name': 'parties.buyer.tradeName',
    'Buyer identifier': 'parties.buyer.partyId',
    'Buyer legal registration identifier': 'parties.buyer.registrationNumbers[0].value',
    'Buyer VAT identifier': 'parties.buyer.taxIds[0].value',
    'Buyer tax registration identifier': 'parties.buyer.taxIds[1].value',
    'Buyer electronic address': 'parties.buyer.peppolId',
    'Buyer electronic address scheme': 'extensions.de_buyerElectronicAddressScheme',
    'Buyer address line 1': 'parties.buyer.address.addressLine1',
    'Buyer address line 2': 'parties.buyer.address.addressLine2',
    'Buyer address line 3': 'parties.buyer.address.addressLine3',
    'Buyer city': 'parties.buyer.address.city',
    'Buyer post code': 'parties.buyer.address.postalCode',
    'Buyer country code': 'parties.buyer.address.country',
    'Buyer contact point': 'parties.buyer.contact.name',
    'Buyer contact telephone': 'parties.buyer.contact.telephone',
    'Buyer contact email': 'parties.buyer.contact.email',

    // Delivery fields
    'Delivery actual date': 'parties.delivery.deliveries[0].actualDeliveryDate',
    'Delivery location identifier': 'parties.delivery.partyId',
    'Delivery address line 1': 'parties.delivery.address.addressLine1',
    'Delivery address line 2': 'parties.delivery.address.addressLine2',
    'Delivery address line 3': 'parties.delivery.address.addressLine3',
    'Delivery city': 'parties.delivery.address.city',
    'Delivery post code': 'parties.delivery.address.postalCode',
    'Delivery country code': 'parties.delivery.address.country',

    // Payee fields
    'Payee name': 'parties.payee.name',
    'Payee identifier': 'parties.payee.partyId',
    'Payee legal registration identifier': 'parties.payee.registrationNumbers[0].value',
    'Payee VAT identifier': 'parties.payee.taxIds[0].value',

    // Payment Details
    'Payment means code': 'payment.paymentMeans[0].paymentMeansCode',
    'Payment means text': 'payment.paymentMeans[0].paymentMeansText',
    'Payment account identifier':
      'payment.paymentMeans[0].creditTransferInfo.payeeFinancialAccountId',
    'Payment account name': 'payment.paymentMeans[0].creditTransferInfo.payeeFinancialAccountName',
    'Payment service provider identifier':
      'payment.paymentMeans[0].creditTransferInfo.payeeFinancialInstitutionBranch',

    // Line Items
    'Invoice line identifier': 'lineItems[].id',
    'Invoiced quantity': 'lineItems[].quantity',
    'Invoiced quantity unit code': 'lineItems[].unitCode',
    'Line net amount': 'lineItems[].lineTotal',
    'Line allowance amount': 'lineItems[].allowancesCharges[type="allowance"].amount',
    'Line allowance reason': 'lineItems[].allowancesCharges[type="allowance"].reason',
    'Line allowance reason code': 'lineItems[].allowancesCharges[type="allowance"].reasonCode',
    'Line charge amount': 'lineItems[].allowancesCharges[type="charge"].amount',
    'Line charge reason': 'lineItems[].allowancesCharges[type="charge"].reason',
    'Line charge reason code': 'lineItems[].allowancesCharges[type="charge"].reasonCode',
    'Item net price': 'lineItems[].price.amount',
    'Item price discount': 'lineItems[].discountsOrCharges[0].amount',
    'Item gross price': 'lineItems[].customFields.grossPrice',
    'Item price base quantity': 'lineItems[].price.baseQuantity',
    'Item price base quantity unit': 'lineItems[].price.baseQuantityUnitCode',
    'Invoiced item VAT category code': 'lineItems[].taxCategory',
    'Invoiced item VAT rate': 'lineItems[].taxRate',
    'Item name': 'lineItems[].name',
    'Item description': 'lineItems[].description',
    'Item sellers identifier': 'lineItems[].sellerItemCode',
    'Item buyers identifier': 'lineItems[].buyerItemCode',
    'Item standard identifier': 'lineItems[].standardItemCode.id',
    'Item classification identifier': 'lineItems[].commodityClassification.code',
    'Item country of origin': 'lineItems[].originCountry',

    // Supporting Documents
    'Project reference': 'supportingDocuments[type:"projectReference"].id',
    'Contract reference': 'supportingDocuments[type:"contractReference"].id',
    'Contract value': 'supportingDocuments[type:"contractValue"].id',
    'Purchase order reference': 'supportingDocuments[type:"purchaseOrderReference"].id',
    'Sales order reference': 'supportingDocuments[type:"salesOrderReference"].id',
    'Receiving advice reference': 'supportingDocuments[type:"receivingAdviceReference"].id',
    'Despatch advice reference': 'supportingDocuments[type:"despatchAdviceReference"].id',
    'Tender or lot reference': 'supportingDocuments[type:"tenderReference"].id',
    'Customs reference number': 'supportingDocuments[type:"customsReferenceNumber"].id',
    'Supporting document reference': 'supportingDocuments[].id',
    'Supporting document description': 'supportingDocuments[].documentDescription',
    'External document location': 'supportingDocuments[].referenceUrl',
    'Attached document': 'supportingDocuments[].attachments[].content',
    'Attached document filename': 'supportingDocuments[].attachments[].filename',
  },
};

// Helper function to get mapping for a specific country
export function getInvoiceMapping(country: string): InvoiceMapping {
  const mapping = countryMappings[country];
  if (!mapping) {
    throw new Error(
      `No mapping found for country: ${country}. Available countries: ${Object.keys(countryMappings).join(', ')}`
    );
  }
  return mapping;
}

// Helper function to get all supported countries
export function getSupportedCountries(): string[] {
  return Object.keys(countryMappings);
}

export default countryMappings;
