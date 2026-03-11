import { useNavigate } from 'react-router-dom';

const brands = [
  { name: 'BMW', logo: 'https://www.carlogos.org/car-logos/bmw-logo.png' },
  { name: 'Mercedes-Benz', logo: 'https://www.carlogos.org/car-logos/mercedes-benz-logo.png' },
  { name: 'Audi', logo: 'https://www.carlogos.org/car-logos/audi-logo.png' },
  { name: 'Volkswagen', logo: 'https://www.carlogos.org/car-logos/volkswagen-logo.png' },
  { name: 'Toyota', logo: 'https://www.carlogos.org/car-logos/toyota-logo.png' },
  { name: 'Volvo', logo: 'https://www.carlogos.org/car-logos/volvo-logo.png' },
  { name: 'Ford', logo: 'https://www.carlogos.org/car-logos/ford-logo.png' },
  { name: 'Renault', logo: 'https://www.carlogos.org/car-logos/renault-logo.png' },
  { name: 'Peugeot', logo: 'https://www.carlogos.org/car-logos/peugeot-logo.png' },
  { name: 'Opel', logo: 'https://www.carlogos.org/car-logos/opel-logo.png' },
  { name: 'Skoda', logo: 'https://www.carlogos.org/car-logos/skoda-logo.png' },
  { name: 'KIA', logo: 'https://www.carlogos.org/car-logos/kia-logo.png' },
];

const leaseTypes = [
  {
    title: 'Financial Lease',
    description: 'Direct eigenaar, maximaal fiscaal voordeel',
    // Zakelijke man stapt in moderne auto, typisch Nederlands kantoorpand op achtergrond
    image: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=800&q=80',
    link: '/financial-lease/wat-is-financial-lease',
    btnLabel: 'Meer informatie →',
    gradient: 'from-gray-900/70 via-gray-900/40 to-transparent',
  },
  {
    title: 'Operational Lease',
    description: 'All-in maandprijs, volledig ontzorgd',
    // Moderne snelweg Nederland, zakelijk rijden
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
    link: '/financial-lease/operational-lease',
    btnLabel: 'Meer informatie →',
    gradient: 'from-gray-900/70 via-gray-900/40 to-transparent',
  },
  {
    title: 'Equipment Lease',
    description: 'Machines & bedrijfsmiddelen financieren',
    // Modern magazijn / bedrijfshal, zakelijk Nederland
    image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80',
    link: '/financial-lease/equipment-lease',
    btnLabel: 'Meer informatie →',
    gradient: 'from-gray-900/70 via-gray-900/40 to-transparent',
  },
];

export function PopularBrands() {
  const navigate = useNavigate();

  const handleBrandClick = (brand: string) => {
    navigate(`/aanbod?merk=${encodeURIComponent(brand)}`);
  };

  return (
    <>
      {/* Lease types */}
      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 reveal">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Op zoek naar lease?
            </h2>
            <p className="text-lg text-gray-600">
              Kies de leasevorm die bij jou past
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {leaseTypes.map((lease, index) => (
              <button
                key={lease.title}
                onClick={() => navigate(lease.link)}
                className="reveal relative rounded-2xl overflow-hidden group h-56 md:h-64 text-left"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <img
                  src={lease.image}
                  alt={lease.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                <div className={`absolute inset-0 bg-gradient-to-r ${lease.gradient}`} />
                <div className="relative h-full flex flex-col justify-end p-6 md:p-7">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-1.5">
                    {lease.title}
                  </h3>
                  <p className="text-white/80 text-sm mb-4">
                    {lease.description}
                  </p>
                  <span className="inline-flex items-center bg-smartlease-teal hover:bg-teal-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition w-fit shadow-lg group-hover:shadow-xl">
                    {lease.btnLabel}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Populaire merken */}
      <section className="py-14 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 reveal">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Populaire merken
            </h2>
            <p className="text-lg text-gray-600">
              Kies uit de meest gezochte automerken
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
            {brands.map((brand, index) => (
              <button
                key={brand.name}
                onClick={() => handleBrandClick(brand.name)}
                className="reveal bg-white border border-gray-200 rounded-xl p-4 md:p-5 hover:border-smartlease-teal hover:shadow-lg transition-all duration-300 group flex flex-col items-center gap-2.5"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="h-8 md:h-10 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                  loading="lazy"
                />
                <span className="font-semibold text-xs md:text-sm text-gray-700 group-hover:text-smartlease-teal transition-colors">
                  {brand.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}