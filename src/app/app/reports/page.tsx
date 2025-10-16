"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Download, 
  Mail, 
  Eye, 
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Users,
  Building2,
  TrendingUp
} from "lucide-react"

const mockReports = [
  {
    id: "1",
    date: "2024-01-15",
    listingsCount: 47,
    privateCount: 32,
    proCount: 15,
    isSent: true,
    sentAt: "2024-01-15T08:00:00Z",
    fileUrlPdf: "/reports/report-2024-01-15.pdf",
    fileUrlCsv: "/reports/report-2024-01-15.csv",
    topPostalCodes: ["75015", "75011", "75020"],
    priceEvolution: "+2.3%",
    newAgencies: 3
  },
  {
    id: "2",
    date: "2024-01-14",
    listingsCount: 38,
    privateCount: 28,
    proCount: 10,
    isSent: true,
    sentAt: "2024-01-14T08:00:00Z",
    fileUrlPdf: "/reports/report-2024-01-14.pdf",
    fileUrlCsv: "/reports/report-2024-01-14.csv",
    topPostalCodes: ["75012", "75013", "75015"],
    priceEvolution: "-1.2%",
    newAgencies: 1
  },
  {
    id: "3",
    date: "2024-01-13",
    listingsCount: 42,
    privateCount: 30,
    proCount: 12,
    isSent: true,
    sentAt: "2024-01-13T08:00:00Z",
    fileUrlPdf: "/reports/report-2024-01-13.pdf",
    fileUrlCsv: "/reports/report-2024-01-13.csv",
    topPostalCodes: ["75015", "75011", "75020"],
    priceEvolution: "+0.8%",
    newAgencies: 2
  },
  {
    id: "4",
    date: "2024-01-12",
    listingsCount: 35,
    privateCount: 25,
    proCount: 10,
    isSent: false,
    sentAt: null,
    fileUrlPdf: null,
    fileUrlCsv: null,
    topPostalCodes: ["75015", "75011", "75020"],
    priceEvolution: "+1.5%",
    newAgencies: 0
  }
]

const reportStats = [
  {
    title: "Rapports envoyés",
    value: mockReports.filter(r => r.isSent).length,
    total: mockReports.length,
    icon: CheckCircle,
    color: "text-green-600"
  },
  {
    title: "Annonces moyennes/jour",
    value: Math.round(mockReports.reduce((sum, r) => sum + r.listingsCount, 0) / mockReports.length),
    icon: BarChart3,
    color: "text-blue-600"
  },
  {
    title: "Taux de particuliers",
    value: Math.round(
      (mockReports.reduce((sum, r) => sum + r.privateCount, 0) / 
       mockReports.reduce((sum, r) => sum + r.listingsCount, 0)) * 100
    ) + "%",
    icon: Users,
    color: "text-purple-600"
  },
  {
    title: "Évolution prix",
    value: "+1.1%",
    icon: TrendingUp,
    color: "text-green-600"
  }
]

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null)

  const resendReport = (reportId: string) => {
    // Simuler l'envoi du rapport
    console.log(`Renvoyer le rapport ${reportId}`)
  }

  const downloadReport = (reportId: string, format: 'pdf' | 'csv') => {
    // Simuler le téléchargement
    console.log(`Télécharger le rapport ${reportId} en ${format}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rapports</h1>
          <p className="text-gray-600">Historique des rapports quotidiens et exports</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" data-magnetic data-cursor="Generate">
            <FileText className="w-4 h-4 mr-2" />
            Générer rapport
          </Button>
          <Button data-magnetic data-cursor="Download">
            <Download className="w-4 h-4 mr-2" />
            Exporter tout
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {reportStats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    {stat.total && (
                      <p className="text-xs text-gray-500">sur {stat.total} rapports</p>
                    )}
                  </div>
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Reports Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des rapports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockReports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {report.isSent ? (
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <Clock className="w-5 h-5 text-orange-600" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Rapport du {new Date(report.date).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </h3>
                        <Badge variant={report.isSent ? "default" : "secondary"}>
                          {report.isSent ? "Envoyé" : "En attente"}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          <span>{report.listingsCount} annonces</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          <span>{report.privateCount} particuliers</span>
                        </div>
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 mr-2" />
                          <span>{report.proCount} professionnels</span>
                        </div>
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          <span>{report.priceEvolution} prix</span>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-500">
                        Top codes postaux: {report.topPostalCodes.join(", ")}
                        {report.newAgencies > 0 && (
                          <span className="ml-4">
                            • {report.newAgencies} nouvelle{report.newAgencies > 1 ? 's' : ''} agence{report.newAgencies > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {report.isSent && (
                      <div className="text-right text-sm text-gray-500 mr-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Envoyé le {new Date(report.sentAt!).toLocaleString('fr-FR')}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      {report.fileUrlPdf && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadReport(report.id, 'pdf')}
                          data-magnetic
                          data-cursor="Download"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          PDF
                        </Button>
                      )}
                      
                      {report.fileUrlCsv && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadReport(report.id, 'csv')}
                          data-magnetic
                          data-cursor="Download"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          CSV
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedReport(report.id)}
                        data-magnetic
                        data-cursor="View"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
                      </Button>
                      
                      {!report.isSent && (
                        <Button
                          size="sm"
                          onClick={() => resendReport(report.id)}
                          data-magnetic
                          data-cursor="Send"
                        >
                          <Mail className="w-4 h-4 mr-1" />
                          Renvoyer
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Preview Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Aperçu du rapport
              </h2>
              <Button
                variant="outline"
                onClick={() => setSelectedReport(null)}
              >
                Fermer
              </Button>
            </div>
            
            <div className="space-y-6">
              {/* Report Header */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Résumé exécutif
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">47</div>
                    <div className="text-sm text-gray-600">Nouvelles annonces</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">32</div>
                    <div className="text-sm text-gray-600">Particuliers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">15</div>
                    <div className="text-sm text-gray-600">Professionnels</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">+2.3%</div>
                    <div className="text-sm text-gray-600">Évolution prix</div>
                  </div>
                </div>
              </div>

              {/* Top Listings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Top 5 des nouvelles annonces
                </h3>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                        <div>
                          <div className="font-medium text-gray-900">
                            Appartement {i + 2} pièces
                          </div>
                          <div className="text-sm text-gray-500">
                            Paris 15e • 75m² • Particulier
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {(450000 + i * 50000).toLocaleString()}€
                        </div>
                        <div className="text-sm text-gray-500">LeBonCoin</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Market Analysis */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Analyse du marché
                </h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-700">
                    Le marché immobilier parisien montre une activité soutenue avec une augmentation 
                    de 2.3% des prix moyens. Les arrondissements du 15e, 11e et 20e concentrent 
                    l'essentiel de l'activité. Les particuliers représentent 68% des nouvelles 
                    annonces, indiquant un marché dynamique.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
