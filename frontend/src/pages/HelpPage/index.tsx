import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ChevronDown, 
  ChevronRight,
  BookOpen,
  Download,
  CreditCard,
  HelpCircle,
  MessageCircle,
  Smartphone,
  Monitor,
  Settings,
  Shield,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface HelpCategory {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  orden: number;
  activo: boolean;
}

interface HelpArticle {
  id: string;
  categoria_id: string;
  titulo: string;
  slug: string;
  resumen: string | null;
  contenido_md: string;
  estado: 'borrador' | 'publicado' | 'archivado';
  visible_para: 'todos' | 'clientes' | 'admin';
  prioridad: number;
}

const categoryIcons: Record<string, typeof BookOpen> = {
  'instalacion': Download,
  'cuenta-compras': CreditCard,
  'problemas': Settings,
  'seguridad': Shield,
  'default': HelpCircle,
};

const platformGuides = [
  { 
    name: 'Android', 
    icon: Smartphone, 
    color: 'bg-green-100 text-green-600',
    description: 'Instalación en celulares y tablets'
  },
  { 
    name: 'Android TV', 
    icon: Monitor, 
    color: 'bg-purple-100 text-purple-600',
    description: 'Instalación en Smart TV y TV Box'
  },
];

// FAQs predefinidas (fallback si no hay en DB)
const defaultFAQs = [
  {
    categoria: 'Cuenta y Compras',
    preguntas: [
      {
        pregunta: '¿Cómo compro un plan VPN?',
        respuesta: 'Visita nuestra página de Planes, selecciona el plan que mejor se adapte a tus necesidades, elige la cantidad de días y dispositivos, y procede al pago con MercadoPago. Recibirás tus credenciales por email inmediatamente.'
      },
      {
        pregunta: '¿Qué métodos de pago aceptan?',
        respuesta: 'Aceptamos todos los métodos disponibles en MercadoPago: tarjetas de crédito/débito, transferencia bancaria, Rapipago, Pago Fácil, y más.'
      },
      {
        pregunta: '¿Cómo renuevo mi suscripción?',
        respuesta: 'Ve a la página de Planes, selecciona "Renovar cuenta existente", ingresa tu username y sigue los pasos. Tu tiempo se acumulará al existente.'
      },
      {
        pregunta: '¿Puedo usar el VPN en múltiples dispositivos?',
        respuesta: 'Sí, dependiendo del plan que elijas puedes conectar 1, 2 o más dispositivos simultáneamente. Puedes ver la cantidad en los detalles de cada plan.'
      },
    ]
  },
  {
    categoria: 'Instalación en Android',
    preguntas: [
      {
        pregunta: '¿Cómo instalo el VPN en mi celular Android?',
        respuesta: 'Descarga la aplicación JJSecure VPN desde Google Play Store o desde el enlace que te enviamos por email. Abre la app, ingresa tu usuario y contraseña, y conecta con un solo toque.'
      },
      {
        pregunta: '¿Cómo instalo el VPN en mi tablet?',
        respuesta: 'El proceso es el mismo que en celular: descarga JJSecure VPN desde Google Play, instálala, ingresa tus credenciales y listo.'
      },
      {
        pregunta: '¿Qué versión de Android necesito?',
        respuesta: 'JJSecure VPN funciona en Android 5.0 (Lollipop) o superior. La mayoría de los dispositivos de los últimos 8 años son compatibles.'
      },
    ]
  },
  {
    categoria: 'Instalación en TV',
    preguntas: [
      {
        pregunta: '¿Cómo instalo el VPN en mi Smart TV?',
        respuesta: 'Si tu TV tiene Android TV, puedes instalar JJSecure VPN desde Google Play Store directamente en la TV. Busca "JJSecure" e instálala.'
      },
      {
        pregunta: '¿Funciona en TV Box?',
        respuesta: 'Sí, JJSecure VPN funciona en cualquier TV Box con Android (Xiaomi Mi Box, Amazon Fire TV, etc). Descarga la app desde Play Store o instala el APK.'
      },
      {
        pregunta: '¿Cómo instalo en Fire TV Stick?',
        respuesta: 'En Fire TV Stick, ve a Configuración > Mi Fire TV > Opciones de desarrollador > Activar "Apps de orígenes desconocidos". Luego usa una app como Downloader para instalar nuestro APK.'
      },
    ]
  },
  {
    categoria: 'Problemas comunes',
    preguntas: [
      {
        pregunta: 'No puedo conectarme al VPN',
        respuesta: 'Verifica que tus credenciales sean correctas, que tu suscripción esté activa, y que tengas conexión a internet. Si el problema persiste, prueba cambiar de servidor o reinicia la aplicación.'
      },
      {
        pregunta: 'La conexión es lenta',
        respuesta: 'Prueba conectarte a un servidor diferente, preferiblemente el más cercano a tu ubicación. Si usas WiFi, verifica la señal. También puedes probar reiniciar tu router.'
      },
      {
        pregunta: 'Se desconecta frecuentemente',
        respuesta: 'Esto puede deberse a una conexión inestable. Activa la opción "Reconexión automática" en la app. Si persiste, contacta a soporte indicando qué servidor usas.'
      },
      {
        pregunta: '¿Cómo veo cuántos días me quedan?',
        respuesta: 'Ingresa a tu Perfil en nuestra web para ver el estado de tu cuenta, días restantes e historial de compras. También puedes ver el tiempo restante directamente en la app.'
      },
    ]
  },
];

export default function HelpPage() {
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQs, setExpandedFAQs] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: categoriesData } = await supabase
          .from('help_categories')
          .select('*')
          .eq('activo', true)
          .order('orden');

        const { data: articlesData } = await supabase
          .from('help_articles')
          .select('*')
          .eq('estado', 'publicado')
          .in('visible_para', ['todos', 'clientes'])
          .order('prioridad', { ascending: false });

        setCategories(categoriesData || []);
        setArticles(articlesData || []);
      } catch (error) {
        console.error('Error fetching help data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleFAQ = (id: string) => {
    setExpandedFAQs(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Filter FAQs by search
  const filteredFAQs = useMemo(() => {
    if (!searchQuery.trim()) return defaultFAQs;

    const query = searchQuery.toLowerCase();
    return defaultFAQs
      .map(cat => ({
        ...cat,
        preguntas: cat.preguntas.filter(
          p => p.pregunta.toLowerCase().includes(query) || 
               p.respuesta.toLowerCase().includes(query)
        )
      }))
      .filter(cat => cat.preguntas.length > 0);
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-80" />
            <h1 className="text-4xl font-bold mb-3">Centro de Ayuda</h1>
            <p className="text-purple-200 text-lg max-w-2xl mx-auto">
              Encuentra respuestas rápidas a tus preguntas o contacta con nuestro equipo de soporte
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-xl mx-auto mt-8"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar en preguntas frecuentes..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-gray-800 placeholder-gray-400 shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Quick Links - Platform Guides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-xl font-bold text-purple-800 mb-4">Guías de Instalación</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {platformGuides.map((platform) => {
              const Icon = platform.icon;
              return (
                <a
                  key={platform.name}
                  href="#"
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all group"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${platform.color} mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <p className="font-semibold text-gray-800">{platform.name}</p>
                  <p className="text-sm text-gray-500 mt-1">{platform.description}</p>
                </a>
              );
            })}
          </div>
        </motion.div>

        {/* Categories from DB (if any) */}
        {categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-xl font-bold text-purple-800 mb-4">Categorías</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categories.map((category) => {
                const Icon = categoryIcons[category.slug] || categoryIcons.default;
                const articleCount = articles.filter(a => a.categoria_id === category.id).length;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                    className={`bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all text-left ${
                      selectedCategory === category.id ? 'border-purple-400 ring-2 ring-purple-100' : 'border-gray-100 hover:border-purple-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-100">
                        <Icon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{category.nombre}</p>
                        <p className="text-sm text-gray-500">{articleCount} artículos</p>
                      </div>
                    </div>
                    {category.descripcion && (
                      <p className="text-sm text-gray-500 mt-3">{category.descripcion}</p>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Articles for selected category */}
        <AnimatePresence>
          {selectedCategory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-12"
            >
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {articles
                  .filter(a => a.categoria_id === selectedCategory)
                  .map((article) => (
                    <div
                      key={article.id}
                      className="p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">{article.titulo}</p>
                          {article.resumen && (
                            <p className="text-sm text-gray-500 mt-1">{article.resumen}</p>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAQs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-bold text-purple-800 mb-4">Preguntas Frecuentes</h2>
          
          {filteredFAQs.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
              <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No se encontraron resultados para "{searchQuery}"</p>
              <p className="text-sm text-gray-400 mt-1">Intenta con otros términos o contacta a soporte</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredFAQs.map((category, catIndex) => (
                <div key={catIndex} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b border-gray-100">
                    <h3 className="font-semibold text-purple-800">{category.categoria}</h3>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {category.preguntas.map((faq, faqIndex) => {
                      const id = `${catIndex}-${faqIndex}`;
                      const isExpanded = expandedFAQs.has(id);
                      
                      return (
                        <div key={id}>
                          <button
                            onClick={() => toggleFAQ(id)}
                            className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                          >
                            <p className="font-medium text-gray-800 pr-4">{faq.pregunta}</p>
                            <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <div className="px-4 pb-4 text-gray-600 text-sm leading-relaxed">
                                  {faq.respuesta}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Contact Support CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-8 text-center text-white"
        >
          <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h3 className="text-2xl font-bold mb-2">¿No encontraste lo que buscabas?</h3>
          <p className="text-purple-200 mb-6">Nuestro equipo de soporte está disponible para ayudarte</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/chat"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-purple-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Chat en vivo
            </a>
            <a
              href="/perfil?section=support"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-500/30 text-white rounded-xl font-semibold hover:bg-purple-500/40 transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              Crear ticket
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
