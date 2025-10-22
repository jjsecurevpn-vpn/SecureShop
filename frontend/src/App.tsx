import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PlanesPage from './pages/PlanesPage.tsx';
import RevendedoresPage from './pages/RevendedoresPage.tsx';
import SuccessPage from './pages/SuccessPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import Header from './components/Header';
import Footer from './components/Footer';

const App = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/planes" element={<PlanesPage />} />
          <Route path="/revendedores" element={<RevendedoresPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/terminos" element={<TermsPage />} />
          <Route path="/privacidad" element={<PrivacyPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
