export const clearIndexedDB = async (): Promise<boolean> => {
  try {
    if (!('indexedDB' in window) || !indexedDB.databases) {
      console.error('IndexedDB not supported or databases() not available');
      return false;
    }
    
    const databases = await indexedDB.databases();
    
    for (const db of databases) {
      if (db.name && db.name.startsWith('dijibill-')) {
        await new Promise<void>((resolve, reject) => {
          const request = indexedDB.deleteDatabase(db.name!);
          
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
          request.onblocked = () => {
            console.warn(`Database ${db.name} is blocked, waiting...`);
            setTimeout(() => resolve(), 1000);
          };
        });
      }
    }
    
    console.log('IndexedDB databases cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing IndexedDB:', error);
    return false;
  }
};

export const checkIndexedDBSupport = (): boolean => {
  try {
    return 'indexedDB' in window && indexedDB !== null;
  } catch {
    return false;
  }
};

export const repairIndexedDB = async (): Promise<boolean> => {
  if (!checkIndexedDBSupport()) {
    console.error('IndexedDB is not supported in this browser');
    return false;
  }

  try {
    await clearIndexedDB();
    
    // Test creating a new database
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('dijibill-test', 1);
      
      request.onsuccess = () => {
        request.result.close();
        resolve();
      };
      
      request.onerror = () => reject(request.error);
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('test-store')) {
          db.createObjectStore('test-store');
        }
      };
    });
    
    // Clean up test database
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase('dijibill-test');
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    console.log('IndexedDB repair completed successfully');
    return true;
  } catch (error) {
    console.error('Failed to repair IndexedDB:', error);
    return false;
  }
};