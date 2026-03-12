// Customer CSV export utilities

import type { Customer } from "./customerStorage";

// Generate CSV content from customers
export function generateCustomerCSV(customers: Customer[]): string {
  // CSV header
  const header = "Name,Phone,Created At,Updated At";

  // CSV rows
  const rows = customers.map((customer) => {
    const name = escapeCSVField(customer.name);
    const phone = escapeCSVField(customer.phone);
    const createdAt = escapeCSVField(formatDateTime(customer.createdAt));
    const updatedAt = escapeCSVField(formatDateTime(customer.updatedAt));

    return `${name},${phone},${createdAt},${updatedAt}`;
  });

  return [header, ...rows].join("\n");
}

// Escape CSV field (handle commas, quotes, newlines)
function escapeCSVField(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

// Format ISO date string to readable format
function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

// Download CSV file
export function downloadCustomerCSV(customers: Customer[]): void {
  const csv = generateCustomerCSV(customers);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `customers-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

// Copy CSV to clipboard
export async function copyCustomerCSVToClipboard(
  customers: Customer[],
): Promise<void> {
  const csv = generateCustomerCSV(customers);
  await navigator.clipboard.writeText(csv);
}
