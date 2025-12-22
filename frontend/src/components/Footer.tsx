import { useState } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionTitle, CardTitle, BodyText, SmallText } from './Typography';

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

  const footerLinks = [
    {
      title: 'Funciones',
      links: [
        { label: 'Planes VPN', href: '/planes', external: false },
        { label: 'Comparar Planes', href: '/comparar-planes', external: false },
        { label: 'Servidores VPN', href: '/servidores', external: false },
      ],
    },
    {
      title: 'Plataformas',
      links: [
        { label: 'VPN para Android', href: 'https://play.google.com/store/apps/details?id=com.jjsecure.lite&hl=es_AR', external: true },
      ],
    },
    {
      title: 'Empresa',
      links: [
        { label: 'Sobre nosotros', href: '/sobre-nosotros', external: false },
        { label: 'Noticias', href: '/noticias', external: false },
        { label: 'Estado del Sistema', href: '/estado', external: false },
      ],
    },
    {
      title: 'Soporte',
      links: [
        { label: 'Centro de Ayuda', href: '/ayuda', external: false },
        { label: 'Chat en vivo', href: '/chat', external: false },
        { label: 'Revendedores', href: '/revendedores', external: false },
      ],
    },
  ];

  const socialLinks = [
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/jjsecure.vpn/',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4zm9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3" />
        </svg>
      ),
    },
    {
      name: 'Telegram',
      url: 'https://t.me/+rAuU1_uHGZthMWZh',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 5L2 12.5l7 1M21 5l-2.5 15L9 13.5M21 5L9 13.5m0 0V19l3.249-3.277" />
        </svg>
      ),
    },
    {
      name: 'WhatsApp',
      url: 'https://chat.whatsapp.com/LU16SUptp4xFQ4zTNta7Ja',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01m-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18l-3.12.82l.83-3.04l-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24c2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23m4.52-6.16c-.25-.12-1.47-.72-1.69-.81c-.23-.08-.39-.12-.56.12c-.17.25-.64.81-.78.97c-.14.17-.29.19-.54.06c-.25-.12-1.05-.39-1.99-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.14-.25-.02-.38.11-.51c.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31c-.22.25-.86.85-.86 2.07s.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74c.59.26 1.05.41 1.41.52c.59.19 1.13.16 1.56.1c.48-.07 1.47-.6 1.67-1.18c.21-.58.21-1.07.14-1.18s-.22-.16-.47-.28" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="relative w-full bg-white text-gray-900">
      {/* Gradiente de fondo (alineado con Profile) */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-purple-50/30 to-purple-200/50" />

      <div className="relative z-10">
        {/* FAQ Section */}
        {!hideFAQ && (
          <div className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-10 sm:mb-12"
              >
                <SectionTitle as="h2">Preguntas frecuentes</SectionTitle>
              </motion.div>

              <div className="space-y-3 sm:space-y-4">
                {faqItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="rounded-xl bg-white/95 backdrop-blur-sm border border-purple-100 shadow-sm overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFAQ(item.id)}
                      className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left hover:bg-purple-50/50 transition-colors"
                    >
                      <span className="font-medium text-purple-800 text-sm sm:text-base pr-4">{item.question}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-purple-500 flex-shrink-0 transition-transform duration-300 ${
                          expandedFAQ === item.id ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {expandedFAQ === item.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 sm:px-6 pb-5 pt-0">
                            <BodyText className="text-sm sm:text-base">{item.answer}</BodyText>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Links Section */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-12">
              {footerLinks.map((section) => (
                <div key={section.title}>
                  <CardTitle as="h3" className="text-base mb-4">
                    {section.title}
                  </CardTitle>
                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        {link.external ? (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-purple-700 text-sm transition-colors inline-flex items-center gap-1"
                          >
                            {link.label}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <Link
                            to={link.href}
                            className="text-gray-600 hover:text-purple-700 text-sm transition-colors"
                          >
                            {link.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-purple-100 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                {/* Copyright */}
                <SmallText as="p" className="text-sm text-gray-500">
                  © 2025 SecureShop. Todos los derechos reservados.
                </SmallText>

                {/* Legal Links */}
                <div className="flex items-center gap-6 text-sm">
                  <Link
                    to="/privacidad"
                    className="text-gray-600 hover:text-purple-700 transition-colors"
                  >
                    Política de Privacidad
                  </Link>
                  <Link
                    to="/terminos"
                    className="text-gray-600 hover:text-purple-700 transition-colors"
                  >
                    Términos y condiciones
                  </Link>
                </div>

                {/* Social Icons */}
                <div className="flex items-center gap-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm border border-purple-100 flex items-center justify-center text-gray-600 hover:text-purple-700 hover:border-purple-200 hover:bg-purple-50 transition-all"
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
      </div>
    </footer>
  );
}