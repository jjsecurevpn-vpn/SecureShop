import { useState, useEffect } from 'react';
import { Plus, Eye, EyeOff, Clock } from 'lucide-react';
import type { Noticia, NoticiaCategoria, CrearNoticia } from '../../../types';
import NoticiasFormModal from './NoticiasFormModal';
import NoticiasList from './NoticiasList';
import NoticiasFilters from './NoticiasFilters';

interface NoticiasManagementProps {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

type TabType = 'publicas' | 'borradores' | 'archivadas';

export default function NoticiasManagement({
  onSuccess,
  onError,
}: NoticiasManagementProps) {
  // Estado principal
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [categorias, setCategorias] = useState<NoticiaCategoria[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado de filtros
  const [activeTab, setActiveTab] = useState<TabType>('publicas');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Estado del modal
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingNoticia, setEditingNoticia] = useState<Noticia | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Cargar categorías
  useEffect(() => {
    cargarCategorias();
    cargarNoticias();
  }, []);

  // Recargar noticias cuando cambia el filtro
  useEffect(() => {
    cargarNoticias();
  }, [activeTab, selectedCategoria]);

  const cargarCategorias = async () => {
    try {
      const response = await fetch('/api/noticias/categorias/todas');
      const result = await response.json();
      if (result.success) {
        setCategorias(result.data || []);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
      onError?.('Error cargando categorías');
    }
  };

  const cargarNoticias = async () => {
    try {
      setLoading(true);
      let estado = 'publicada';
      if (activeTab === 'borradores') estado = 'borrador';
      if (activeTab === 'archivadas') estado = 'archivada';

      let url = `/api/noticias/admin?estado=${estado}`;
      if (selectedCategoria) url += `&categoria=${selectedCategoria}`;

      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        setNoticias(result.data || []);
      }
    } catch (error) {
      console.error('Error cargando noticias:', error);
      onError?.('Error cargando noticias');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFormModal = (noticia?: Noticia) => {
    setEditingNoticia(noticia || null);
    setShowFormModal(true);
  };

  const handleCloseFormModal = () => {
    setShowFormModal(false);
    setEditingNoticia(null);
  };

  const handleSaveNoticia = async (data: CrearNoticia) => {
    try {
      setFormLoading(true);
      const method = editingNoticia ? 'PUT' : 'POST';
      const url = editingNoticia
        ? `/api/noticias/admin/${editingNoticia.id}`
        : '/api/noticias/admin';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.success) {
        onSuccess?.(result.mensaje || 'Noticia guardada exitosamente');
        handleCloseFormModal();
        cargarNoticias();
      } else {
        onError?.(result.error || 'Error guardando noticia');
      }
    } catch (error) {
      console.error('Error guardando noticia:', error);
      onError?.('Error guardando noticia');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteNoticia = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta noticia?')) return;

    try {
      const response = await fetch(`/api/noticias/admin/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        onSuccess?.('Noticia eliminada exitosamente');
        cargarNoticias();
      } else {
        onError?.(result.error || 'Error eliminando noticia');
      }
    } catch (error) {
      console.error('Error eliminando noticia:', error);
      onError?.('Error eliminando noticia');
    }
  };

  const handleChangeEstado = async (id: string, nuevoEstado: string) => {
    try {
      const response = await fetch(`/api/noticias/admin/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      const result = await response.json();
      if (result.success) {
        onSuccess?.(result.mensaje || 'Estado actualizado');
        cargarNoticias();
      } else {
        onError?.(result.error || 'Error actualizando estado');
      }
    } catch (error) {
      console.error('Error actualizando estado:', error);
      onError?.('Error actualizando estado');
    }
  };

  const noticiasFiltradas = noticias.filter((noticia) => {
    if (searchTerm && !noticia.titulo.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Gestión de Noticias
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Crea, edita y administra todas las noticias y avisos
          </p>
        </div>
        <button
          onClick={() => handleOpenFormModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          Nueva Noticia
        </button>
      </div>

      {/* Filtros */}
      <NoticiasFilters
        categorias={categorias}
        selectedCategoria={selectedCategoria}
        onCategoriaChange={setSelectedCategoria}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Tabs */}
      <div className="flex gap-4 border-b border-neutral-700">
        <button
          onClick={() => setActiveTab('publicas')}
          className={`px-4 py-2 border-b-2 font-medium transition ${
            activeTab === 'publicas'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Eye className="w-4 h-4 inline mr-2" />
          Publicadas ({noticias.filter(n => n.estado === 'publicada').length})
        </button>
        <button
          onClick={() => setActiveTab('borradores')}
          className={`px-4 py-2 border-b-2 font-medium transition ${
            activeTab === 'borradores'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Clock className="w-4 h-4 inline mr-2" />
          Borradores ({noticias.filter(n => n.estado === 'borrador').length})
        </button>
        <button
          onClick={() => setActiveTab('archivadas')}
          className={`px-4 py-2 border-b-2 font-medium transition ${
            activeTab === 'archivadas'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <EyeOff className="w-4 h-4 inline mr-2" />
          Archivadas ({noticias.filter(n => n.estado === 'archivada').length})
        </button>
      </div>

      {/* Lista de Noticias */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-neutral-700 border-t-blue-500" />
          <p className="text-neutral-400 mt-3">Cargando noticias...</p>
        </div>
      ) : noticiasFiltradas.length === 0 ? (
        <div className="text-center py-12 bg-neutral-900/50 border border-neutral-800 rounded-lg">
          <p className="text-neutral-400">
            {searchTerm || selectedCategoria
              ? 'No se encontraron noticias con los filtros aplicados'
              : `No hay noticias ${activeTab === 'publicas' ? 'publicadas' : activeTab === 'borradores' ? 'en borrador' : 'archivadas'}`}
          </p>
        </div>
      ) : (
        <NoticiasList
          noticias={noticiasFiltradas}
          onEdit={handleOpenFormModal}
          onDelete={handleDeleteNoticia}
          onChangeEstado={handleChangeEstado}
        />
      )}

      {/* Modal de Formulario */}
      {showFormModal && (
        <NoticiasFormModal
          noticia={editingNoticia}
          categorias={categorias}
          onClose={handleCloseFormModal}
          onSave={handleSaveNoticia}
          loading={formLoading}
        />
      )}
    </div>
  );
}
