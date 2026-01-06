// Utilitaires d'animation pour la plateforme AFDR

import { Variants, Transition } from "framer-motion"

/**
 * Crée une variante d'animation fade in
 */
export function createFadeIn(delay = 0): Variants {
  return {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { delay, duration: 0.2 }
    },
    exit: { opacity: 0 },
  }
}

/**
 * Crée une variante d'animation slide up
 */
export function createSlideUp(delay = 0, distance = 20): Variants {
  return {
    initial: { opacity: 0, y: distance },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { delay, duration: 0.2 }
    },
    exit: { opacity: 0, y: distance },
  }
}

/**
 * Crée une variante d'animation scale in
 */
export function createScaleIn(delay = 0): Variants {
  return {
    initial: { opacity: 0, scale: 0.95 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { delay, duration: 0.2 }
    },
    exit: { opacity: 0, scale: 0.95 },
  }
}

/**
 * Crée une transition personnalisée
 */
export function createTransition(
  duration = 0.2,
  ease: [number, number, number, number] = [0.4, 0, 0.2, 1]
): Transition {
  return { duration, ease }
}

/**
 * Vérifie si l'utilisateur préfère les animations réduites
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/**
 * Retourne une transition adaptée selon les préférences utilisateur
 */
export function getTransition(
  normal: Transition,
  reduced?: Transition
): Transition {
  if (prefersReducedMotion() && reduced) {
    return reduced
  }
  return normal
}

/**
 * Crée une variante de container avec stagger
 */
export function createStaggerContainer(
  staggerDelay = 0.1,
  childDelay = 0.1
): Variants {
  return {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: childDelay,
      },
    },
  }
}

/**
 * Variante pour les items dans un container stagger
 */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

