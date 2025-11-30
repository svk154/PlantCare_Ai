import { Card, CardContent, Typography, Button, Box, Divider, Chip, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import ShieldIcon from '@mui/icons-material/Shield';
import ScienceIcon from '@mui/icons-material/Science';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export default function DiseaseResultCard({
  disease = "Powdery Mildew",
  plantImage = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  pesticide = "Mancozeb 75% WP",
  pesticideType = "Chemical", // or "Organic"
  dosage = "2g per litre",
  precautions = "Wear gloves & mask",
  buyLink = "https://agribegri.com/product/mancozeb"
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, type: 'spring', bounce: 0.38 }}
    >
      <Card elevation={6} sx={{ maxWidth: 430, mx: 'auto', borderRadius: 5, p: 2 }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Avatar
            alt={disease}
            src={plantImage}
            sx={{ width: 88, height: 88, mb: 2, border: '3px solid #43a047' }}
            variant="rounded"
          />
          <Typography variant="h5" fontWeight={700} gutterBottom color="primary.dark">
            {disease}
          </Typography>
          <Chip
            label={pesticideType === "Organic" ? "Organic" : "Chemical"}
            color={pesticideType === "Organic" ? "success" : "secondary"}
            icon={pesticideType === "Organic" ? <ShieldIcon /> : <ScienceIcon />}
            sx={{ mb: 2, fontSize: "1rem" }}
          />
        </Box>
        <Divider sx={{ my: 2 }} />
        <CardContent>
          <Typography fontWeight={600} mb={1}>
            Recommended Pesticide:
          </Typography>
          <Typography gutterBottom>{pesticide}</Typography>
          <Typography fontWeight={600} mb={1}>
            Dosage:
          </Typography>
          <Typography gutterBottom>{dosage}</Typography>
          <Typography display="flex" alignItems="center" fontWeight={600} mb={1}>
            <InfoOutlinedIcon color="warning" sx={{ mr: 1 }} /> Precautions:
          </Typography>
          <Typography gutterBottom>{precautions}</Typography>
          <Button
            href={buyLink}
            variant="contained"
            color="success"
            endIcon={<OpenInNewIcon />}
            target="_blank"
            sx={{ mt: 3, borderRadius: 8, width: 1 }}
            component={motion.a}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
          >
            Buy Now from Supplier
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
