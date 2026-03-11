import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Vehicle, SearchResponse } from '../types/vehicle';
import { VehicleCard } from './VehicleCard';

interface VehicleGridProps {
  data: SearchResponse | null;
  loading: boolean;
  onPageChange: (page: number) => void;
  onVehicleClick: (vehicle: Vehicle) => void;
  currentSort: string;
  onSortChange: (sort: string) => void;
}

export function VehicleGrid({
  data,
  loading,
  onPageChange,
  onVehicleClick,
  currentSort,
  onSortChange,
}: VehicleGridProps) {
  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-10 w-10 text-smartlease-teal animate-spin" />
      </div>
    );
  }

  if (!data || data.vehicles.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-gray-700">Geen voertuigen gevonden</p>
        <p className="text-gray-400 mt-1 text-sm">Probeer je filters aan te passen</p>
      </div>
    );
  }

  return (
    <div>
      {/* Top bar: count + sort */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <p className="text-gray-500 text-sm">
          <span className="font-bold text-gray-900 text-base">{data.total.toLocaleString('nl-NL')}</span>{' '}
          voertuigen gevonden
        </p>

        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Sorteren</label>
          <div className="relative">
            <select
              value={currentSort}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all cursor-pointer hover:border-gray-300"
            >
              <option value="">Standaard</option>
              <option value="maandprijs_laag">Maandprijs: laag - hoog</option>
              <option value="maandprijs_hoog">Maandprijs: hoog - laag</option>
              <option value="prijs_laag">Prijs: laag - hoog</option>
              <option value="prijs_hoog">Prijs: hoog - laag</option>
              <option value="jaar_nieuw">Bouwjaar: nieuw - oud</option>
              <option value="jaar_oud">Bouwjaar: oud - nieuw</option>
              <option value="km_laag">Kilometerstand: laag - hoog</option>
              <option value="km_hoog">Kilometerstand: hoog - laag</option>
              <option value="nieuwste">Nieuwste eerst</option>
            </select>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 rotate-90 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Vehicle grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {data.vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            onClick={() => onVehicleClick(vehicle)}
          />
        ))}
      </div>

      {/* Pagination */}
      {data.total_pages > 1 && (
        <div className="flex justify-center items-center mt-10">
          <div className="flex items-center gap-1.5 bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5">
            {/* Previous */}
            <button
              onClick={() => onPageChange(data.page - 1)}
              disabled={data.page === 1}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Vorige</span>
            </button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, data.total_pages) }, (_, i) => {
              let pageNum;
              if (data.total_pages <= 5) {
                pageNum = i + 1;
              } else if (data.page <= 3) {
                pageNum = i + 1;
              } else if (data.page >= data.total_pages - 2) {
                pageNum = data.total_pages - 4 + i;
              } else {
                pageNum = data.page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    data.page === pageNum
                      ? 'bg-gradient-to-br from-smartlease-blue to-blue-700 text-white shadow-md shadow-blue-500/25 scale-105'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Next */}
            <button
              onClick={() => onPageChange(data.page + 1)}
              disabled={data.page === data.total_pages}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <span className="hidden sm:inline">Volgende</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}