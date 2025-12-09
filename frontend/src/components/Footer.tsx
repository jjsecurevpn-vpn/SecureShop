import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { protonStyles, protonHover } from '../styles/colors';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    id: 1,
    question: '¿Cómo funciona SecureShop VPN?',
    answer: 'SecureShop VPN proporciona conexión segura encriptada a través de servidores distribuidos globalmente, protegiendo tu privacidad y datos en cualquier red.',
  },
  {
    id: 2,
    question: '¿Cómo se instala SecureShop VPN?',
    answer: 'Puedes instalar SecureShop VPN descargando la aplicación desde nuestra plataforma. Sigue el asistente de instalación y conecta con un click.',
  },
  {
    id: 3,
    question: '¿Puedo ver Netflix, Hulu o Disney+ con SecureShop VPN?',
    answer: 'Sí, SecureShop VPN te permite acceder a estos servicios desde cualquier ubicación con servidores optimizados.',
  },
  {
    id: 4,
    question: '¿Es SecureShop VPN gratuito?',
    answer: 'Ofrecemos planes gratuitos limitados y planes premium con acceso ilimitado a todos nuestros servidores y funciones.',
  },
  {
    id: 5,
    question: '¿Qué tan segura es SecureShop VPN?',
    answer: 'Utilizamos encriptación de grado militar (AES-256), protocolos modernos y una política de no registro para garantizar máxima seguridad.',
  },
];

export default function Footer() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const location = useLocation();

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const hideFAQ = ['/sponsors', '/terminos', '/privacidad'].includes(location.pathname);

  return (
    <footer className="relative w-full bg-white text-neutral-900">
      {/* Gradiente de fondo */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-purple-50 to-purple-100" />

      <div className="relative z-10">
        {/* FAQ Section - Full Width */}
        {!hideFAQ && (
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-12 lg:py-16 xl:py-20">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 sm:mb-12 lg:mb-16 xl:mb-20" style={protonStyles.textPrimary}>
              Preguntas frecuentes
            </h2>

            <div className="space-y-4 sm:space-y-6 lg:space-y-8 xl:space-y-10">
              {faqItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/70 rounded-lg sm:rounded-xl lg:rounded-2xl border border-purple-200/40 overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-purple-300/60"
                >
                  <button
                    onClick={() => toggleFAQ(item.id)}
                    className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 flex items-center justify-between hover:bg-purple-50/60 transition-colors duration-200"
                  >
                    <h3 className="text-left font-semibold text-xs sm:text-sm lg:text-base leading-relaxed" style={protonStyles.textPrimary}>
                      {item.question}
                    </h3>
                    <ChevronDown
                      className={`text-purple-600 flex-shrink-0 ml-4 transition-transform duration-300 w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7`}
                      style={{
                        transform: expandedFAQ === item.id ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    />
                  </button>

                  {expandedFAQ === item.id && (
                    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 bg-purple-50/50 border-t border-purple-200/40">
                      <p className="leading-relaxed text-xs sm:text-sm lg:text-base" style={protonStyles.textSecondary}>
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        )}

        {/* Divider */}
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="max-w-7xl mx-auto border-t border-purple-300/30" />
        </div>

        {/* Links Section - Full Width with proper scaling */}
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-12 lg:py-16 xl:py-20">
          <div className="w-full">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 xl:gap-12 mb-8 sm:mb-12 lg:mb-16 justify-items-center">
              {/* Funciones */}
              <div>
                <h3 className="font-bold text-xs sm:text-sm lg:text-base mb-4 sm:mb-6 lg:mb-8" style={protonStyles.textPrimary}>
                  Funciones
                </h3>
                <ul className="space-y-2 sm:space-y-3 lg:space-y-4">
                  {['VPN gratis', 'Servidores VPN'].map((item) => (
                    <li key={item}>
                      <button 
                        className="transition-colors duration-200 text-center text-xs sm:text-sm lg:text-base hover:underline"
                        style={protonStyles.textPrimary}
                        onMouseEnter={protonHover.linkEnter}
                        onMouseLeave={protonHover.linkLeave}
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Plataformas */}
              <div>
                <h3 className="font-bold text-xs sm:text-sm lg:text-base mb-4 sm:mb-6 lg:mb-8" style={protonStyles.textPrimary}>
                  Plataformas
                </h3>
                <ul className="space-y-2 sm:space-y-3 lg:space-y-4">
                  <li>
                    <a
                      href="https://play.google.com/store/apps/details?id=com.jjsecure.lite&hl=es_AR"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors duration-200 text-center text-xs sm:text-sm lg:text-base hover:underline"
                      style={protonStyles.textPrimary}
                      onMouseEnter={protonHover.linkEnter}
                      onMouseLeave={protonHover.linkLeave}
                    >
                      VPN para Android
                    </a>
                  </li>
                </ul>
              </div>

              {/* Empresa */}
              <div>
                <h3 className="font-bold text-xs sm:text-sm lg:text-base mb-4 sm:mb-6 lg:mb-8" style={protonStyles.textPrimary}>
                  Empresa
                </h3>
                <ul className="space-y-2 sm:space-y-3 lg:space-y-4">
                  <li>
                    <button 
                      className="transition-colors duration-200 text-center text-xs sm:text-sm lg:text-base hover:underline"
                      style={protonStyles.textPrimary}
                      onMouseEnter={protonHover.linkEnter}
                      onMouseLeave={protonHover.linkLeave}
                    >
                      Sobre nosotros
                    </button>
                  </li>
                </ul>
              </div>

              {/* Contacto e información */}
              <div>
                <h3 className="font-bold text-xs sm:text-sm lg:text-base mb-4 sm:mb-6 lg:mb-8" style={protonStyles.textPrimary}>
                  Contacto
                </h3>
                <ul className="space-y-2 sm:space-y-3 lg:space-y-4">
                  {['Ayuda y soporte', 'Socios y afiliados'].map((item) => (
                    <li key={item}>
                      <button 
                        className="transition-colors duration-200 text-center text-xs sm:text-sm lg:text-base hover:underline"
                        style={protonStyles.textPrimary}
                        onMouseEnter={protonHover.linkEnter}
                        onMouseLeave={protonHover.linkLeave}
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer Bottom - Divider */}
            <div className="border-t border-purple-300/30 my-6 sm:my-8 lg:my-10 xl:my-12" />

            {/* Footer Info and Social */}
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6 sm:gap-8 lg:gap-10 xl:gap-12">
              {/* Copyright */}
              <div className="text-xs sm:text-sm lg:text-base" style={protonStyles.textSecondary}>
                <p>© 2025 SecureShop. Todos los derechos reservados.</p>
              </div>

              {/* Links */}
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8 text-xs sm:text-sm lg:text-base">
                <Link 
                  to="/privacidad"
                  reloadDocument
                  className="transition-colors duration-200 hover:underline"
                  style={protonStyles.textPrimary}
                  onMouseEnter={protonHover.linkEnter}
                  onMouseLeave={protonHover.linkLeave}
                >
                  Política de Privacidad
                </Link>
                <Link 
                  to="/terminos"
                  reloadDocument
                  className="transition-colors duration-200 hover:underline"
                  style={protonStyles.textPrimary}
                  onMouseEnter={protonHover.linkEnter}
                  onMouseLeave={protonHover.linkLeave}
                >
                  Términos y condiciones
                </Link>
              </div>

              {/* Social Icons */}
              <div className="flex gap-3 sm:gap-4 lg:gap-5 xl:gap-6">
                {[
                  {
                    name: 'instagram',
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4zm9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3" />
                      </svg>
                    ),
                    url: 'https://www.instagram.com/jjsecure.vpn/',
                  },
                  {
                    name: 'telegram',
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7" viewBox="0 0 24 24">
                        <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 5L2 12.5l7 1M21 5l-2.5 15L9 13.5M21 5L9 13.5m0 0V19l3.249-3.277" />
                      </svg>
                    ),
                    url: 'https://t.me/+rAuU1_uHGZthMWZh',
                  },
                  {
                    name: 'whatsapp',
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01m-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18l-3.12.82l.83-3.04l-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24c2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23m4.52-6.16c-.25-.12-1.47-.72-1.69-.81c-.23-.08-.39-.12-.56.12c-.17.25-.64.81-.78.97c-.14.17-.29.19-.54.06c-.25-.12-1.05-.39-1.99-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.14-.25-.02-.38.11-.51c.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31c-.22.25-.86.85-.86 2.07s.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74c.59.26 1.05.41 1.41.52c.59.19 1.13.16 1.56.1c.48-.07 1.47-.6 1.67-1.18c.21-.58.21-1.07.14-1.18s-.22-.16-.47-.28" />
                      </svg>
                    ),
                    url: 'https://chat.whatsapp.com/LU16SUptp4xFQ4zTNta7Ja',
                  },
                ].map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 rounded-full bg-purple-200/50 hover:bg-purple-300/70 transition-all duration-200 flex items-center justify-center font-bold hover:shadow-lg hover:scale-110"
                    style={protonStyles.textPrimary}
                    title={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}