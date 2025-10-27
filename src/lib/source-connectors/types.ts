export interface SearchParams {
  postalCodes: string[]
  priceMin?: number
  priceMax?: number
  types: string[]
  surfaceMin?: number
  surfaceMax?: number
  roomsMin?: number
  roomsMax?: number
  textSearch?: string
}

export interface ListingData {
  id: string
  source: string
  isPrivateSeller: boolean
  title: string
  price: number
  type: string
  surface?: number
  rooms?: number
  photos: string[]
  city: string
  postalCode: string
  geo?: { lat: number; lng: number }
  publishedAt: Date
  url: string
  description?: string
}

export interface SourceConnector {
  name: string
  baseUrl: string
  searchListings(params: SearchParams): Promise<ListingData[]>
  getListingDetails(url: string): Promise<ListingData | null>
  isHealthy(): Promise<boolean>
}

export interface ScrapingResult {
  success: boolean
  listings: ListingData[]
  errors: string[]
  scrapedAt: Date
  source: string
}





