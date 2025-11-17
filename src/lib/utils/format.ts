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

export const formatPublishedAt = (date: string | Date): string => {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    if (Number.isNaN(dateObj.getTime())) {
      return "Date N/A"
    }
    return dateObj.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch {
    return "Date N/A"
  }
}

export const formatCityLine = (
  surface: number | null | undefined,
  city: string,
  postalCode: string | null | undefined,
): string => {
  const surfaceStr = formatSurface(surface)
  const location = postalCode ? `${city} ${postalCode}` : city
  return `${surfaceStr} – ${location}`
}

export const formatTransactionBadge = (annonce: {
  title?: string
  price?: number
}): { label: string; variant: "sale" | "rent" } => {
  const title = (annonce.title || "").toLowerCase()
  
  // Détecter location
  if (
    title.includes("location") ||
    title.includes("louer") ||
    title.includes("loué") ||
    title.includes("/mois") ||
    title.includes("loyer")
  ) {
    return { label: "Location", variant: "rent" }
  }
  
  // Par défaut : vente
  return { label: "Vente", variant: "sale" }
}

export const formatTypeLabel = (annonce: {
  title?: string
}): string => {
  const title = (annonce.title || "").toLowerCase()
  
  if (title.includes("appartement") || title.includes("appt") || title.includes("apt")) {
    return "Appartement"
  }
  
  if (title.includes("maison") || title.includes("villa")) {
    return "Maison"
  }
  
  if (title.includes("studio")) {
    return "Studio"
  }
  
  if (title.includes("loft")) {
    return "Loft"
  }
  
  if (title.includes("terrain")) {
    return "Terrain"
  }
  
  if (title.includes("bureau") || title.includes("local commercial")) {
    return "Bureau"
  }
  
  // Par défaut
  return "Bien immobilier"
}


