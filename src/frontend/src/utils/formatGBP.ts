export function formatGBP(pence: bigint): string {
  const pounds = Number(pence) / 100;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(pounds);
}
