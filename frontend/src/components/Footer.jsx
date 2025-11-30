import { Box, Container, Typography, Link, Grid, IconButton, Divider } from '@mui/material';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <Box 
      component="footer" 
      sx={{
        bgcolor: '#f0fdf4',
        py: 6,
        borderTop: '1px solid',
        borderColor: 'rgba(0, 0, 0, 0.06)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(#16a34a 2px, transparent 2px)',
          backgroundSize: '30px 30px',
          opacity: 0.05,
          zIndex: 0,
        }
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <Grid container spacing={4}>
            {/* Brand and description */}
            <Grid item xs={12} md={4}>
              <motion.div variants={itemVariants}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Leaf size={32} color="#16a34a" />
                  <Typography fontWeight="bold" variant="h5" color="#166534">
                    PlantCare AI
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Revolutionizing agriculture with AI-powered plant disease detection, personalized farm management, and comprehensive agricultural tools.
                </Typography>
                <Box display="flex" gap={1}>
                  <IconButton size="small" sx={{ color: '#16a34a', '&:hover': { bgcolor: 'rgba(22, 163, 74, 0.1)' } }}>
                    <Facebook size={20} />
                  </IconButton>
                  <IconButton size="small" sx={{ color: '#16a34a', '&:hover': { bgcolor: 'rgba(22, 163, 74, 0.1)' } }}>
                    <Twitter size={20} />
                  </IconButton>
                  <IconButton size="small" sx={{ color: '#16a34a', '&:hover': { bgcolor: 'rgba(22, 163, 74, 0.1)' } }}>
                    <Instagram size={20} />
                  </IconButton>
                  <IconButton size="small" sx={{ color: '#16a34a', '&:hover': { bgcolor: 'rgba(22, 163, 74, 0.1)' } }}>
                    <Linkedin size={20} />
                  </IconButton>
                </Box>
              </motion.div>
            </Grid>

            {/* Quick links */}
            <Grid item xs={6} md={2}>
              <motion.div variants={itemVariants}>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>
                  Features
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  {['Disease Detection', 'Weather Forecast', 'Calculators', 'Community Forum'].map((item) => (
                    <Link key={item} href="#" underline="hover" color="text.secondary" sx={{ '&:hover': { color: '#16a34a' } }}>
                      {item}
                    </Link>
                  ))}
                </Box>
              </motion.div>
            </Grid>

            {/* Company links */}
            <Grid item xs={6} md={2}>
              <motion.div variants={itemVariants}>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>
                  Company
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  {['About Us', 'Careers', 'Blog', 'Press Kit'].map((item) => (
                    <Link key={item} href="#" underline="hover" color="text.secondary" sx={{ '&:hover': { color: '#16a34a' } }}>
                      {item}
                    </Link>
                  ))}
                </Box>
              </motion.div>
            </Grid>

            {/* Support links */}
            <Grid item xs={6} md={2}>
              <motion.div variants={itemVariants}>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>
                  Support
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map((item) => (
                    <Link key={item} href="#" underline="hover" color="text.secondary" sx={{ '&:hover': { color: '#16a34a' } }}>
                      {item}
                    </Link>
                  ))}
                </Box>
              </motion.div>
            </Grid>

            {/* Contact */}
            <Grid item xs={6} md={2}>
              <motion.div variants={itemVariants}>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>
                  Contact
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Typography variant="body2" color="text.secondary">
                    Email: info@plantcare.ai
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Phone: +1 (555) 123-4567
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Address: 123 Farm Road, AgriTech Valley
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />
          
          <motion.div variants={itemVariants}>
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'center', md: 'flex-start' }} textAlign={{ xs: 'center', md: 'left' }}>
              <Typography variant="body2" color="text.secondary">
                © {new Date().getFullYear()} PlantCare AI. All rights reserved.
              </Typography>
              <Box display="flex" gap={3} mt={{ xs: 2, md: 0 }}>
                <Link href="#" underline="hover" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  Privacy Policy
                </Link>
                <Link href="#" underline="hover" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  Terms of Service
                </Link>
                <Link href="#" underline="hover" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  Cookies
                </Link>
              </Box>
            </Box>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
}
