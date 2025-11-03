import { Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PlanesPage from "./pages/PlanesPage.tsx";
import RevendedoresPage from "./pages/RevendedoresPage.tsx";
import AboutPage from "./pages/AboutPage";
import SuccessPage from "./pages/SuccessPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import DownloadPage from "./pages/DownloadPage";
import CheckoutPage from "./pages/CheckoutPage";
import CheckoutRevendedorPage from "./pages/CheckoutRevendedorPage";
import Header from "./components/Header";
import MobilePageHeader from "./components/MobilePageHeader";
import ScrollToTop from "./components/ScrollToTop";
import { useState } from "react";

const App = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname: string): string => {
    switch (pathname) {
      case "/":
        return "JJSecure VPN";
      case "/planes":
        return "Planes VPN";
      case "/revendedores":
        return "Revendedores";
      case "/sobre-nosotros":
        return "Sobre Nosotros";
      case "/checkout":
        return "Compra VPN";
      case "/checkout-revendedor":
        return "Compra Revendedor";
      case "/success":
        return "¡Éxito!";
      case "/terminos":
        return "Términos";
      case "/privacidad":
        return "Privacidad";
      case "/descargar":
        return "Descargar";
      default:
        return "JJSecure VPN";
    }
  };

  const showMobileHeader = !["/checkout", "/checkout-revendedor", "/success"].includes(
    location.pathname
  );

  return (
    <div className="flex flex-col h-screen bg-neutral-900">
      <ScrollToTop />
      <Header />
      {showMobileHeader && (
        <div className="md:hidden sticky top-0 z-20">
          <MobilePageHeader
            title={getPageTitle(location.pathname)}
            onMenuClick={() => setIsMobileMenuOpen(true)}
          />
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        <main>
          <Routes>
          <Route path="/" element={<HomePage isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout-revendedor" element={<CheckoutRevendedorPage />} />
          <Route path="/planes" element={<PlanesPage isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />} />
          <Route path="/revendedores" element={<RevendedoresPage isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />} />
          <Route path="/sobre-nosotros" element={<AboutPage isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/terminos" element={<TermsPage isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />} />
          <Route path="/privacidad" element={<PrivacyPage isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />} />
          <Route path="/descargar" element={<DownloadPage isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />} />
        </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
