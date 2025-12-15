import { Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PlanesPage from "./pages/PlanesPage/index";
import RevendedoresPage from "./pages/RevendedoresPage";
import ServersPage from "./pages/ServersPage/index";
import AboutPage from "./pages/AboutPage/index";
import SuccessPage from "./pages/SuccessPage";
import ErrorPage from "./pages/ErrorPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import CheckoutPage from "./pages/CheckoutPage";
import CheckoutRevendedorPage from "./pages/CheckoutRevendedorPage";
import CheckoutRenovacionPage from "./pages/CheckoutRenovacionPage";
import ProfilePage from "./pages/ProfilePage";
import Header from "./components/Header";
import { PromoHeader } from "./components/PromoHeader";
import ScrollToTop from "./components/ScrollToTop";
import Footer from "./components/Footer";
import PageLoading from "./components/PageLoading";
import { useState, useEffect } from "react";
import { LoadingProvider, useLoading } from "./contexts/LoadingContext";
import { AuthProvider } from "./contexts/AuthContext";
import AdminToolsPage from "./pages/AdminToolsPage/index";
import DonacionesPage from "./pages/DonacionesPage";
import DonationSuccessPage from "./pages/DonationSuccessPage";
import SponsorsPage from "./pages/SponsorsPage/index";

const TRANSITION_DURATION = 600;

const AppContent = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const { isLoading, setIsLoading } = useLoading();

  useEffect(() => {
    if (location.pathname === displayLocation.pathname) {
      return;
    }

    setIsLoading(true);

    const timeout = setTimeout(() => {
      setDisplayLocation(location);
      setIsLoading(false);
    }, TRANSITION_DURATION);

    return () => clearTimeout(timeout);
  }, [location, displayLocation, setIsLoading]);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-900">
      <ScrollToTop />
      {isLoading && <PageLoading />}
      <PromoHeader />
      <Header />
      <div className="flex-1 overflow-y-auto relative">
        <main>
          <Routes location={displayLocation} key={displayLocation.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout-renovacion" element={<CheckoutRenovacionPage />} />
          <Route path="/checkout-revendedor" element={<CheckoutRevendedorPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/planes" element={<PlanesPage isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />} />
          <Route path="/revendedores" element={<RevendedoresPage isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />} />
          <Route path="/servidores" element={<ServersPage isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />} />
          <Route path="/sobre-nosotros" element={<AboutPage isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/donaciones" element={<DonacionesPage isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />} />
          <Route path="/donaciones/success" element={<DonationSuccessPage />} />
          <Route path="/sponsors" element={<SponsorsPage isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />} />
          <Route path="/terminos" element={<TermsPage isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />} />
          <Route path="/privacidad" element={<PrivacyPage isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />} />
          <Route path="/155908348" element={<AdminToolsPage isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />} />
        </Routes>
        </main>
      </div>
      {!isLoading && !location.pathname.startsWith("/checkout") && location.pathname !== "/155908348" && location.pathname !== "/success" && location.pathname !== "/donaciones/success" && <Footer />}
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <LoadingProvider>
        <AppContent />
      </LoadingProvider>
    </AuthProvider>
  );
};

export default App;
