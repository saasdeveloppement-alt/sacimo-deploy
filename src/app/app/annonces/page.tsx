import Link from "next/link"
import { 
  formatPrice,
  formatSurface,
  truncateText,
  formatPublishedAt,
  formatCityLine,
  formatTransactionBadge,
  formatTypeLabel,
} from "@/lib/utils/format"

type SearchParamsPromise = Promise<Record<string, string>>

interface Annonce {
  id: string
  title: string
  price: number
  surface: number | null
  rooms: number | null
  postalCode: string | null
  city: string
  url: string
  images?: string[]
  picturesRemote?: string[]
  pictures?: string[]
  description: string | null
  publishedAt: string
}

interface ApiResponse {
  data: Annonce[]
  total: number
  page: number
  pages: number
}

interface Filters {
  ville?: string
  postalCode?: string
  type?: string
  prixMin?: number
  prixMax?: number
  surfaceMin?: number
  surfaceMax?: number
}

const appBaseUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

const getParam = (params: URLSearchParams, key: string): string | undefined => {
  const value = params.get(key)
  return value ? value.trim() : undefined
}

const getNumberParam = (params: URLSearchParams, key: string): number | undefined => {
  const value = params.get(key)
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

const buildQueryString = (filters: Filters, page: number, limit: number): URLSearchParams => {
      const params = new URLSearchParams()
  if (filters.ville) params.set("ville", filters.ville)
  if (filters.postalCode) params.set("postalCode", filters.postalCode)
  if (filters.type) params.set("type", filters.type)
  if (filters.prixMin !== undefined) params.set("prixMin", String(filters.prixMin))
  if (filters.prixMax !== undefined) params.set("prixMax", String(filters.prixMax))
  if (filters.surfaceMin !== undefined) params.set("surfaceMin", String(filters.surfaceMin))
  if (filters.surfaceMax !== undefined) params.set("surfaceMax", String(filters.surfaceMax))
  params.set("page", page.toString())
  params.set("limit", limit.toString())
  return params
}

async function fetchAnnonces(filters: Filters, page: number, limit: number): Promise<ApiResponse> {
  const queryString = buildQueryString(filters, page, limit).toString()
  const response = await fetch(`${appBaseUrl}/api/annonces?${queryString}`, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Impossible de charger les annonces")
  }

  return response.json()
}

const buildPaginationLink = (
  baseParams: URLSearchParams,
  page: number,
  limit: number,
): string => {
  const params = new URLSearchParams(baseParams.toString())
  params.set("page", page.toString())
  params.set("limit", limit.toString())
  return `/app/annonces?${params.toString()}`
}

function getAnnonceImage(annonce: Annonce): string | null {
  if (annonce.images && annonce.images.length > 0) {
    return annonce.images[0]
  }

  if (annonce.picturesRemote && annonce.picturesRemote.length > 0) {
    return annonce.picturesRemote[0]
  }

  if (annonce.pictures && annonce.pictures.length > 0) {
    return annonce.pictures[0]
  }

  return null
}

export default async function AnnoncesPage({
  searchParams,
}: {
  searchParams: SearchParamsPromise
}) {
  const sp = new URLSearchParams(await searchParams)

  const filters: Filters = {
    ville: getParam(sp, "ville"),
    postalCode: getParam(sp, "postalCode"),
    type: getParam(sp, "type"),
    prixMin: getNumberParam(sp, "prixMin"),
    prixMax: getNumberParam(sp, "prixMax"),
    surfaceMin: getNumberParam(sp, "surfaceMin"),
    surfaceMax: getNumberParam(sp, "surfaceMax"),
  }

  const page = getNumberParam(sp, "page") ?? 1
  const limit = getNumberParam(sp, "limit") ?? 20

  const queryForLinks = buildQueryString(filters, page, limit)

  const { data, total, pages } = await fetchAnnonces(filters, page, limit)
  const totalPages = Math.max(1, pages)
  const hasResults = data.length > 0

  const prevPage = page > 1 ? buildPaginationLink(queryForLinks, page - 1, limit) : null
  const nextPage = page < totalPages ? buildPaginationLink(queryForLinks, page + 1, limit) : null

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">SACIMO</p>
        <h1 className="text-3xl font-bold text-gray-900">Annonces immobilières</h1>
        <p className="text-gray-600">
          {total.toLocaleString("fr-FR")} annonces importées depuis Melo.io et stockées dans la base
          SACIMO. Filtrez et explorez librement le stock disponible.
        </p>
          </div>

      <form className="mb-8 grid gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="ville">
            Ville
          </label>
          <input
            id="ville"
            name="ville"
            defaultValue={filters.ville ?? ""}
            placeholder="Paris, Lyon, Cannes..."
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
              </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="prixMin">
            Prix min (€)
          </label>
          <input
            id="prixMin"
            name="prixMin"
            type="number"
            min="0"
            defaultValue={filters.prixMin?.toString() ?? ""}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="prixMax">
            Prix max (€)
          </label>
          <input
            id="prixMax"
            name="prixMax"
            type="number"
            min="0"
            defaultValue={filters.prixMax?.toString() ?? ""}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
                </div>
                
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="surfaceMin">
            Surface min (m²)
          </label>
          <input
            id="surfaceMin"
            name="surfaceMin"
            type="number"
            min="0"
            defaultValue={filters.surfaceMin?.toString() ?? ""}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="surfaceMax">
            Surface max (m²)
          </label>
          <input
            id="surfaceMax"
            name="surfaceMax"
            type="number"
            min="0"
            defaultValue={filters.surfaceMax?.toString() ?? ""}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
                </div>
                
        <div className="lg:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="type">
            Type de bien
          </label>
          <select
            id="type"
            name="type"
            defaultValue={filters.type ?? ""}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
          >
            <option value="">Tous les types</option>
            <option value="appartement">Appartement</option>
            <option value="maison">Maison</option>
          </select>
              </div>
              
        <input type="hidden" name="limit" value={limit.toString()} />

        <div className="flex items-end gap-3 lg:col-span-2">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            Filtrer
          </button>
          <Link
            href="/app/annonces"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Réinitialiser
          </Link>
        </div>
      </form>

      <div className="mb-6 flex items-center justify-between text-sm text-gray-600">
        <span>
          Page {page} / {totalPages} — {total.toLocaleString("fr-FR")}
          {" "}
          résultat{total > 1 ? "s" : ""}
        </span>
        <span>Limite : {limit} annonces / page</span>
      </div>

      {hasResults ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.map((annonce) => {
            const image = getAnnonceImage(annonce)
            const transactionBadge = formatTransactionBadge(annonce)
            const typeLabel = formatTypeLabel(annonce)

            return (
              <article
                key={annonce.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                {/* Image */}
                <div className="relative h-48 w-full bg-gray-100">
                  {image ? (
                    <img
                      src={image}
                      alt={annonce.title || "Photo annonce"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
                      Photo indisponible
                    </div>
                  )}
                  {/* Badge transaction */}
                  <div className="absolute right-2 top-2 z-10">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        transactionBadge.variant === "rent"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {transactionBadge.label}
                    </span>
                  </div>
                </div>

                {/* Contenu */}
                <div className="flex flex-1 flex-col gap-3 p-5">
                  {/* Date et type */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatPublishedAt(annonce.publishedAt)}</span>
                    {typeLabel && (
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-600">
                        {typeLabel}
                      </span>
                    )}
                  </div>

                  {/* Titre */}
                  <h2 className="text-lg font-semibold text-gray-900 leading-tight">
                    {truncateText(annonce.title, 80)}
                  </h2>

                  {/* Prix */}
                  <p className="text-xl font-bold text-primary">{formatPrice(annonce.price)}</p>

                  {/* Surface – Ville CodePostal */}
                  <p className="text-sm text-gray-600">
                    {formatCityLine(annonce.surface, annonce.city, annonce.postalCode)}
                    {annonce.rooms && annonce.rooms > 0 && ` · ${annonce.rooms} pièce${annonce.rooms > 1 ? "s" : ""}`}
                  </p>

                  {/* Bouton */}
                  <div className="mt-auto pt-2">
                    <a
                      href={annonce.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-full justify-center rounded-lg border border-primary/20 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5"
                    >
                      Voir l'annonce
                    </a>
                  </div>
                </div>
              </article>
                      )
                    })}
                  </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center text-gray-500">
          Aucune annonce ne correspond à vos filtres pour le moment.
        </div>
      )}

      <div className="mt-8 flex items-center justify-between gap-4">
        <Link
          href={prevPage ?? "#"}
          aria-disabled={!prevPage}
          className={`inline-flex rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold ${
            prevPage ? "text-gray-700 hover:bg-gray-50" : "cursor-not-allowed text-gray-400"
          }`}
        >
          ← Précédent
        </Link>
        <Link
          href={nextPage ?? "#"}
          aria-disabled={!nextPage}
          className={`inline-flex rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold ${
            nextPage ? "text-gray-700 hover:bg-gray-50" : "cursor-not-allowed text-gray-400"
          }`}
        >
          Suivant →
        </Link>
      </div>
    </section>
  )
}
