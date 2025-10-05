/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ReceiptTemplateData,
  InvoiceTemplateData,
} from "@/types/template";

// A generic type to accept data for any kind of template.
export type TemplateData = ReceiptTemplateData | InvoiceTemplateData | Record<string, any>;

export type { ReceiptTemplateData };

/**
 * A generic and robust template rendering engine.
 * Replaces placeholders for variables, conditionals, and loops in a template string.
 *
 * @param template The HTML template string.
 * @param data The data object to inject into the template.
 * @returns The final rendered HTML string.
 */
export function renderTemplate(template: string, data: TemplateData): string {
  let result = template;

  // 1. Handle simple variables like {{ name }} or {{ total }}
  // The \s* handles any accidental whitespace like {{ name }}
  // Updated regex to handle variable names with dots, underscores, and alphanumeric characters
  result = result.replace(/{{\s*([a-zA-Z_][a-zA-Z0-9_.]*)\s*}}/g, (match, key) => {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key as keyof TemplateData];
      return String(value ?? ""); // Use the value or an empty string if null/undefined
    }
    return match; // Return the original placeholder if key not found
  });

  // 2. Handle conditional blocks like {{#if variable}}...{{/if}}
  result = result.replace(
    /{{#if ([a-zA-Z_][a-zA-Z0-9_.]*)}}([\s\S]*?){{\/if}}/g,
    (match, variable, content) => {
      const value = (data as any)[variable];
      // Show content if the value is truthy (e.g., not null, not false, not empty string)
      // or if it's an array with items.
      if (Array.isArray(value)) {
        return value.length > 0 ? content : "";
      }
      return value ? content : "";
    },
  );

  // 2b. Handle conditional blocks like {{#variable}}...{{/variable}}
  result = result.replace(
    /{{#([a-zA-Z_][a-zA-Z0-9_.]*)}}([\s\S]*?){{\/\1}}/g,
    (match, variable, content) => {
      const value = data[variable as keyof TemplateData];
      // Show content if the value is truthy (e.g., not null, not false, not empty string)
      // or if it's an array with items.
      if (Array.isArray(value)) {
        return value.length > 0 ? content : "";
      }
      return value ? content : "";
    },
  );

  // 3. Handle loops for items: {{#each items}}...{{/each}}
  result = result.replace(
    /{{#each items}}([\s\S]*?){{\/each}}/g,
    (match, itemTemplate) => {
      const items = (data as any).items;
      if (!items || !Array.isArray(items)) return "";
      return items
        .map((item: Record<string, unknown>, index: number) =>
        itemTemplate.replace(
          /{{\s*([a-zA-Z0-9_@]+)\s*}}/g,
          (itemMatch: string, key: string) => {
            if (key === '@index') {
              return String(index + 1);
            }
              if (Object.prototype.hasOwnProperty.call(item, key)) {
                return String(item[key] ?? "");
              }
              return itemMatch;
            },
          ),
        )
        .join("");
    },
  );

  // 4. Handle loops for payments: {{#each payments}}...{{/each}}
  result = result.replace(
    /{{#each payments}}([\s\S]*?){{\/each}}/g,
    (match, paymentTemplate) => {
      const payments = (data as any).payments;
      if (!payments || !Array.isArray(payments)) return "";
      return payments
        .map((payment: { paymentType: string; amount: string }) =>
          paymentTemplate
            .replace(/{{\s*paymentType\s*}}/g, payment.paymentType)
            .replace(/{{\s*amount\s*}}/g, payment.amount),
        )
        .join("");
    },
  );

  // 5. Handle general loops: {{#each variable}}...{{/each}}
  result = result.replace(
    /{{#each ([a-zA-Z_][a-zA-Z0-9_.]*)}}([\s\S]*?){{\/each}}/g,
    (match, variable, content) => {
      const value = (data as any)[variable];
      if (!value || typeof value !== 'object') return "";
      if (Array.isArray(value)) {
        return value
          .map((item: any, index: number) =>
            content
              .replace(/{{\s*@index\s*}}/g, String(index))
              .replace(/{{\s*this\.([a-zA-Z_][a-zA-Z0-9_.]*)\s*}}/g, (_match: string, prop: string) => String(item[prop] ?? ""))
          )
          .join("");
      } else {
        return Object.entries(value as Record<string, unknown>)
          .map(([key, val]) =>
            content.replace(/{{\s*@key\s*}}/g, key).replace(/{{\s*this\s*}}/g, String(val ?? ""))
          )
          .join("");
      }
    },
  );

  return result;
}
