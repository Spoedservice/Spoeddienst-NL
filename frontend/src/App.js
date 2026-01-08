import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

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

function App() {
  return (
    <div className="App">
      <BrowserRouter>
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
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
