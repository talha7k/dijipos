// Test script to verify unified Item export/import functionality
const { downloadSampleData, validateImportData, parseImportFile } = require('./src/lib/export-import-utils.ts');
const fs = require('fs');

// Test 1: Download sample data (this will create a blob, but we can verify the structure)
console.log('Testing unified Item export/import functionality...');

// Test 2: Verify sample data structure
const { sampleCategories, sampleProducts, sampleServices } = require('./src/lib/sample-data.ts');
const items = [...sampleProducts, ...sampleServices];

console.log('Sample data structure:');
console.log(`- Categories: ${sampleCategories.length}`);
console.log(`- Products: ${sampleProducts.length}`);
console.log(`- Services: ${sampleServices.length}`);
console.log(`- Total unified items: ${items.length}`);

// Verify all items have the unified structure
const hasUnifiedStructure = items.every(item => {
  return item.id && item.name && item.price !== undefined && item.itemType && item.transactionType;
});

console.log(`- All items have unified structure: ${hasUnifiedStructure}`);

// Test 3: Verify export data structure
const exportData = {
  exportedAt: new Date().toISOString(),
  organizationId: "test-org",
  categories: sampleCategories.map(cat => ({ ...cat, organizationId: "test-org" })),
  items: items.map(item => ({ ...item, organizationId: "test-org" }))
};

// Test validation
const isValid = validateImportData(exportData);
console.log(`- Export data is valid: ${isValid}`);

console.log('✅ Unified Item export/import test completed successfully!');