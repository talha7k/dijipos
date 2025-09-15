import { indexedDBStorage } from './storage';
import { repairIndexedDB } from './indexeddb-utils';

export const testIndexedDB = async (): Promise<boolean> => {
  console.log('Testing IndexedDB functionality...');
  
  try {
    // Test write
    await indexedDBStorage.setItem('test-key', 'test-value');
    console.log('✓ Write test passed');
    
    // Test read
    const value = await indexedDBStorage.getItem('test-key');
    if (value === 'test-value') {
      console.log('✓ Read test passed');
    } else {
      console.error('✗ Read test failed: expected "test-value", got', value);
      return false;
    }
    
    // Test delete
    await indexedDBStorage.removeItem('test-key');
    const deletedValue = await indexedDBStorage.getItem('test-key');
    if (deletedValue === null) {
      console.log('✓ Delete test passed');
    } else {
      console.error('✗ Delete test failed: expected null, got', deletedValue);
      return false;
    }
    
    console.log('✓ All IndexedDB tests passed');
    return true;
  } catch (error) {
    console.error('✗ IndexedDB test failed:', error);
    return false;
  }
};

export const attemptIndexedDBRepair = async (): Promise<boolean> => {
  console.log('Attempting to repair IndexedDB...');
  
  // First try to repair
  const repairResult = await repairIndexedDB();
  if (repairResult) {
    console.log('✓ IndexedDB repair successful');
    
    // Test after repair
    const testResult = await testIndexedDB();
    return testResult;
  } else {
    console.error('✗ IndexedDB repair failed');
    return false;
  }
};

// Auto-repair on load if needed
export const autoRepairIndexedDB = async (): Promise<void> => {
  console.log('Checking IndexedDB health...');
  
  const testResult = await testIndexedDB();
  if (!testResult) {
    console.log('IndexedDB issues detected, attempting auto-repair...');
    await attemptIndexedDBRepair();
  } else {
    console.log('IndexedDB is healthy');
  }
};