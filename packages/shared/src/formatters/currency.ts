const VND_CURRENCY_FORMATTER = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const VND_NUMBER_FORMATTER = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 0,
});

export function formatCurrencyVnd(value: number) {
  return VND_CURRENCY_FORMATTER.format(value);
}

export function formatVnd(value: number) {
  return formatCurrencyVnd(value);
}

export function formatNumber(value: number) {
  return VND_NUMBER_FORMATTER.format(value);
}
