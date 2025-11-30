import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Avatar
} from '@mui/material';
import {
  Search,
  ChevronDown,
  Leaf,
  Droplets,
  Bug,
  Calendar,
  Shield,
  Sprout,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const FarmResources = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  // Categories for filtering
  const categories = [
    { id: 'all', label: 'All Topics', icon: BookOpen, color: '#3b82f6' },
    { id: 'planting', label: 'Planting & Seeds', icon: Sprout, color: '#10b981' },
    { id: 'watering', label: 'Water Management', icon: Droplets, color: '#06b6d4' },
    { id: 'pest', label: 'Pest Control', icon: Bug, color: '#f59e0b' },
    { id: 'seasonal', label: 'Seasonal Care', icon: Calendar, color: '#8b5cf6' },
    { id: 'soil', label: 'Soil Health', icon: Leaf, color: '#84cc16' },
    { id: 'weather', label: 'Weather Protection', icon: Shield, color: '#ef4444' },
  ];

  // Enhanced farming resources with detailed content
  const farmingResources = [
    {
      id: 1,
      category: 'seasonal',
      title: 'September Planting Guide',
      subtitle: 'Best crops for autumn planting',
      description: 'Optimal crops to plant in September for harvest before winter frost.',
      icon: Calendar,
      color: '#8b5cf6',
      content: [
        {
          section: 'Cool Season Vegetables',
          items: [
            'Spinach - Direct sow, harvest in 45-60 days',
            'Lettuce - Multiple varieties, succession plant every 2 weeks',
            'Radishes - Fast growing, ready in 30 days',
            'Kale - Frost tolerant, sweeter after light frost',
            'Carrots - Plant for winter harvest, cover if needed'
          ]
        },
        {
          section: 'Cover Crops',
          items: [
            'Winter Rye - Excellent soil cover and nitrogen fixation',
            'Crimson Clover - Adds nitrogen, beautiful spring flowers',
            'Austrian Peas - Cold hardy, good ground cover'
          ]
        },
        {
          section: 'Preparation Tips',
          items: [
            'Test soil pH before planting',
            'Add compost to improve soil structure',
            'Plan for row covers if early frost expected',
            'Start seeds indoors for faster establishment'
          ]
        }
      ]
    },
    {
      id: 2,
      category: 'watering',
      title: 'Smart Irrigation Techniques',
      subtitle: 'Reduce water usage by 40%',
      description: 'Efficient watering methods that conserve water while maintaining healthy crops.',
      icon: Droplets,
      color: '#06b6d4',
      content: [
        {
          section: 'Drip Irrigation Benefits',
          items: [
            'Delivers water directly to root zone',
            'Reduces evaporation by up to 50%',
            'Prevents weed growth between plants',
            'Consistent moisture levels reduce plant stress'
          ]
        },
        {
          section: 'Watering Schedule Optimization',
          items: [
            'Water early morning (6-8 AM) for best absorption',
            'Check soil moisture 2-3 inches deep before watering',
            'Deep, less frequent watering encourages root growth',
            'Adjust frequency based on weather conditions'
          ]
        },
        {
          section: 'Water Conservation Methods',
          items: [
            'Install rain barrels to collect rainwater',
            'Use mulch to retain soil moisture',
            'Group plants with similar water needs',
            'Choose drought-resistant crop varieties'
          ]
        }
      ]
    },
    {
      id: 3,
      category: 'pest',
      title: 'Natural Pest Prevention',
      subtitle: 'Chemical-free pest control',
      description: 'Organic methods to prevent and control common garden pests.',
      icon: Bug,
      color: '#f59e0b',
      content: [
        {
          section: 'Companion Planting',
          items: [
            'Marigolds repel aphids, whiteflies, and nematodes',
            'Basil planted near tomatoes improves flavor and deters pests',
            'Nasturtiums act as trap crops for aphids and cucumber beetles',
            'Mint deters ants and rodents (plant in containers)'
          ]
        },
        {
          section: 'Natural Deterrents',
          items: [
            'Neem oil spray for soft-bodied insects',
            'Diatomaceous earth for crawling insects',
            'Beer traps for slugs and snails',
            'Soap spray (1 tbsp dish soap per quart water)'
          ]
        },
        {
          section: 'Prevention Strategies',
          items: [
            'Regular crop rotation breaks pest cycles',
            'Remove plant debris where pests overwinter',
            'Encourage beneficial insects with diverse plantings',
            'Use row covers during vulnerable growth stages'
          ]
        }
      ]
    },
    {
      id: 4,
      category: 'soil',
      title: 'Building Healthy Soil',
      subtitle: 'Foundation of successful farming',
      description: 'Essential practices for creating and maintaining fertile, productive soil.',
      icon: Leaf,
      color: '#84cc16',
      content: [
        {
          section: 'Soil Testing & Analysis',
          items: [
            'Test pH levels - most vegetables prefer 6.0-7.0',
            'Check nutrient levels (N-P-K and micronutrients)',
            'Assess soil texture and drainage',
            'Test for organic matter content (aim for 3-5%)'
          ]
        },
        {
          section: 'Organic Matter Addition',
          items: [
            'Compost - adds nutrients and improves soil structure',
            'Well-aged manure - high in nitrogen and organic matter',
            'Leaf mold - excellent for moisture retention',
            'Green manures - crops grown specifically to improve soil'
          ]
        },
        {
          section: 'Soil Protection',
          items: [
            'Avoid walking on wet soil to prevent compaction',
            'Use raised beds in areas with poor drainage',
            'Keep soil covered with plants or mulch',
            'Practice no-till or minimal tillage methods'
          ]
        }
      ]
    },
    {
      id: 5,
      category: 'planting',
      title: 'Seed Starting Success',
      subtitle: 'From seed to strong seedlings',
      description: 'Professional techniques for starting seeds indoors and outdoors.',
      icon: Sprout,
      color: '#10b981',
      content: [
        {
          section: 'Indoor Seed Starting',
          items: [
            'Use sterile seed starting mix to prevent disease',
            'Maintain consistent temperature (65-75°F for most seeds)',
            'Provide 12-16 hours of light daily with grow lights',
            'Keep soil moist but not waterlogged'
          ]
        },
        {
          section: 'Transplanting Tips',
          items: [
            'Harden off seedlings gradually over 7-10 days',
            'Transplant on cloudy days or in evening',
            'Water transplants immediately after planting',
            'Use row covers if cool weather threatens'
          ]
        },
        {
          section: 'Direct Seeding',
          items: [
            'Prepare seedbed with fine, smooth soil surface',
            'Plant at proper depth (2-3 times seed diameter)',
            'Keep soil consistently moist until germination',
            'Thin seedlings to prevent overcrowding'
          ]
        }
      ]
    },
    {
      id: 6,
      category: 'weather',
      title: 'Weather Protection Strategies',
      subtitle: 'Safeguard crops from extreme weather',
      description: 'Methods to protect your crops from frost, heat, wind, and storms.',
      icon: Shield,
      color: '#ef4444',
      content: [
        {
          section: 'Frost Protection',
          items: [
            'Use row covers or blankets for light frost protection',
            'Water plants before frost - moist soil retains heat',
            'Create windbreaks to reduce heat loss',
            'Harvest tender crops before first frost'
          ]
        },
        {
          section: 'Heat Stress Prevention',
          items: [
            'Provide afternoon shade with shade cloth (30-50%)',
            'Increase watering frequency during heat waves',
            'Mulch heavily to keep soil cool',
            'Plant heat-tolerant varieties in hot climates'
          ]
        },
        {
          section: 'Storm Preparation',
          items: [
            'Stake tall plants securely before storm season',
            'Harvest ripe crops before storms arrive',
            'Clear drainage areas to prevent flooding',
            'Have row covers ready for hail protection'
          ]
        }
      ]
    }
  ];

  // Filter resources based on search and category
  const filteredResources = farmingResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout isLoggedIn={true}>
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box textAlign="center" mb={4}>
            <Typography variant="h3" fontWeight={700} color="#171717" mb={2}>
              Farm Resources & Guides
            </Typography>
            <Typography variant="h6" color="text.secondary" mb={4}>
              Expert farming knowledge to help you grow better crops and manage your farm effectively
            </Typography>
          </Box>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card elevation={2} sx={{ mb: 4, borderRadius: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Search farming topics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search size={20} color="#6b7280" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {categories.map((category) => {
                      const IconComponent = category.icon;
                      return (
                        <Chip
                          key={category.id}
                          label={category.label}
                          icon={<IconComponent size={16} />}
                          onClick={() => setSelectedCategory(category.id)}
                          variant={selectedCategory === category.id ? "filled" : "outlined"}
                          sx={{
                            borderRadius: 2,
                            backgroundColor: selectedCategory === category.id ? category.color : 'transparent',
                            borderColor: category.color,
                            color: selectedCategory === category.id ? 'white' : category.color,
                            '&:hover': {
                              backgroundColor: selectedCategory === category.id ? category.color : `${category.color}20`,
                            }
                          }}
                        />
                      );
                    })}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </motion.div>

        {/* Resources Grid */}
        <Grid container spacing={3} justifyContent="center">
          {filteredResources.map((resource, index) => {
            const IconComponent = resource.icon;
            return (
              <Grid item xs={12} md={10} lg={6} key={resource.id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                >
                  <Card 
                    elevation={2} 
                    sx={{ 
                      borderRadius: 4,
                      height: '100%',
                      minHeight: 480,
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '4px',
                        background: `linear-gradient(90deg, ${resource.color}, ${resource.color}80)`,
                        zIndex: 1,
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      {/* Header */}
                      <Box display="flex" alignItems="center" mb={3}>
                        <Avatar
                          sx={{ 
                            bgcolor: `${resource.color}20`, 
                            color: resource.color,
                            mr: 2,
                            width: 48,
                            height: 48
                          }}
                        >
                          <IconComponent size={24} />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight="bold" color="#171717">
                            {resource.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {resource.subtitle}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant="body2" color="text.secondary" mb={3}>
                        {resource.description}
                      </Typography>

                      {/* Content Sections */}
                      {resource.content.map((section, sectionIndex) => (
                        <Accordion 
                          key={sectionIndex}
                          elevation={0}
                          sx={{ 
                            mb: 1,
                            '&:before': { display: 'none' },
                            '& .MuiAccordionSummary-root': {
                              minHeight: 48,
                              '&.Mui-expanded': {
                                minHeight: 48,
                              }
                            }
                          }}
                        >
                          <AccordionSummary 
                            expandIcon={<ChevronDown size={20} />}
                            sx={{ 
                              bgcolor: `${resource.color}10`,
                              borderRadius: 2,
                              mb: 1
                            }}
                          >
                            <Typography fontWeight="600" color={resource.color}>
                              {section.section}
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails sx={{ pt: 0 }}>
                            <Box component="ul" sx={{ pl: 2, m: 0 }}>
                              {section.items.map((item, itemIndex) => (
                                <Typography 
                                  key={itemIndex}
                                  component="li" 
                                  variant="body2" 
                                  sx={{ mb: 1, lineHeight: 1.6 }}
                                >
                                  {item}
                                </Typography>
                              ))}
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>

        {/* No Results Message */}
        {filteredResources.length === 0 && (
          <Box textAlign="center" py={8}>
            <BookOpen size={64} color="#d1d5db" style={{ marginBottom: 16 }} />
            <Typography variant="h6" color="text.secondary" mb={2}>
              No resources found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search terms or selecting a different category
            </Typography>
          </Box>
        )}

        {/* Bottom Call-to-Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card 
            elevation={3}
            sx={{ 
              mt: 6,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white'
            }}
          >
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <TrendingUp size={48} style={{ marginBottom: 16, opacity: 0.9 }} />
              <Typography variant="h5" fontWeight="bold" mb={2}>
                Need More Specific Advice?
              </Typography>
              <Typography variant="body1" mb={3} sx={{ opacity: 0.9 }}>
                Use our Disease Detection tool to get personalized recommendations for your crops,
                or explore our Analytics page for data-driven farming insights.
              </Typography>
              <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
                <Button
                  variant="contained"
                  onClick={() => navigate('/disease-detection')}
                  sx={{
                    bgcolor: 'white',
                    color: '#10b981',
                    '&:hover': { bgcolor: '#f8fafc' },
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Try Disease Detection
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/analytics')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  View Analytics
                </Button>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Layout>
  );
};

export default FarmResources;