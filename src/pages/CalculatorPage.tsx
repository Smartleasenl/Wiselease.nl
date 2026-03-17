import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, MessageCircle, FileText, Phone } from 'lucide-react';

const DURATION_OPTIONS = [12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72];

const MAX_RESIDUAL_PERCENTAGES: Record<number, number> = {
  12: 0.60,
  18: 0.55,
  24: 0.50,
  30: 0.475,
  36: 0.45,
  42: 0.40,
  48: 0.35,
  54: 0.30,
  60: 0.25,
  66: 0.20,
  72: 0.15,
};

export function CalculatorPage() {
  const navigate = useNavigate();
  const [vehiclePrice, setVehiclePrice] = useState(30000);
  const [downPayment, setDownPayment] = useState(4500);
  const [duration, setDuration] = useState(72);
  const [residualValue, setResidualValue] = useState(4500);
  const [monthlyPayment, setMonthlyPayment] = useState(0);

  const maxResidualValue = vehiclePrice * (MAX_RESIDUAL_PERCENTAGES[duration] || 0.15);

  useEffect(() => {
    setDownPayment(Math.round(vehiclePrice * 0.15 / 100) * 100);
    setResidualValue(Math.round(vehiclePrice * 0.15 / 100) * 100);
  }, [vehiclePrice]);

  useEffect(() => {
    if (residualValue > maxResidualValue) {
      setResidualValue(Math.round(maxResidualValue / 100) * 100);
    }
  }, [duration, maxResidualValue]);

  useEffect(() => {
    const r = 8.99 / 100 / 12;
    const loan = vehiclePrice - downPayment;
    const n = duration;

    if (loan <= 0) {
      setMonthlyPayment(0);
      return;
    }

    if (r === 0) {
      setMonthlyPayment((loan - residualValue) / n);
      return;
    }

    const pmt = (loan * r * Math.pow(1 + r, n) - residualValue * r) / (Math.pow(1 + r, n) - 1);
    setMonthlyPayment(Math.max(0, pmt));
  }, [vehiclePrice, downPayment, duration, residualValue]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const downPaymentPercent = vehiclePrice > 0 ? Math.round((downPayment / vehiclePrice) * 100) : 0;
  const residualValuePercent = vehiclePrice > 0 ? ((residualValue / vehiclePrice) * 100).toFixed(1) : '0';
  const maxResidualPercent = ((MAX_RESIDUAL_PERCENTAGES[duration] || 0.15) * 100).toFixed(1);

  const calculatorState = {
    looptijd: duration,
    aanbetaling: downPayment,
    maandbedrag: Math.round(monthlyPayment),
    slottermijn: residualValue,
  };

  const handleWhatsApp = () => {
    const message = `Hallo, ik wil graag een financial lease aanvragen.\n\nAankoopprijs: ${formatPrice(vehiclePrice)}\nAanbetaling: ${formatPrice(downPayment)} (${downPaymentPercent}%)\nLooptijd: ${duration} maanden\nSlottermijn: ${formatPrice(residualValue)}\nBerekend maandbedrag: ${formatPrice(Math.round(monthlyPayment))}`;
    window.open(`https://wa.me/31858008777?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleOfferte = () => {
    navigate('/offerte', { state: { calculator: calculatorState } });
  };

  const handleBelMij = () => {
    navigate('/bel-mij', { state: { calculator: calculatorState } });
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10 md:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-2 bg-smartlease-yellow/10 text-smartlease-yellow px-4 py-2 rounded-full mb-4">
            <Calculator className="h-5 w-5" />
            <span className="font-semibold text-sm">Financial Lease Calculator</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Bereken je maandtermijn
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Pas de waardes aan en bereken direct wat je maandelijks betaalt voor je financial lease.
          </p>
        </div>

        {/* Calculator card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="space-y-7">
            {/* Aankoopprijs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">Aankoopprijs</label>
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-semibold text-gray-500">€</span>
                  <input
                    type="number"
                    value={vehiclePrice}
                    onChange={(e) => {
                      const val = Math.min(Math.max(0, Number(e.target.value)), 250000);
                      setVehiclePrice(val);
                    }}
                    className="w-28 px-2 py-1.5 text-sm font-semibold border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-smartlease-yellow focus:border-smartlease-yellow"
                  />
                </div>
              </div>
              <input
                type="range"
                min="5000"
                max="250000"
                step="500"
                value={vehiclePrice}
                onChange={(e) => setVehiclePrice(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-smartlease-yellow"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>€ 5.000</span>
                <span>€ 250.000</span>
              </div>
            </div>

            {/* Aanbetaling */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">Aanbetaling</label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">€</span>
                  <input
                    type="number"
                    value={Math.round(downPayment)}
                    onChange={(e) => {
                      const val = Math.min(Math.max(0, Number(e.target.value)), vehiclePrice * 0.5);
                      setDownPayment(val);
                    }}
                    className="w-24 px-2 py-1.5 text-sm font-semibold border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-smartlease-yellow focus:border-smartlease-yellow"
                  />
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {downPaymentPercent}%
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max={vehiclePrice * 0.5}
                step="100"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-smartlease-yellow"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>€ 0</span>
                <span>Max: {formatPrice(vehiclePrice * 0.5)}</span>
              </div>
            </div>

            {/* Looptijd */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Looptijd
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {DURATION_OPTIONS.map((months) => (
                  <button
                    key={months}
                    onClick={() => setDuration(months)}
                    className={`py-2.5 px-3 text-sm font-semibold rounded-lg transition-all ${
                      duration === months
                        ? 'bg-smartlease-yellow text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {months} mnd
                  </button>
                ))}
              </div>
            </div>

            {/* Slottermijn */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">Slottermijn (restwaarde)</label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">€</span>
                  <input
                    type="number"
                    value={Math.round(residualValue)}
                    onChange={(e) => {
                      const value = Math.min(Math.max(0, Number(e.target.value)), maxResidualValue);
                      setResidualValue(value);
                    }}
                    className="w-24 px-2 py-1.5 text-sm font-semibold border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-smartlease-yellow focus:border-smartlease-yellow"
                  />
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {residualValuePercent}%
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max={maxResidualValue}
                step="100"
                value={residualValue}
                onChange={(e) => setResidualValue(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-smartlease-yellow"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>€ 0</span>
                <span>Max: {formatPrice(maxResidualValue)} ({maxResidualPercent}%)</span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Result */}
            <div className="bg-gradient-to-br from-smartlease-yellow to-yellow-600 text-white rounded-xl p-6 md:p-8">
              <div className="text-center mb-6">
                <p className="text-sm text-white/80 mb-1">Je maandtermijn</p>
                <p className="text-5xl md:text-6xl font-bold">
                  € {Math.round(monthlyPayment)}
                </p>
                <p className="text-sm text-white/60 mt-1">per maand</p>
              </div>

              <div className="bg-white/10 rounded-lg p-3 text-center text-sm">
                <p className="text-white/70 text-xs mb-0.5">Financieringsbedrag</p>
                <p className="font-bold">{formatPrice(vehiclePrice - downPayment)}</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={handleWhatsApp}
                className="w-full bg-[#25D366] hover:bg-[#20c05c] text-white py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 transition shadow-lg shadow-green-500/20"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Direct aanvragen via WhatsApp</span>
              </button>
              <button
                onClick={handleOfferte}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-500 hover:from-yellow-600 hover:to-yellow-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 transition shadow-lg shadow-yellow-500/20"
              >
                <FileText className="h-5 w-5" />
                <span>Gratis offerte aanvragen</span>
              </button>
              <button
                onClick={handleBelMij}
                className="w-full bg-white hover:bg-gray-50 text-smartlease-blue border-2 border-smartlease-blue py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 transition"
              >
                <Phone className="h-5 w-5" />
                <span>Bel mij terug</span>
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center">
              Indicatieve berekening. Exacte voorwaarden op aanvraag.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}