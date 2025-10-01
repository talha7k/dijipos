// Re-export all types from organized modules
export * from "./product-service";
export * from "./pos-order";
export * from "./invoice-quote";
export * from "./template";
export * from "./organization-user";
export * from "./customer-supplier";
export * from "./settings";
export * from "./reports";

// Export enums from the main enums file (avoiding duplicates)
export * from "./enums";

// Import Item for legacy type aliases
import { Item } from "./product-service";

// Legacy type aliases for backward compatibility
export type Product = Item;
export type Service = Item;
