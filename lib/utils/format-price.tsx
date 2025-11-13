export function formatPrice(priceInUSD: number): string {
  const priceInCLP = priceInUSD * 950 // Approximate conversion rate: 1 USD = 950 CLP

  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceInCLP)
}
// </CHANGE>
