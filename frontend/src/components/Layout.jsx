import { Box } from '@mui/material';
import Navigation from './Navigation';
import Footer from './Footer';

export default function Layout({ children, isLoggedIn = false, hideFooter = false, showReturnToDashboard = false }) {
  return (
    <Box 
      minHeight="100vh" 
      display="flex" 
      flexDirection="column"
      sx={{
        scrollBehavior: 'smooth',
        // Optimize for mobile scrolling performance
        WebkitOverflowScrolling: 'touch',
        // Prevent horizontal scroll on mobile
        overflowX: 'hidden',
      }}
    >
      <Navigation 
        isLoggedIn={isLoggedIn} 
        showReturnToDashboard={showReturnToDashboard} 
      />
      {/* Toolbar placeholder to prevent content from hiding under AppBar */}
      <Box sx={{ height: { xs: '56px', sm: '64px', md: '64px' } }} />
      
      <Box 
        component="main" 
        flexGrow={1}
        sx={{
          // Ensure proper mobile scrolling
          WebkitOverflowScrolling: 'touch',
          // No padding needed since we added a placeholder Box
        }}
      >
        {children}
      </Box>
      
      {!hideFooter && <Footer />}
    </Box>
  );
}
