import "@/App.css";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { HelmetProvider } from "react-helmet-async";

// ScrollToTop component - scrolls to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

// Pages
import LandingPage from "@/pages/LandingPage";
import BookingPage from "@/pages/BookingPage";
import BookingSuccessPage from "@/pages/BookingSuccessPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import VakmanRegisterPage from "@/pages/VakmanRegisterPage";
import WachtwoordVergetenPage from "@/pages/WachtwoordVergetenPage";
import ResetWachtwoordPage from "@/pages/ResetWachtwoordPage";
import CustomerDashboard from "@/pages/CustomerDashboard";
import VakmanDashboard from "@/pages/VakmanDashboard";
import ServicePage from "@/pages/ServicePage";
import VVEPage from "@/pages/VVEPage";
import VakmanInfoPage from "@/pages/VakmanInfoPage";
import VakmanAppPage from "@/pages/VakmanAppPage";
import VakmanVoorwaardenPage from "@/pages/VakmanVoorwaardenPage";
import VakmanFAQPage from "@/pages/VakmanFAQPage";
import PartnerPage from "@/pages/PartnerPage";
import HorecaPage from "@/pages/HorecaPage";
import KantoorPage from "@/pages/KantoorPage";
import WinkelPage from "@/pages/WinkelPage";
import AffiliatePage from "@/pages/AffiliatePage";
import OverOnsPage from "@/pages/OverOnsPage";
import GarantiePage from "@/pages/GarantiePage";
import PrijsgidsenPage from "@/pages/PrijsgidsenPage";
import PremiumPage from "@/pages/PremiumPage";
import PremiumSuccessPage from "@/pages/PremiumSuccessPage";
import BlogPage from "@/pages/BlogPage";
import VacaturesPage from "@/pages/VacaturesPage";
import PrivacyPage from "@/pages/PrivacyPage";
import VoorwaardenPage from "@/pages/VoorwaardenPage";
import CookiePage from "@/pages/CookiePage";
import ReviewPage from "@/pages/ReviewPage";
import DienstenSelectiePage from "@/pages/DienstenSelectiePage";
import VakmanApprovePage from "@/pages/VakmanApprovePage";
import AdminDashboard from "@/pages/AdminDashboard";
import ProblemPage from "@/pages/ProblemPage";
import CityServicePage from "@/pages/CityServicePage";

// Belgian Pages
import BelgianLandingPage from "@/pages/belgium/BelgianLandingPage";
import BelgianCityServicePage from "@/pages/belgium/BelgianCityServicePage";
import BelgianServicePage from "@/pages/belgium/BelgianServicePage";
import BelgianBookingPage from "@/pages/belgium/BelgianBookingPage";
import BelgianOverOnsPage from "@/pages/belgium/BelgianOverOnsPage";
import BelgianPrijzenPage from "@/pages/belgium/BelgianPrijzenPage";
import BelgianVakmanPage from "@/pages/belgium/BelgianVakmanPage";
import BelgianGarantiePage from "@/pages/belgium/BelgianGarantiePage";
import BelgianProblemPage from "@/pages/belgium/BelgianProblemPage";

// Detect country from environment variable
const COUNTRY = process.env.REACT_APP_COUNTRY || "NL";
const IS_BELGIUM = COUNTRY === "BE";

function App() {
  return (
    <HelmetProvider>
      <div className="App">
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Main routes - serve Belgian or Dutch version based on COUNTRY env var */}
            {IS_BELGIUM ? (
              <>
                {/* Belgian Routes as Root for spoeddienst24.be */}
                <Route path="/" element={<BelgianLandingPage />} />
                <Route path="/boek" element={<BelgianBookingPage />} />
                <Route path="/dienst/:serviceSlug" element={<BelgianServicePage />} />
                <Route path="/over-ons" element={<BelgianOverOnsPage />} />
                <Route path="/prijzen" element={<BelgianPrijzenPage />} />
                <Route path="/vakman" element={<BelgianVakmanPage />} />
                <Route path="/garantie" element={<BelgianGarantiePage />} />
                {/* Belgian SEO Problem pages */}
                <Route path="/:slug" element={<BelgianProblemPage />} />
                {/* Belgian City+Service pages */}
                <Route path="/spoed-loodgieter/:citySlug" element={<BelgianCityServicePage />} />
                <Route path="/spoed-slotenmaker/:citySlug" element={<BelgianCityServicePage />} />
                <Route path="/spoed-elektricien/:citySlug" element={<BelgianCityServicePage />} />
              </>
            ) : (
              <>
                {/* Dutch Routes for spoeddienst24.nl */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/boek" element={<BookingPage />} />
                <Route path="/boek/:serviceType" element={<BookingPage />} />
                <Route path="/booking/:bookingId" element={<BookingPage />} />
                <Route path="/booking/success" element={<BookingSuccessPage />} />
                <Route path="/diensten/:slug" element={<ServicePage />} />
                {/* SEO City pagina's - moet VOOR de probleem pagina's staan */}
                <Route path="/spoed-loodgieter/:city" element={<CityServicePage />} />
                <Route path="/spoed-slotenmaker/:city" element={<CityServicePage />} />
                <Route path="/spoed-elektricien/:city" element={<CityServicePage />} />
                {/* SEO Probleem pagina's */}
                <Route path="/:slug" element={<ProblemPage />} />
                {/* Zakelijke pagina's */}
                <Route path="/vve" element={<VVEPage />} />
                <Route path="/horeca" element={<HorecaPage />} />
                <Route path="/kantoor" element={<KantoorPage />} />
                <Route path="/winkel" element={<WinkelPage />} />
                <Route path="/partner" element={<PartnerPage />} />
                <Route path="/affiliate" element={<AffiliatePage />} />
                {/* Vakman pagina's */}
                <Route path="/vakman" element={<VakmanInfoPage />} />
                <Route path="/vakman/app" element={<VakmanAppPage />} />
                <Route path="/vakman/voorwaarden" element={<VakmanVoorwaardenPage />} />
                <Route path="/vakman/faq" element={<VakmanFAQPage />} />
                {/* Info pagina's */}
                <Route path="/over-ons" element={<OverOnsPage />} />
                <Route path="/garantie" element={<GarantiePage />} />
                <Route path="/prijzen" element={<PrijsgidsenPage />} />
                <Route path="/premium" element={<PremiumPage />} />
                <Route path="/premium/success" element={<PremiumSuccessPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/vacatures" element={<VacaturesPage />} />
                {/* Juridische pagina's */}
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/voorwaarden" element={<VoorwaardenPage />} />
                <Route path="/cookies" element={<CookiePage />} />
                {/* Review pagina */}
                <Route path="/review" element={<ReviewPage />} />
                {/* Diensten selectie */}
                <Route path="/diensten" element={<DienstenSelectiePage />} />
                
                {/* Belgian Routes - accessible from Dutch site at /be */}
                <Route path="/be" element={<BelgianLandingPage />} />
                <Route path="/be/boek" element={<BelgianBookingPage />} />
                <Route path="/be/dienst/:serviceSlug" element={<BelgianServicePage />} />
                <Route path="/be/spoed-loodgieter/:citySlug" element={<BelgianCityServicePage />} />
                <Route path="/be/spoed-slotenmaker/:citySlug" element={<BelgianCityServicePage />} />
                <Route path="/be/spoed-elektricien/:citySlug" element={<BelgianCityServicePage />} />
              </>
            )}
            
            {/* Shared routes - available on both domains */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/vakman/register" element={<VakmanRegisterPage />} />
            <Route path="/wachtwoord-vergeten" element={<WachtwoordVergetenPage />} />
            <Route path="/reset-wachtwoord" element={<ResetWachtwoordPage />} />
            <Route path="/dashboard" element={<CustomerDashboard />} />
            <Route path="/vakman/dashboard" element={<VakmanDashboard />} />
            <Route path="/vakman/:vakmanId/approve" element={<VakmanApprovePage />} />
            <Route path="/booking/success" element={<BookingSuccessPage />} />
            
            {/* Admin Dashboard - available on both domains */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/beheer" element={<AdminDashboard />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </div>
    </HelmetProvider>
  );
}

export default App;
