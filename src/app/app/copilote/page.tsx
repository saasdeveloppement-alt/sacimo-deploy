"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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
  Clock,
  AlertTriangle,
  Mail,
  DollarSign,
  Sparkles,
  MessageCircle
} from "lucide-react"
import { toast } from "sonner"

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
  category: 'objection' | 'email' | 'negotiation' | 'market' | 'client' | 'pricing'
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
}

export default function CopilotePage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const quickSuggestions: QuickSuggestion[] = [
    {
      id: '1',
      text: 'Gérer une objection client',
      category: 'objection',
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'text-purple-700',
      bgColor: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-200'
    },
    {
      id: '2',
      text: 'Reformuler un email',
      category: 'email',
      icon: <Mail className="w-5 h-5" />,
      color: 'text-blue-700',
      bgColor: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-200'
    },
    {
      id: '3',
      text: 'Stratégie de négociation',
      category: 'negotiation',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-pink-700',
      bgColor: 'from-pink-50 to-pink-100',
      borderColor: 'border-pink-200'
    },
    {
      id: '4',
      text: 'Analyse du marché local',
      category: 'market',
      icon: <Building2 className="w-5 w-5" />,
      color: 'text-indigo-700',
      bgColor: 'from-indigo-50 to-indigo-100',
      borderColor: 'border-indigo-200'
    },
    {
      id: '5',
      text: 'Profilage client',
      category: 'client',
      icon: <Users className="w-5 h-5" />,
      color: 'text-cyan-700',
      bgColor: 'from-cyan-50 to-cyan-100',
      borderColor: 'border-cyan-200'
    },
    {
      id: '6',
      text: 'Estimation de prix',
      category: 'pricing',
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-amber-700',
      bgColor: 'from-amber-50 to-amber-100',
      borderColor: 'border-amber-200'
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
      content: "Bonjour ! Je suis votre Copilote IA spécialisé dans l'immobilier commercial. Je peux vous aider à gérer vos objections clients, rédiger des emails, analyser le marché, et bien plus encore. Que puis-je faire pour vous aujourd'hui ?",
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
  }, [])

  const scrollToBottom = () => {
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
    toast.success('Message copié dans le presse-papier')
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(inputValue)
    }
  }

  const handleNewConversation = () => {
    setMessages([])
    const welcomeMessage: Message = {
      id: 'welcome',
      type: 'assistant',
      content: "Bonjour ! Je suis votre Copilote IA spécialisé dans l'immobilier commercial. Je peux vous aider à gérer vos objections clients, rédager des emails, analyser le marché, et bien plus encore. Que puis-je faire pour vous aujourd'hui ?",
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
    toast.success('Nouvelle conversation démarrée')
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Floating Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-10 w-96 h-96 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            y: [0, 20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/3 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            y: [0, -15, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div
                  className="p-2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-xl"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Brain className="w-8 h-8 text-white" strokeWidth={1.5} />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                    Copilote IA
                  </h1>
                  <p className="text-sm text-gray-600">Votre assistant commercial intelligent pour l'immobilier</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    onClick={handleNewConversation}
                    className="border-gray-300 hover:bg-gray-50 transition-all font-medium"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" strokeWidth={1.5} />
                    Nouvelle conversation
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium">
                    <Star className="mr-2 h-4 w-4" strokeWidth={1.5} />
                    Favoris
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-8">
          {/* Quick Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-3xl p-6 mb-6 shadow-lg"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-primary-100 rounded-xl">
                <Lightbulb className="w-5 h-5 text-primary-600" strokeWidth={1.5} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Suggestions Rapides</h2>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center space-x-2 mb-4 overflow-x-auto pb-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className={selectedCategory === null 
                  ? "bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-medium whitespace-nowrap shadow-lg" 
                  : "bg-gray-100 text-gray-700 rounded-xl font-medium whitespace-nowrap hover:bg-gray-200 border-gray-200"
                }
              >
                Toutes
              </Button>
              {[
                { key: 'objection', label: 'Objections' },
                { key: 'email', label: 'Emails' },
                { key: 'negotiation', label: 'Négociation' },
                { key: 'market', label: 'Marché' },
                { key: 'client', label: 'Clients' },
                { key: 'pricing', label: 'Prix' }
              ].map(category => (
                <Button
                  key={category.key}
                  variant={selectedCategory === category.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.key === selectedCategory ? null : category.key)}
                  className={selectedCategory === category.key
                    ? "bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-medium whitespace-nowrap shadow-lg"
                    : "bg-gray-100 text-gray-700 rounded-xl font-medium whitespace-nowrap hover:bg-gray-200 border-gray-200"
                  }
                >
                  {category.label}
                </Button>
              ))}
            </div>

            {/* Suggestion Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSuggestions.map((suggestion) => (
                <motion.button
                  key={suggestion.id}
                  onClick={() => handleQuickSuggestion(suggestion)}
                  className={`text-left p-4 bg-gradient-to-br ${suggestion.bgColor} rounded-xl border-2 ${suggestion.borderColor} hover:shadow-lg transition-all`}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`p-2 bg-opacity-50 rounded-lg ${suggestion.color.replace('text-', 'bg-').replace('-700', '-200')}`}>
                      <div className={suggestion.color}>
                        {suggestion.icon}
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900">{suggestion.text}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {suggestion.category === 'objection' && 'Comment répondre aux préoccupations courantes'}
                    {suggestion.category === 'email' && 'Améliorer le ton et la clarté de vos messages'}
                    {suggestion.category === 'negotiation' && 'Conseils pour négocier efficacement'}
                    {suggestion.category === 'market' && 'Obtenir des insights sur votre zone'}
                    {suggestion.category === 'client' && 'Mieux comprendre les besoins clients'}
                    {suggestion.category === 'pricing' && 'Évaluer la valeur d\'un bien'}
                  </p>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Conversation Area */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-3xl p-6 mb-6 shadow-lg"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-xl">
                <MessageSquare className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Conversation</h2>
            </div>

            {/* Messages */}
            <div className="mb-6 max-h-[500px] overflow-y-auto pr-2 space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className={`flex items-start space-x-3 ${message.type === 'user' ? 'justify-end flex-row-reverse' : 'justify-start'}`}
                  >
                    {message.type === 'assistant' && (
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center shadow-md">
                        <Brain className="w-5 h-5 text-white" strokeWidth={1.5} />
                      </div>
                    )}
                    <div className={`flex-1 max-w-[80%] ${message.type === 'user' ? 'flex flex-col items-end' : ''}`}>
                      <div className={`rounded-2xl p-4 ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-tr-sm'
                          : 'bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-tl-sm'
                      }`}>
                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      </div>
                      <div className={`flex items-center space-x-4 mt-2 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                        <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
                        {message.type === 'assistant' && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(message.content)}
                              className="h-6 w-6 p-0 text-gray-400 hover:text-primary-600"
                            >
                              <Copy className="h-3 w-3" strokeWidth={1.5} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-gray-400 hover:text-primary-600"
                            >
                              <ThumbsUp className="h-3 w-3" strokeWidth={1.5} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-gray-400 hover:text-primary-600"
                            >
                              <ThumbsDown className="h-3 w-3" strokeWidth={1.5} />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start space-x-3"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" strokeWidth={1.5} />
                  </div>
                  <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-2xl rounded-tl-sm p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Posez une question au Copilote IA..."
                className="w-full p-4 pr-14 border-2 border-gray-200 rounded-2xl resize-none focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-all min-h-[100px]"
                rows={3}
              />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => handleSendMessage(inputValue)}
                  disabled={!inputValue.trim() || isLoading}
                  className="absolute bottom-4 right-4 p-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" strokeWidth={1.5} />
                  ) : (
                    <Send className="w-5 h-5" strokeWidth={1.5} />
                  )}
                </Button>
              </motion.div>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Appuyez sur Entrée pour envoyer, Maj+Entrée pour une nouvelle ligne
            </p>
          </motion.div>

          {/* Conversation History */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-3xl p-6 shadow-lg"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <Clock className="w-5 h-5 text-indigo-600" strokeWidth={1.5} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Historique des Conversations</h2>
            </div>

            {/* Empty State */}
            <div className="text-center py-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.4 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4"
              >
                <Clock className="w-10 h-10 text-gray-400" strokeWidth={1.5} />
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune conversation sauvegardée</h3>
              <p className="text-sm text-gray-500 mb-4">Vos conversations seront sauvegardées ici</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleNewConversation}
                  className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium"
                >
                  <Sparkles className="mr-2 h-4 w-4" strokeWidth={1.5} />
                  Commencer une nouvelle conversation
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </main>
      </div>

      {/* AI Status Indicator */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-8 left-8 bg-white/95 backdrop-blur-xl border-primary-200/50 rounded-full px-4 py-3 shadow-lg z-50 flex items-center space-x-3"
      >
        <div className="relative">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <motion.div
            className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full"
            animate={{
              scale: [1, 2, 1],
              opacity: [1, 0, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        </div>
        <span className="text-sm font-semibold text-gray-700">IA Active</span>
      </motion.div>

      {/* Floating Chat Button */}
      <motion.button
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-full shadow-2xl z-50 flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          boxShadow: [
            "0 0 20px rgba(124, 92, 219, 0.4)",
            "0 0 40px rgba(124, 92, 219, 0.6)",
            "0 0 20px rgba(124, 92, 219, 0.4)",
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <MessageCircle className="w-6 h-6" strokeWidth={1.5} />
      </motion.button>
    </div>
  )
}
