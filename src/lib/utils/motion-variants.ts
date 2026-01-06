// Variantes Framer Motion standardisées pour la plateforme AFDR

// Fonction pour vérifier si l'utilisateur préfère les animations réduites (côté client uniquement)
export const getPrefersReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

// Utiliser false par défaut (sera vérifié côté client)
const prefersReducedMotion = false

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: prefersReducedMotion ? { duration: 0.01 } : { duration: 0.2 },
}

export const slideUp = {
  initial: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 },
  animate: prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
  exit: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 },
  transition: prefersReducedMotion ? { duration: 0.01 } : { duration: 0.2 },
}

export const slideDown = {
  initial: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -20 },
  animate: prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
  exit: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -20 },
  transition: prefersReducedMotion ? { duration: 0.01 } : { duration: 0.2 },
}

export const slideLeft = {
  initial: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 20 },
  animate: prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 },
  exit: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 20 },
  transition: prefersReducedMotion ? { duration: 0.01 } : { duration: 0.2 },
}

export const slideRight = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

export const scaleIn = {
  initial: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 },
  animate: prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 },
  exit: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 },
  transition: prefersReducedMotion ? { duration: 0.01 } : { duration: 0.2 },
}

export const scaleUp = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
}

// Transitions réutilisables
export const transitionFast = prefersReducedMotion
  ? { duration: 0.01 }
  : { duration: 0.15, ease: [0.4, 0, 0.2, 1] }

export const transitionNormal = prefersReducedMotion
  ? { duration: 0.01 }
  : { duration: 0.2, ease: [0.4, 0, 0.2, 1] }

export const transitionSlow = prefersReducedMotion
  ? { duration: 0.01 }
  : { duration: 0.3, ease: [0.4, 0, 0.2, 1] }

export const transitionBounce = prefersReducedMotion
  ? { duration: 0.01 }
  : { duration: 0.5, ease: [0.68, -0.55, 0.265, 1.55] }

// Variantes pour les containers avec stagger children
export const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: prefersReducedMotion
      ? { duration: 0.01 }
      : {
          staggerChildren: 0.1,
          delayChildren: 0.1,
        },
  },
}

export const containerFast = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: prefersReducedMotion
      ? { duration: 0.01 }
      : {
          staggerChildren: 0.05,
          delayChildren: 0.05,
        },
  },
}

export const item = {
  hidden: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 },
  show: prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
}

export const itemSlide = {
  hidden: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -20 },
  show: prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 },
}

// Variantes pour les pages
export const pageTransition = {
  initial: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 },
  animate: prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
  exit: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -20 },
  transition: transitionNormal,
}

// Variantes pour les modals/dialogs
export const modalTransition = {
  initial: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 },
  animate: prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 },
  exit: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 },
  transition: transitionNormal,
}

// Variantes pour les notifications
export const notificationTransition = {
  initial: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 300, scale: 0.8 },
  animate: prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 },
  exit: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 300, scale: 0.8 },
  transition: transitionBounce,
}

