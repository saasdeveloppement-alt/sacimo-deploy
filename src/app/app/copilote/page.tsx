"use client"

import { useState, useEffect, useRef } from "react"
import PageContainer, { fadeInUp, staggerChildren } from "@/components/ui/PageContainer"
import SectionHeader from "@/components/ui/SectionHeader"
import ModernCard from "@/components/ui/ModernCard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Brain, 
  Send, 
  Copy, 
  ThumbsUp, 
  ThumbsDown,
  RefreshCw,
  Lightbulb,
  Target,
  Users,
  TrendingUp,
  Building2,
  MessageSquare,
  Zap,
  Star,
  Clock
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  isTyping?: boolean
}

interface QuickSuggestion {
  id: string
  text: string
  category: 'objection' | 'email' | 'negotiation' | 'market' | 'client'
  icon: React.ReactNode
}

export default function CopilotePage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const quickSuggestions: QuickSuggestion[] = [
    {
      id: '1',
      text: 'Gérer une objection client',
      category: 'objection',
      icon: <Target className="h-4 w-4" />
    },
    {
      id: '2',
      text: 'Reformuler un email',
      category: 'email',
      icon: <MessageSquare className="h-4 w-4" />
    },
    {
      id: '3',
      text: 'Stratégie de négociation',
      category: 'negotiation',
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      id: '4',
      text: 'Analyse du marché local',
      category: 'market',
      icon: <Building2 className="h-4 w-4" />
    },
    {
      id: '5',
      text: 'Profilage client',
      category: 'client',
      icon: <Users className="h-4 w-4" />
    }
  ]

  const filteredSuggestions = selectedCategory 
    ? quickSuggestions.filter(s => s.category === selectedCategory)
    : quickSuggestions

  // Messages d'accueil
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      type: 'assistant',
      content: "Bonjour ! Je suis votre Copilote IA spécialisé dans l'immobilier commercial. Je peux vous aider à gérer les objections clients, rédiger des emails, analyser le marché, et bien plus encore. Que puis-je faire pour vous aujourd'hui ?",
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
  }, [])

  const scrollToBottom = () => {
    // Utiliser setTimeout pour s'assurer que le DOM est mis à jour
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Simuler une réponse IA
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateAIResponse(content),
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()
    
    if (input.includes('objection') || input.includes('client')) {
      return "Voici une stratégie pour gérer cette objection :\n\n1. **Écoutez activement** - Laissez le client s'exprimer complètement\n2. **Reformulez** - 'Si je comprends bien, votre préoccupation est...'\n3. **Validez** - 'C'est une excellente question'\n4. **Répondez** - Apportez des éléments concrets\n5. **Vérifiez** - 'Est-ce que cela répond à votre question ?'\n\nExemple concret : Si le client dit 'C'est trop cher', répondez : 'Je comprends que le prix soit important. Pouvez-vous me dire par rapport à quoi vous trouvez que c'est cher ? Cela m'aiderait à vous proposer des alternatives.'"
    }
    
    if (input.includes('email') || input.includes('mail')) {
      return "Voici un template d'email professionnel :\n\n**Objet :** [Sujet clair et accrocheur]\n\nBonjour [Nom],\n\nJ'espère que vous allez bien.\n\n[Paragraphe 1 : Contexte et raison de l'email]\n[Paragraphe 2 : Proposition concrète avec bénéfices]\n[Paragraphe 3 : Call-to-action clair]\n\nJe reste à votre disposition pour toute question.\n\nCordialement,\n[Votre nom]\n\n**Conseils :**\n- Maximum 3 paragraphes\n- Un seul objectif par email\n- Call-to-action précis"
    }
    
    if (input.includes('négociation') || input.includes('prix')) {
      return "Stratégie de négociation immobilière :\n\n**Phase 1 - Préparation :**\n- Connaissez la valeur réelle du bien\n- Identifiez les motivations du vendeur\n- Préparez vos arguments\n\n**Phase 2 - Négociation :**\n- Commencez par écouter\n- Posez des questions ouvertes\n- Trouvez des points d'accord\n- Proposez des alternatives\n\n**Phase 3 - Conclusion :**\n- Résumez les points d'accord\n- Proposez un compromis\n- Fixez un délai de réponse\n\n**Techniques :**\n- 'Et si on trouvait un terrain d'entente...'\n- 'Que diriez-vous de...'\n- 'Dans votre situation, ne serait-il pas intéressant de...'"
    }
    
    if (input.includes('marché') || input.includes('analyse')) {
      return "Analyse du marché immobilier :\n\n**Indicateurs clés à suivre :**\n- Prix au m² par quartier\n- Temps de vente moyen\n- Évolution des prix sur 6-12 mois\n- Ratio offre/demande\n\n**Sources de données :**\n- Notaires de France\n- Perval\n- Meilleurs Agents\n- Observatoires locaux\n\n**Questions à se poser :**\n- Le marché est-il en hausse/baisse ?\n- Y a-t-il des surcharges/penuries ?\n- Quels sont les facteurs d'influence ?\n- Comment se positionne ce bien ?\n\n**Conseil :** Créez un tableau de bord avec ces indicateurs pour chaque zone que vous suivez."
    }
    
    return "Je comprends votre demande. En tant que Copilote IA spécialisé dans l'immobilier commercial, je peux vous aider avec :\n\n🏠 **Gestion des objections clients**\n📧 **Rédaction d'emails professionnels**\n💰 **Stratégies de négociation**\n📊 **Analyse du marché local**\n👥 **Profilage et relation client**\n\nPouvez-vous être plus spécifique sur ce dont vous avez besoin ? Je pourrai vous donner des conseils personnalisés et des exemples concrets."
  }

  const handleQuickSuggestion = (suggestion: QuickSuggestion) => {
    handleSendMessage(suggestion.text)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <PageContainer>
      {/* Header */}
      <SectionHeader
        title="Copilote IA"
        subtitle="Votre assistant commercial intelligent pour l'immobilier"
        icon={<Brain className="h-8 w-8 text-purple-600" />}
        action={
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setMessages([])}
              className="border-slate-200 hover:border-purple-300 hover:text-purple-600"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Nouvelle conversation
            </Button>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
              <Star className="mr-2 h-4 w-4" />
              Favoris
            </Button>
          </div>
        }
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Suggestions rapides */}
          <motion.div variants={fadeInUp}>
            <ModernCard
              title="Suggestions Rapides"
              icon={<Lightbulb className="h-5 w-5 text-purple-600" />}
            >
              <div className="space-y-4">
                {/* Filtres par catégorie */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                    className={selectedCategory === null ? "bg-purple-600 hover:bg-purple-700" : "border-slate-200 hover:border-purple-300"}
                  >
                    Toutes
                  </Button>
                  {['objection', 'email', 'negotiation', 'market', 'client'].map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
                      className={selectedCategory === category ? "bg-purple-600 hover:bg-purple-700" : "border-slate-200 hover:border-purple-300"}
                    >
                      {category === 'objection' && 'Objections'}
                      {category === 'email' && 'Emails'}
                      {category === 'negotiation' && 'Négociation'}
                      {category === 'market' && 'Marché'}
                      {category === 'client' && 'Clients'}
                    </Button>
                  ))}
                </div>

                {/* Suggestions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredSuggestions.map((suggestion) => (
                    <motion.div
                      key={suggestion.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full h-auto p-4 justify-start text-left border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
                        onClick={() => handleQuickSuggestion(suggestion)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                            {suggestion.icon}
                          </div>
                          <span className="font-medium">{suggestion.text}</span>
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </ModernCard>
          </motion.div>

          {/* Chat Interface */}
          <motion.div variants={fadeInUp} className="min-w-0">
            <div className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg rounded-lg h-[600px] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-200/60">
                <div className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Conversation
                </div>
              </div>
              
              {/* Messages - Zone scrollable */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4" style={{ WebkitOverflowScrolling: 'touch' }}>
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] min-w-0 rounded-2xl p-4 ${
                        message.type === 'user' 
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                          : 'bg-slate-100 text-slate-900'
                      }`}>
                        <div className="flex items-start gap-3 min-w-0">
                          {message.type === 'assistant' && (
                            <div className="p-2 rounded-lg bg-purple-100 text-purple-600 flex-shrink-0 mt-1">
                              <Brain className="h-4 w-4" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="whitespace-pre-wrap break-words text-sm leading-relaxed overflow-wrap-anywhere">
                              {message.content}
                            </div>
                            <div className={`flex items-center justify-between mt-2 text-xs ${
                              message.type === 'user' ? 'text-purple-100' : 'text-slate-500'
                            }`}>
                              <span>{formatTime(message.timestamp)}</span>
                              {message.type === 'assistant' && (
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(message.content)}
                                    className="h-6 w-6 p-0 hover:bg-slate-200"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 hover:bg-slate-200"
                                  >
                                    <ThumbsUp className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 hover:bg-slate-200"
                                  >
                                    <ThumbsDown className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-slate-100 rounded-2xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                          <Brain className="h-4 w-4" />
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-slate-200 p-4">
                <div className="flex gap-3">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Posez une question au Copilote IA…"
                    className="flex-1 border-slate-200 focus:border-purple-300 focus:ring-purple-200"
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
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Appuyez sur Entrée pour envoyer, Maj+Entrée pour une nouvelle ligne
                </p>
              </div>
            </div>
          </motion.div>

          {/* Historique des conversations */}
          <motion.div variants={fadeInUp}>
            <ModernCard
              title="Historique des Conversations"
              icon={<Clock className="h-5 w-5 text-cyan-600" />}
            >
              <div className="text-center py-8 text-slate-500">
                <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-lg font-medium">Aucune conversation sauvegardée</p>
                <p className="text-sm">Vos conversations seront sauvegardées ici</p>
              </div>
            </ModernCard>
          </motion.div>
        </div>
      </main>
    </PageContainer>
  )
}