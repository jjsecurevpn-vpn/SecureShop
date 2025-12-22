import { Search, Filter } from 'lucide-react';
import type { NoticiaCategoria } from '../../../types';

interface NoticiasFiltersProps {
  categorias: NoticiaCategoria[];
  selectedCategoria: string;
  onCategoriaChange: (categoria: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export default function NoticiasFilters({
  categorias,
  selectedCategoria,
  onCategoriaChange,
  searchTerm,
  onSearchChange,
}: NoticiasFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-neutral-900/50 rounded-lg border border-neutral-800">
      {/* Search */}
      <div className="flex-1 relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
        <input
          type="text"
          placeholder="Buscar noticias..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-neutral-700 rounded-lg bg-neutral-800 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Categoria Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-neutral-400" />
        <select
          value={selectedCategoria}
          onChange={(e) => onCategoriaChange(e.target.value)}
          className="px-4 py-2 border border-neutral-700 rounded-lg bg-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
