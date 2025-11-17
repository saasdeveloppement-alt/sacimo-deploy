import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  BarChart3,
  Bell,
  Brain,
  Building2,
  CreditCard,
  FileText,
  Home,
  MapPin,
  MessageCircle,
  Search,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin")
  }

  const { user } = session

  return (
    <div className="min-h-screen">
      <div className="relative h-[400px] overflow-hidden rounded-xl mb-8">
        <div
          className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-900/90 to-indigo-900/70" />
        </div>

        <div className="relative h-full flex flex-col justify-center px-12">
          <Badge className="w-fit mb-4 bg-white/20 text-white border-white/30">
            <Sparkles className="h-3 w-3 mr-1" />
            Nouveau
          </Badge>

          <h1 className="text-5xl font-bold text-white mb-4">
            Bonjour {user?.name || "Utilisateur"} 👋
          </h1>

          <p className="text-xl text-white/90 max-w-2xl mb-6">
            {user?.email
              ? `Connecté en tant que ${user.email}. Pilotez votre activité immobilière et découvrez les dernières opportunités du marché.`
              : "Votre tableau de bord centralisé pour piloter votre activité immobilière. Découvrez les dernières opportunités et tendances du marché."}
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg">
              <Search className="h-5 w-5 mr-2" />
              Nouvelle recherche
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white !text-white hover:bg-white/10 hover:!text-white bg-transparent"
              asChild
            >
              <Link href="/app/rapports">
                <FileText className="h-5 w-5 mr-2" />
                Voir les rapports
              </Link>
            </Button>
            {user?.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
                src={user.image}
                alt={`Avatar de ${user.name ?? "l'utilisateur"}`}
                width={56}
                height={56}
                className="rounded-full border-2 border-white shadow-lg"
              />
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-violet-100 rounded-lg">
                  <Search className="h-6 w-6 text-violet-600" />
                </div>
                <Badge variant="secondary">+15%</Badge>
              </div>
              <h3 className="text-2xl font-bold mb-1">2</h3>
              <p className="text-sm text-muted-foreground">Recherches Actives</p>
              <p className="text-xs text-muted-foreground mt-1">vs 1 la semaine dernière</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-violet-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-violet-600" />
                </div>
                <Badge variant="secondary">Nouveau</Badge>
              </div>
              <h3 className="text-2xl font-bold mb-1">2</h3>
              <p className="text-sm text-muted-foreground">Nouvelles Annonces</p>
              <p className="text-xs text-muted-foreground mt-1">Ajoutées aujourd{"'"}hui</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <FileText className="h-6 w-6 text-indigo-600" />
                </div>
                <Badge variant="secondary">+2</Badge>
              </div>
              <h3 className="text-2xl font-bold mb-1">3</h3>
              <p className="text-sm text-muted-foreground">Rapports Prêts</p>
              <p className="text-xs text-muted-foreground mt-1">Dernier : il y a 2h</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Bell className="h-6 w-6 text-orange-600" />
                </div>
                <Badge variant="destructive">!</Badge>
              </div>
              <h3 className="text-2xl font-bold mb-1">2</h3>
              <p className="text-sm text-muted-foreground">Alertes Non Lues</p>
              <p className="text-xs text-muted-foreground mt-1">Dernière : il y a 30min</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-violet-600" />
                  Mes Recherches
                </CardTitle>
                <Badge>2</Badge>
              </div>
              <CardDescription>Recherches actives</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold">Paris 2P &lt; 500k€</p>
                    <Badge variant="secondary">Actif</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">23 résultats</p>
                  <p className="text-xs text-muted-foreground mt-1">Dernière mise à jour : il y a 2h</p>
                </div>

                <div className="p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold">Lyon Maisons 4P+</p>
                    <Badge variant="secondary">Actif</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">16 résultats</p>
                  <p className="text-xs text-muted-foreground mt-1">Dernière mise à jour : il y a 4h</p>
                </div>

                <div className="p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold">Marseille Investissement</p>
                    <Badge variant="outline">En pause</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">8 résultats</p>
                  <p className="text-xs text-muted-foreground mt-1">Dernière mise à jour : il y a 1j</p>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/app/recherches">
                  Voir toutes
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-violet-600" />
                  Nouvelles Annonces
                </CardTitle>
                <Badge>2</Badge>
              </div>
              <CardDescription>Ajoutées aujourd{"'"}hui</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold">Appartement T3</p>
                    <Badge>Nouveau</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Paris • 350 000€</p>
                  <p className="text-xs text-muted-foreground">Ajouté il y a 30min</p>
                </div>

                <div className="p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold">Maison 5 pièces</p>
                    <Badge>Nouveau</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Lyon • 520 000€</p>
                  <p className="text-xs text-muted-foreground">Ajouté il y a 2h</p>
                </div>

                <div className="p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold">Studio rénové</p>
                    <Badge variant="outline">Récent</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Marseille • 280 000€</p>
                  <p className="text-xs text-muted-foreground">Ajouté il y a 4h</p>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/app/annonces">
                  Analyser
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-indigo-600" />
                  Suivi Concurrents
                </CardTitle>
                <Badge>12</Badge>
              </div>
              <CardDescription>45 annonces suivies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold">Volume hebdomadaire</p>
                    <Badge variant="secondary">+12%</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">45 nouvelles annonces</p>
                </div>

                <div className="p-3 border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold">Prix moyen</p>
                    <Badge variant="secondary">-3%</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">520 000€ sur le marché</p>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/app/concurrents">
                  Voir les concurrents
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-600" />
              Actions Rapides
            </CardTitle>
            <CardDescription>Accédez rapidement aux fonctionnalités principales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <Button variant="outline" className="h-24 flex-col" asChild>
                <Link href="/app/recherches">
                  <Search className="h-6 w-6 mb-2" />
                  <span className="text-xs text-center">Mes recherches</span>
                </Link>
              </Button>

              <Button variant="outline" className="h-24 flex-col" asChild>
                <Link href="/app/annonces">
                  <Target className="h-6 w-6 mb-2" />
                  <span className="text-xs text-center">Piges</span>
                </Link>
              </Button>

              <Button variant="outline" className="h-24 flex-col" asChild>
                <Link href="/app/concurrents">
                  <Building2 className="h-6 w-6 mb-2" />
                  <span className="text-xs text-center">Suivi concurrents</span>
                </Link>
              </Button>

              <Button variant="outline" className="h-24 flex-col" asChild>
                <Link href="/app/localisation">
                  <MapPin className="h-6 w-6 mb-2" />
                  <span className="text-xs text-center">Localisation</span>
                </Link>
              </Button>

              <Button variant="outline" className="h-24 flex-col" asChild>
                <Link href="/app/rapports">
                  <BarChart3 className="h-6 w-6 mb-2" />
                  <span className="text-xs text-center">Rapports</span>
                </Link>
              </Button>

              <Button variant="outline" className="h-24 flex-col" asChild>
                <Link href="/app/notifications">
                  <Bell className="h-6 w-6 mb-2" />
                  <span className="text-xs text-center">Notifications</span>
                </Link>
              </Button>

              <Button variant="outline" className="h-24 flex-col" asChild>
                <Link href="/app/copilote">
                  <Brain className="h-6 w-6 mb-2" />
                  <span className="text-xs text-center">Copilote IA</span>
                </Link>
              </Button>

              <Button variant="outline" className="h-24 flex-col" asChild>
                <Link href="/app/parametres">
                  <Settings className="h-6 w-6 mb-2" />
                  <span className="text-xs text-center">Paramètres</span>
                </Link>
              </Button>

              <Button variant="outline" className="h-24 flex-col" asChild>
                <Link href="/app/facturation">
                  <CreditCard className="h-6 w-6 mb-2" />
                  <span className="text-xs text-center">Facturation</span>
                </Link>
              </Button>

              <Button variant="outline" className="h-24 flex-col" asChild>
                <Link href="/app/contact">
                  <MessageCircle className="h-6 w-6 mb-2" />
                  <span className="text-xs text-center">Contact</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
