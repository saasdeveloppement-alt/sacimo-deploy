"use client"

import { useEffect, useState } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"

interface CustomCursorProps {
  children: React.ReactNode
}

export function CustomCursor({ children }: CustomCursorProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [cursorText, setCursorText] = useState("")
  const [isHovering, setIsHovering] = useState(false)

  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  const springConfig = { damping: 25, stiffness: 700 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  const scale = useTransform(cursorXSpring, [-100, 0], [1, 1.8])
  const opacity = useTransform(cursorXSpring, [-100, 0], [0, 1])

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16)
      cursorY.set(e.clientY - 16)
      setIsVisible(true)
    }

    const handleMouseEnter = () => setIsVisible(true)
    const handleMouseLeave = () => setIsVisible(false)

    const handleMagneticHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const magneticTarget = target.closest('[data-magnetic]')
      
      if (magneticTarget) {
        setIsHovering(true)
        setCursorText(target.getAttribute('data-cursor') || '')
      } else {
        setIsHovering(false)
        setCursorText("")
      }
    }

    window.addEventListener("mousemove", moveCursor)
    window.addEventListener("mouseenter", handleMouseEnter)
    window.addEventListener("mouseleave", handleMouseLeave)
    window.addEventListener("mouseover", handleMagneticHover)

    return () => {
      window.removeEventListener("mousemove", moveCursor)
      window.removeEventListener("mouseenter", handleMouseEnter)
      window.removeEventListener("mouseleave", handleMouseLeave)
      window.removeEventListener("mouseover", handleMagneticHover)
    }
  }, [cursorX, cursorY])

  return (
    <>
      {children}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 bg-blue-500/20 backdrop-blur-sm rounded-full pointer-events-none z-50 mix-blend-difference"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          scale: isHovering ? scale : 1,
          opacity: isVisible ? opacity : 0,
        }}
        animate={{
          scale: isHovering ? 1.8 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
        }}
      >
        {cursorText && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            {cursorText}
          </motion.div>
        )}
      </motion.div>
    </>
  )
}

