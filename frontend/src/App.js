import "@/App.css";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

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

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/boek/:serviceType" element={<BookingPage />} />
          <Route path="/booking/:bookingId" element={<BookingPage />} />
          <Route path="/booking/success" element={<BookingSuccessPage />} />
          <Route path="/diensten/:slug" element={<ServicePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/vakman/register" element={<VakmanRegisterPage />} />
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/vakman/dashboard" element={<VakmanDashboard />} />
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
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
