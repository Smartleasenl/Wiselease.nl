import { Construction } from 'lucide-react';

export function PaginasPage() {
  return <PlaceholderContent title="Pagina's" desc="Pagina beheer wordt binnenkort toegevoegd." />;
}

export function StatistiekenPage() {
  return <PlaceholderContent title="Statistieken" desc="Statistieken en analytics worden binnenkort toegevoegd." />;
}

function PlaceholderContent({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="text-center py-20">
      <Construction className="h-12 w-12 text-gray-300 mx-auto mb-4" />
      <h1 className="text-xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-500">{desc}</p>
    </div>
  );
}
