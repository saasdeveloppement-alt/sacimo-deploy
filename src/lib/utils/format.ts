export const formatPrice = (value?: number | null): string => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "Prix indisponible"
  }

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value)
}

export const formatSurface = (value?: number | null): string => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "Surface N/A"
  }

  return `${value} m²`
}

export const truncateText = (value: string, maxLength: number = 120): string => {
  if (!value) {
    return ""
  }

  return value.length <= maxLength ? value : `${value.slice(0, maxLength)}...`
}

