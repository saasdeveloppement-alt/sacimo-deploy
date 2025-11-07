"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, X, ChevronDown } from "lucide-react"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const hasSidebar = pathname?.startsWith('/app')

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 h-16 bg-gradient-to-r from-violet-950 via-violet-900 to-indigo-900 border-b border-white/10 ${hasSidebar ? 'left-[260px] right-0 z-40' : 'left-0 right-0 z-50'}`}
    >
      <div className={`h-full flex items-center justify-between px-6 ${hasSidebar ? '' : 'container mx-auto'}`}>
        {/* Logo - UNIQUEMENT si pas de sidebar (pages publiques) */}
        {!hasSidebar && (
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-white">SACIMO</span>
          </Link>
        )}

        {/* Menu central */}
        <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
          <Link
            href="/features"
            className="text-white/80 hover:text-white transition-colors font-medium"
            data-magnetic
            data-cursor="Voir"
          >
            Fonctionnalités
          </Link>
          
          <Link
            href="/pricing"
            className="text-white/80 hover:text-white transition-colors font-medium"
            data-magnetic
            data-cursor="Voir"
          >
            Tarifs
          </Link>

          <Link
            href="/contact"
            className="text-white/80 hover:text-white transition-colors font-medium"
            data-magnetic
            data-cursor="Voir"
          >
            Contact
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-1 text-white/80 hover:text-white transition-colors font-medium">
                <span>Ressources</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href="/resources/faq">FAQ</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/resources/docs">Documentation</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/blog">Blog</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-1 text-white/80 hover:text-white transition-colors font-medium">
                <span>À propos</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href="/about/mission">Mission</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/about/team">Équipe</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/contact">Contact</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" className="text-white hover:bg-white/10" asChild>
            <Link href="/auth/signin">Connexion</Link>
          </Button>
          <Button className="bg-white text-violet-900 hover:bg-white/90" asChild data-magnetic data-cursor="Try">
            <Link href="/auth/signup">Essai gratuit</Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-white/10 py-4 px-6"
        >
          <div className="flex flex-col space-y-4">
            <Link
              href="/features"
              className="text-white/80 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Fonctionnalités
            </Link>
            <Link
              href="/pricing"
              className="text-white/80 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Tarifs
            </Link>
            <Link
              href="/resources/faq"
              className="text-white/80 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              FAQ
            </Link>
            <Link
              href="/resources/docs"
              className="text-white/80 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Documentation
            </Link>
            <Link
              href="/about/mission"
              className="text-white/80 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Mission
            </Link>
            <Link
              href="/contact"
              className="text-white/80 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
            <div className="flex flex-col space-y-2 pt-4 border-t border-white/10">
              <Button variant="ghost" className="text-white hover:bg-white/10" asChild>
                <Link href="/auth/signin" onClick={() => setIsOpen(false)}>
                  Connexion
                </Link>
              </Button>
              <Button className="bg-white text-violet-900 hover:bg-white/90" asChild>
                <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                  Essai gratuit
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}











