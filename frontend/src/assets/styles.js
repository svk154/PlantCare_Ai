// Background patterns and reusable styles for the app

export const backgroundStyles = {
  // Main gradient backgrounds
  primaryGradient: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #ecfdf5 100%)',
  secondaryGradient: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #e0f7fa 100%)',
  darkGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  
  // Pattern backgrounds with opacity
  leafPattern: {
    backgroundImage: `url('/src/assets/leaf-pattern.png')`,
    backgroundSize: '300px',
    backgroundRepeat: 'repeat',
    backgroundPosition: 'center',
    opacity: 0.07,
  },
  
  dotPattern: {
    backgroundImage: 'radial-gradient(#16a34a 2px, transparent 2px)',
    backgroundSize: '30px 30px',
    opacity: 0.08,
  },
  
  // Hero section backgrounds
  heroBackground: {
    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #ecfdf5 100%)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `url('/src/assets/farm-pattern.png')`,
      backgroundSize: '500px',
      backgroundRepeat: 'repeat',
      opacity: 0.06,
      zIndex: 0,
    }
  },
  
  // Card hover effects
  cardHoverEffect: {
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    },
  },
  
  // Glassmorphism effects
  glassmorphism: {
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: 16,
    border: '1px solid rgba(255, 255, 255, 0.18)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)',
  },
  
  // Text with gradient
  gradientText: {
    background: 'linear-gradient(90deg, #16a34a, #059669)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'inline-block',
  },
  
  // Section dividers
  sectionDivider: {
    position: 'relative',
    height: '60px',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      height: '60px',
      background: 'url("/src/assets/wave-divider.svg") no-repeat center bottom',
      backgroundSize: 'cover',
      zIndex: 1,
    }
  },
};

// Animation variants for framer-motion
export const animationVariants = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } }
  },
  slideUp: {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 12 } }
  },
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  },
  staggerItem: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  },
  popIn: {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      transition: { type: 'spring', stiffness: 300, damping: 15 } 
    }
  },
  // Mobile-optimized variants with reduced motion
  mobileFadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } }
  },
  mobileSlideUp: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  },
  mobileStaggerItem: {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
  }
};

// Responsive design helpers
export const responsiveStyles = {
  container: {
    maxWidth: {
      xs: '100%',
      sm: '540px',
      md: '720px',
      lg: '960px',
      xl: '1140px',
    },
    mx: 'auto',
    px: { xs: 2, sm: 3, md: 4 },
  },
  flexColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  flexRow: {
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
  },
  flexCenter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
};
