"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Send, 
  Copy, 
  RefreshCw, 
  Brain, 
  MessageSquare, 
  Lightbulb,
  Mail,
  Phone,
  FileText,
  Target,
  TrendingUp,
  Users
} from "lucide-react"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const quickSuggestions = [
  { 
    icon: Users, 
    text: "Gérer une objection client", 
    prompt: "Comment gérer l'objection d'un client qui dit que le prix est trop élevé ?" 
  },
  { 
    icon: Mail, 
    text: "Reformuler un mail", 
    prompt: "Aide-moi à reformuler ce mail professionnel pour un vendeur :" 
  },
  { 
    icon: Phone, 
    text: "Répondre à un vendeur", 
    prompt: "Un vendeur me dit qu'il préfère passer par sa nièce qui s'y connaît, que répondre ?" 
  },
  { 
    icon: FileText, 
    text: "Optimiser une annonce", 
    prompt: "Comment optimiser cette annonce immobilière pour attirer plus de clients ?" 
  },
  { 
    icon: Target, 
    text: "Idées de relance", 
    prompt: "Donne-moi des idées créatives pour relancer un client qui hésite à vendre" 
  },
  { 
    icon: MessageSquare, 
    text: "Rédiger un SMS", 
    prompt: "Aide-moi à rédiger un SMS professionnel pour confirmer un rendez-vous" 
  },
  { 
    icon: TrendingUp, 
    text: "Argumentaire de vente", 
    prompt: "Crée un argumentaire de vente pour convaincre un vendeur de nous faire confiance" 
  }
]

export default function CopilotePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Bonjour ! Je suis votre Copilote IA spécialisé en accompagnement commercial immobilier. Comment puis-je vous aider aujourd'hui ?",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Simuler une réponse IA (dans un vrai projet, appeler une API)
    setTimeout(() => {
      const assistantResponse = generateAIResponse(message)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()
    
    if (lowerMessage.includes('objection') || lowerMessage.includes('prix trop élevé')) {
      return `Voici une approche structurée pour gérer cette objection :

**1. Validation de l'émotion**
"Je comprends parfaitement votre préoccupation concernant le prix. C'est normal de vouloir s'assurer de faire le bon choix."

**2. Question de clarification**
"Pouvez-vous me dire ce qui vous fait penser que le prix est trop élevé ? Est-ce par rapport à d'autres biens que vous avez vus ?"

**3. Repositionnement sur la valeur**
"Ce bien présente des avantages uniques : [citer les points forts]. Le prix reflète cette valeur et la localisation exceptionnelle."

**4. Proposition de solution**
"Je peux vous proposer plusieurs options : négocier avec le vendeur, vous montrer des comparatifs de marché, ou explorer des solutions de financement."

Cette approche respecte le client tout en le guidant vers une décision éclairée.`
    }
    
    if (lowerMessage.includes('nièce') || lowerMessage.includes('famille')) {
      return `Excellente question ! Voici une réponse professionnelle et bienveillante :

**"Je comprends tout à fait votre réflexion. Il est toujours rassurant de faire appel à quelqu'un de confiance comme votre nièce.**

**Cependant, mon rôle est justement d'accompagner les vendeurs pour :**
- Maximiser la visibilité de votre bien
- Sécuriser toutes les démarches juridiques
- Vendre au meilleur prix possible
- Gérer les négociations complexes

**Rien ne vous empêche d'en discuter avec votre nièce. Je peux même lui expliquer ma démarche si vous le souhaitez. L'important est que vous soyez à l'aise avec votre choix.**

**Qu'est-ce qui vous ferait le plus confiance : que je vous explique ma méthode ou que nous en parlions ensemble avec votre nièce ?"**

Cette approche respecte la relation familiale tout en valorisant votre expertise professionnelle.`
    }
    
    if (lowerMessage.includes('relance') || lowerMessage.includes('hésite')) {
      return `Voici des idées de relance créatives et professionnelles :

**🎯 Approche par la valeur ajoutée**
"Bonjour [Nom], j'ai repensé à votre situation et j'ai une idée qui pourrait vous intéresser : organiser une visite groupée avec des acheteurs qualifiés. Cela pourrait accélérer la vente."

**📊 Approche par les données**
"J'ai analysé le marché de votre secteur et j'ai des informations intéressantes à partager. Puis-je vous appeler 5 minutes ?"

**🤝 Approche par l'accompagnement**
"Je comprends que vendre peut être stressant. J'aimerais vous proposer un accompagnement personnalisé pour simplifier le processus."

**⏰ Approche par l'urgence douce**
"Le marché évolue rapidement en ce moment. Avez-vous 10 minutes pour que je vous explique les tendances actuelles ?"

**💡 Approche par l'innovation**
"J'ai développé une nouvelle méthode de présentation qui pourrait faire la différence. Voulez-vous que je vous la montre ?"

Choisissez l'approche qui correspond le mieux à la personnalité de votre client !`
    }
    
    if (lowerMessage.includes('mail') || lowerMessage.includes('email')) {
      return `Pour optimiser vos emails professionnels, voici une structure efficace :

**📧 Structure optimale :**

**Objet :** [Sujet clair et actionnable]
Ex: "Visite confirmée - [Adresse] - [Date]"

**Salutation personnalisée :**
"Bonjour [Prénom],"

**Contexte et valeur :**
"Suite à notre échange, je vous confirme que [action/rendez-vous]."

**Informations pratiques :**
- Date, heure, lieu
- Ce qu'il faut apporter
- Contact d'urgence

**Prochaines étapes :**
"Je vous enverrai [document/information] avant notre rendez-vous."

**Signature professionnelle :**
"[Votre nom]
[Votre agence]
[Coordonnées]"

**💡 Conseils :**
- Maximum 3 paragraphes
- Un seul appel à l'action
- Ton professionnel mais chaleureux
- Toujours proposer un plan B

Voulez-vous que je vous aide à rédiger un email spécifique ?`
    }
    
    if (lowerMessage.includes('annonce') || lowerMessage.includes('optimiser')) {
      return `Pour optimiser une annonce immobilière, voici les éléments clés :

**🎯 Titre accrocheur :**
- Mentionnez le type de bien + localisation + point fort
- Ex: "T3 lumineux avec balcon - Centre-ville - Proche métro"

**📝 Description structurée :**
1. **Accroche** (1 phrase qui donne envie)
2. **Points forts** (3-4 avantages majeurs)
3. **Détails techniques** (surface, pièces, équipements)
4. **Localisation** (proximités, transports)
5. **Call-to-action** (contact, visite)

**📸 Photos optimisées :**
- Photo principale : vue d'ensemble
- Photos de détail : équipements, balcon, vue
- Photos de localisation : rue, commerces

**💰 Prix stratégique :**
- Juste en dessous des seuils psychologiques
- Ex: 299 000€ au lieu de 300 000€

**🔍 Mots-clés SEO :**
- Quartier, type de bien, équipements
- Transports, commerces, écoles

Voulez-vous que je vous aide à optimiser une annonce spécifique ?`
    }
    
    if (lowerMessage.includes('sms') || lowerMessage.includes('message')) {
      return `Pour rédiger des SMS professionnels efficaces :

**📱 Structure SMS :**
- Maximum 160 caractères
- Message clair et direct
- Ton professionnel mais accessible

**✅ Exemples types :**

**Confirmation RDV :**
"Bonjour [Prénom], RDV confirmé [date] à [heure] pour [adresse]. À bientôt ! [Votre nom]"

**Relance douce :**
"Bonjour [Prénom], j'ai une info intéressante sur votre secteur. 2 min pour vous l'expliquer ? [Votre nom]"

**Suivi après visite :**
"Merci pour la visite ! Des questions ? Je reste à votre disposition. [Votre nom]"

**Rappel :**
"Rappel : RDV [date] à [heure]. Si changement, merci de me prévenir. [Votre nom]"

**💡 Conseils :**
- Toujours signer
- Éviter les abréviations excessives
- Proposer un plan B
- Respecter les horaires (9h-19h)

Quel type de SMS voulez-vous rédiger ?`
    }
    
    if (lowerMessage.includes('argumentaire') || lowerMessage.includes('convaincre')) {
      return `Voici un argumentaire de vente structuré pour convaincre un vendeur :

**🎯 ARGUMENTAIRE "VALEUR AJOUTÉE"**

**1. Ouverture (Créer la confiance)**
"Bonjour [Prénom], je comprends que vendre votre bien est une décision importante. Mon rôle est de vous accompagner pour maximiser vos chances de succès."

**2. Diagnostic (Comprendre ses besoins)**
"Pouvez-vous me dire ce qui est le plus important pour vous : vendre rapidement, au meilleur prix, ou avec le moins de stress possible ?"

**3. Présentation de la solution (Nos avantages)**
"Voici comment je peux vous aider :
- **Visibilité maximale** : 15+ portails immobiliers
- **Sécurisation** : Suivi juridique complet
- **Négociation** : Expertise pour optimiser le prix
- **Accompagnement** : Un seul interlocuteur"

**4. Preuve sociale (Témoignages)**
"L'année dernière, j'ai vendu 95% de mes mandats en moins de 2 mois, avec un prix moyen 8% au-dessus du marché."

**5. Fermeture (Proposition claire)**
"Êtes-vous prêt à me faire confiance pour vendre votre bien dans les meilleures conditions ?"

**💡 Adaptez selon la personnalité du vendeur !**
    }
    
    // Réponse par défaut
    return `Merci pour votre question ! En tant que Copilote IA spécialisé en immobilier, je suis là pour vous accompagner dans tous vos défis commerciaux.

**Comment puis-je vous aider aujourd'hui ?**
- Gérer des objections clients
- Rédiger des emails professionnels
- Créer des argumentaires de vente
- Optimiser vos annonces
- Trouver des idées de relance
- Structurer vos négociations

N'hésitez pas à me poser des questions spécifiques ou à utiliser les suggestions rapides ci-dessus !`
  }

  const handleQuickSuggestion = (suggestion: typeof quickSuggestions[0]) => {
    setInputValue(suggestion.prompt)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: "Bonjour ! Je suis votre Copilote IA spécialisé en accompagnement commercial immobilier. Comment puis-je vous aider aujourd'hui ?",
        timestamp: new Date()
      }
    ])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Brain className="h-8 w-8 text-blue-600" />
                Copilote IA
              </h1>
              <p className="text-gray-600">Votre assistant immobilier personnel</p>
            </div>
            <Button 
              variant="outline" 
              onClick={clearChat}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Nouvelle conversation
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Suggestions rapides */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Suggestions rapides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start h-auto p-3 text-left"
                    onClick={() => handleQuickSuggestion(suggestion)}
                  >
                    <div className="flex items-start gap-3">
                      <suggestion.icon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{suggestion.text}</span>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Chat */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Conversation
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          {message.role === 'assistant' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(message.content)}
                              className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-sm text-gray-600">Le Copilote réfléchit...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Posez une question au Copilote IA…"
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage(inputValue)
                        }
                      }}
                    />
                    <Button
                      onClick={() => handleSendMessage(inputValue)}
                      disabled={!inputValue.trim() || isLoading}
                      className="px-4"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
