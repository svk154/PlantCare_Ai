import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
// Import auth components (not lazy as they are small/core wrappers)
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { LanguageProvider } from './utils/languageContext';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DiseaseDetection = lazy(() => import('./pages/DiseaseDetection'));
const DiseaseScanPage = lazy(() => import('./pages/DiseaseScanPage'));
const CalculatorFertilizer = lazy(() => import('./pages/CalculatorFertilizer'));
const PesticideCalculatorPage = lazy(() => import('./pages/PesticideCalculatorPage'));
const CalculatorProfit = lazy(() => import('./pages/CalculatorProfit'));
const FarmLedger = lazy(() => import('./pages/FarmLedger'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const CommunityForum = lazy(() => import('./pages/CommunityForum'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Feedback = lazy(() => import('./pages/Feedback'));
const Weather = lazy(() => import('./pages/Weather'));
const ActiveFarms = lazy(() => import('./pages/ActiveFarms'));
const CropsPage = lazy(() => import('./pages/CropsPage'));
const FarmResources = lazy(() => import('./pages/FarmResources'));
const CropRecommendation = lazy(() => import('./pages/CropRecommendation'));
const YieldPrediction = lazy(() => import('./pages/YieldPrediction'));

// page components are lazy-loaded below

function App() {
  // Authentication state is now handled by the auth utilities
  // and ProtectedRoute component

  return (
    <LanguageProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <ScrollToTop />
          <Suspense fallback={null}>
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route 
            path="/login" 
            element={<Login />} 
          />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/active-farms" element={
            <ProtectedRoute>
              <ActiveFarms />
            </ProtectedRoute>
          } />
          <Route path="/crops" element={
            <ProtectedRoute>
              <CropsPage />
            </ProtectedRoute>
          } />
          <Route path="/disease-detection" element={
            <ProtectedRoute>
              <DiseaseDetection />
            </ProtectedRoute>
          } />
          <Route path="/disease-scans" element={
            <ProtectedRoute>
              <DiseaseScanPage />
            </ProtectedRoute>
          } />
          <Route path="/calculator-fertilizer" element={
            <ProtectedRoute>
              <CalculatorFertilizer />
            </ProtectedRoute>
          } />
          <Route path="/pesticide-calculator" element={
            <ProtectedRoute>
              <PesticideCalculatorPage />
            </ProtectedRoute>
          } />
          <Route path="/calculator-pesticide" element={
            <ProtectedRoute>
              <PesticideCalculatorPage />
            </ProtectedRoute>
          } />
          <Route path="/calculator-profit" element={
            <ProtectedRoute>
              <CalculatorProfit />
            </ProtectedRoute>
          } />
          <Route path="/crop-recommendation" element={
            <ProtectedRoute>
              <CropRecommendation />
            </ProtectedRoute>
          } />
          <Route path="/yield-prediction" element={
            <ProtectedRoute>
              <YieldPrediction />
            </ProtectedRoute>
          } />
          <Route path="/farm-ledger" element={
            <ProtectedRoute>
              <FarmLedger />
            </ProtectedRoute>
          } />
          <Route path="/transactions" element={
            <ProtectedRoute>
              <FarmLedger />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/forum" element={
            <ProtectedRoute>
              <CommunityForum />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="/weather" element={
            <ProtectedRoute>
              <Weather />
            </ProtectedRoute>
          } />
          <Route path="/farm-resources" element={
            <ProtectedRoute>
              <FarmResources />
            </ProtectedRoute>
          } />
          <Route path="/feedback" element={
            <ProtectedRoute>
              <Feedback />
            </ProtectedRoute>
          } />
        </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
