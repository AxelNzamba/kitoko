export type InsightSale = {
  total_ht: number;
  total_ttc: number;
  total_tva: number;
  client_name: string | null;
  payment_mode: string;
  created_at: string;
};

export function summarizeSales(sales: InsightSale[], expenses: { amount: number }[]) {
  const ttc = sales.reduce((sum, sale) => sum + Number(sale.total_ttc), 0);
  const ht = sales.reduce((sum, sale) => sum + Number(sale.total_ht), 0);
  const tva = sales.reduce((sum, sale) => sum + Number(sale.total_tva), 0);
  const spending = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  return { ttc, ht, tva, spending, count: sales.length, average: sales.length ? ttc / sales.length : 0 };
}

export function remainingQuantity(items: { quantity_ordered: number; quantity_received: number }[]) {
  return items.reduce((sum, item) => sum + Math.max(0, Number(item.quantity_ordered) - Number(item.quantity_received)), 0);
}

export function clientSearchFilter(search: string) {
  const pattern = `%${search.trim().replace(/[\\%_]/g, "\\$&")}%`;
  return ["name", "company", "phone", "email"].map((column) => `${column}.ilike.${JSON.stringify(pattern)}`).join(",");
}

export const paymentLabels: Record<string, string> = {
  especes: "Espèces", mobile_money: "Mobile Money", carte: "Carte bancaire",
  virement: "Virement", cheque: "Chèque", credit: "Crédit",
};