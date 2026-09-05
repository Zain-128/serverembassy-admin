export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export function titleCaseStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function titleCaseTaxExempt(value: string) {
  if (value === "none") return "None";
  return value.charAt(0).toUpperCase() + value.slice(1);
}
