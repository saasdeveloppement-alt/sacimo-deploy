"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Building2, 
  CreditCard, 
  Bell, 
  Shield, 
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  Edit,
  Trash2,
  Plus,
  Key,
  Webhook,
  Download
} from "lucide-react"

const mockUser = {
  name: "Jean Dupont",
  email: "jean.dupont@sacimo.com",
  role: "OWNER",
  agency: "Agence Immobilière Dupont",
  phone: "+33 1 23 45 67 89",
  avatar: "/avatar.jpg"
}

const mockAgency = {
  name: "Agence Immobilière Dupont",
  billingTier: "PRO",
  seats: 5,
  createdAt: "2024-01-01",
  address: "123 Rue de la Paix, 75001 Paris",
  siret: "12345678901234"
}

const mockTeam = [
  {
    id: "1",
    name: "Marie Martin",
    email: "marie.martin@sacimo.com",
    role: "ADMIN",
    status: "active",
    lastActive: "2024-01-15T10:30:00Z"
  },
  {
    id: "2",
    name: "Pierre Durand",
    email: "pierre.durand@sacimo.com",
    role: "AGENT",
    status: "active",
    lastActive: "2024-01-15T09:15:00Z"
  },
  {
    id: "3",
    name: "Sophie Bernard",
    email: "sophie.bernard@sacimo.com",
    role: "AGENT",
    status: "inactive",
    lastActive: "2024-01-10T14:20:00Z"
  }
]

const mockBilling = {
  plan: "Pro",
  price: 79,
  nextBilling: "2024-02-01",
  status: "active",
  paymentMethod: "**** 1234",
  invoices: [
    { id: "INV-001", date: "2024-01-01", amount: 79, status: "paid" },
    { id: "INV-002", date: "2023-12-01", amount: 79, status: "paid" },
    { id: "INV-003", date: "2023-11-01", amount: 79, status: "paid" }
  ]
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [userData, setUserData] = useState(mockUser)
  const [agencyData, setAgencyData] = useState(mockAgency)
  const [team, setTeam] = useState(mockTeam)
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    dailyReport: true,
    newListings: true,
    competitorActivity: false,
    weeklySummary: true
  })

  const handleSave = () => {
    setIsEditing(false)
    // Ici on sauvegarderait les données
    console.log("Sauvegarde des paramètres")
  }

  const removeTeamMember = (id: string) => {
    setTeam(team.filter(member => member.id !== id))
  }

  const inviteTeamMember = () => {
    // Ici on ouvrirait un modal d'invitation
    console.log("Inviter un membre d'équipe")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-600">Gérez votre compte et vos préférences</p>
        </div>
        {isEditing && (
          <Button onClick={handleSave} data-magnetic data-cursor="Save">
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="agency">Agence</TabsTrigger>
          <TabsTrigger value="team">Équipe</TabsTrigger>
          <TabsTrigger value="billing">Facturation</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Informations personnelles</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {isEditing ? "Annuler" : "Modifier"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{userData.name}</h3>
                  <p className="text-gray-600">{userData.email}</p>
                  <Badge variant="outline" className="mt-1">
                    {userData.role}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    value={userData.name}
                    onChange={(e) => setUserData({...userData, name: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={userData.email}
                    onChange={(e) => setUserData({...userData, email: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={userData.phone}
                    onChange={(e) => setUserData({...userData, phone: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agency Tab */}
        <TabsContent value="agency" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Informations de l'agence</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {isEditing ? "Annuler" : "Modifier"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="agencyName">Nom de l'agence</Label>
                  <Input
                    id="agencyName"
                    value={agencyData.name}
                    onChange={(e) => setAgencyData({...agencyData, name: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="siret">SIRET</Label>
                  <Input
                    id="siret"
                    value={agencyData.siret}
                    onChange={(e) => setAgencyData({...agencyData, siret: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={agencyData.address}
                    onChange={(e) => setAgencyData({...agencyData, address: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan d'abonnement</h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{agencyData.billingTier}</p>
                    <p className="text-sm text-gray-600">{agencyData.seats} sièges</p>
                  </div>
                  <Button variant="outline" data-magnetic data-cursor="View">
                    Modifier le plan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Membres de l'équipe</CardTitle>
                <Button onClick={inviteTeamMember} data-magnetic data-cursor="Add">
                  <Plus className="w-4 h-4 mr-2" />
                  Inviter un membre
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {team.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{member.role}</Badge>
                          <Badge variant={member.status === "active" ? "default" : "secondary"}>
                            {member.status === "active" ? "Actif" : "Inactif"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        Dernière activité: {new Date(member.lastActive).toLocaleDateString('fr-FR')}
                      </span>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => removeTeamMember(member.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Facturation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Plan {mockBilling.plan}</p>
                  <p className="text-sm text-gray-600">
                    {mockBilling.price}€/mois • Prochaine facture: {mockBilling.nextBilling}
                  </p>
                </div>
                <Badge variant={mockBilling.status === "active" ? "default" : "secondary"}>
                  {mockBilling.status === "active" ? "Actif" : "Inactif"}
                </Badge>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Méthode de paiement</h3>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-900">{mockBilling.paymentMethod}</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Modifier
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique des factures</h3>
                <div className="space-y-2">
                  {mockBilling.invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{invoice.id}</p>
                        <p className="text-sm text-gray-600">{invoice.date}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-gray-900">{invoice.amount}€</span>
                        <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>
                          {invoice.status === "paid" ? "Payée" : "En attente"}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Préférences de notification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Notifications par email</p>
                    <p className="text-sm text-gray-600">Recevoir des notifications par email</p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Rapport quotidien</p>
                    <p className="text-sm text-gray-600">Recevoir le rapport quotidien à 8h00</p>
                  </div>
                  <Switch
                    checked={notifications.dailyReport}
                    onCheckedChange={(checked) => setNotifications({...notifications, dailyReport: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Nouvelles annonces</p>
                    <p className="text-sm text-gray-600">Être notifié des nouvelles annonces importantes</p>
                  </div>
                  <Switch
                    checked={notifications.newListings}
                    onCheckedChange={(checked) => setNotifications({...notifications, newListings: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Activité concurrentielle</p>
                    <p className="text-sm text-gray-600">Surveiller l'activité des concurrents</p>
                  </div>
                  <Switch
                    checked={notifications.competitorActivity}
                    onCheckedChange={(checked) => setNotifications({...notifications, competitorActivity: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Résumé hebdomadaire</p>
                    <p className="text-sm text-gray-600">Recevoir un résumé hebdomadaire le lundi</p>
                  </div>
                  <Switch
                    checked={notifications.weeklySummary}
                    onCheckedChange={(checked) => setNotifications({...notifications, weeklySummary: checked})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Intégrations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Webhook className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Webhooks</p>
                    <p className="text-sm text-gray-600">Recevoir des données en temps réel</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Configurer
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Key className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">API</p>
                    <p className="text-sm text-gray-600">Accéder aux données via l'API</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Générer une clé
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
