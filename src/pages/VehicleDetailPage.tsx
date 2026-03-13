t-gray-900">{vehicle.brandstof}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 px-3.5 py-3 bg-gray-50 rounded-xl border border-gray-100">
                  <Zap className="h-[18px] w-[18px] text-smartlease-yellow flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Vermogen</p>
                    <p className="text-sm font-semibold text-gray-900">{vehicle.vermogen} PK</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Mobile Calculator ── */}
            {vehicle.verkoopprijs > 0 && (
              <div className="lg:hidden animate-fade-up opacity-0 delay-2 bg-white rounded-2xl shadow-sm p-5 mb-5">
                <LeaseCalculator vehiclePrice={vehicle.verkoopprijs} onChange={setCalculatorState} />
              </div>
            )}

            {/* ── Mobile CTA Buttons ── */}
            <div className="lg:hidden animate-fade-up opacity-0 delay-3 space-y-2.5 mb-5">
              <button onClick={handleWhatsApp} className="w-full bg-[#25D366] hover:bg-[#20c05c] text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-green-500/20 text-sm">
                <MessageCircle className="h-5 w-5" /><span>WhatsApp over deze auto</span>
              </button>
              <button onClick={handleOfferteNavigate} className="w-full bg-gradient-to-r from-yellow-500 to-yellow-500 hover:from-yellow-600 hover:to-yellow-600 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-yellow-500/20 text-sm">
                <FileText className="h-5 w-5" /><span>Gratis offerte aanvragen</span>
              </button>
              <button onClick={handleBelMijNavigate} className="w-full bg-white hover:bg-gray-50 text-smartlease-blue border-2 border-smartlease-blue py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2.5 transition-all text-sm">
                <Phone className="h-5 w-5" /><span>Bel mij over deze auto</span>
              </button>
            </div>

            {/* ── Accordion Details ── */}
            <div className="animate-fade-up opacity-0 delay-4 bg-white rounded-2xl shadow-sm px-5 md:px-7">
              <AccordionSection title="Informatie" defaultOpen={true}>
                <div className="grid grid-cols-2 gap-3">
                  <SpecItem icon={<Calendar className="h-[18px] w-[18px]" />} label="Bouwjaar" value={vehicle.bouwjaar_year} />
                  <SpecItem icon={<Gauge className="h-[18px] w-[18px]" />} label="Kilometerstand" value={formatKm(vehicle.kmstand)} />
                  <SpecItem icon={<Fuel className="h-[18px] w-[18px]" />} label="Brandstof" value={vehicle.brandstof} />
                  <SpecItem icon={<Settings className="h-[18px] w-[18px]" />} label="Transmissie" value={vehicle.transmissie} />
                  <SpecItem icon={<Zap className="h-[18px] w-[18px]" />} label="Vermogen" value={`${vehicle.vermogen} PK`} />
                  {vehicle.motorinhoud && (
                    <SpecItem icon={<Settings className="h-[18px] w-[18px]" />} label="Motorinhoud" value={vehicle.motorinhoud} />
                  )}
                  <SpecItem icon={<Palette className="h-[18px] w-[18px]" />} label="Kleur" value={vehicle.kleur} />
                  <SpecItem icon={<DoorClosed className="h-[18px] w-[18px]" />} label="Deuren" value={vehicle.deuren} />
                  {vehicle.kenteken && (
                    <SpecItem icon={<FileText className="h-[18px] w-[18px]" />} label="Kenteken" value={vehicle.kenteken} />
                  )}
                  {vehicle.nap && (
                    <SpecItem icon={<Check className="h-[18px] w-[18px]" />} label="NAP" value={vehicle.nap} />
                  )}
                </div>
              </AccordionSection>

              <AccordionSection title="Opties">
                {vehicle.opties && vehicle.opties.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {vehicle.opties.map((optie, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 py-1.5">
                        <div className="w-5 h-5 rounded-full bg-yellow-50 flex items-center justify-center text-smartlease-yellow flex-shrink-0">
                          <Check className="h-3 w-3" />
                        </div>
                        <span className="text-sm text-gray-700">{optie}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Geen opties beschikbaar</p>
                )}
              </AccordionSection>

              <AccordionSection title="Omschrijving">
                {vehicle.omschrijving ? (
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{vehicle.omschrijving}</p>
                ) : (
                  <p className="text-gray-500 text-sm">Geen omschrijving beschikbaar</p>
                )}
              </AccordionSection>

              {isAdmin && (
                <AccordionSection title="Verkoper (admin)">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {vehicle.aanbieder_naam && (
                      <SpecItem icon={<Building2 className="h-[18px] w-[18px]" />} label="Bedrijfsnaam" value={vehicle.aanbieder_naam} />
                    )}
                    {vehicle.aanbieder_plaats && (
                      <SpecItem icon={<MapPin className="h-[18px] w-[18px]" />} label="Plaats" value={vehicle.aanbieder_plaats} />
                    )}
                    {vehicle.aanbieder_postcode && (
                      <SpecItem icon={<MapPin className="h-[18px] w-[18px]" />} label="Postcode" value={vehicle.aanbieder_postcode} />
                    )}
                    {vehicle.link && (
                      <div className="sm:col-span-2">
                        <a
                          href={vehicle.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-smartlease-yellow hover:underline font-medium"
                        >
                          <FileText className="h-4 w-4" />
                          Bekijk originele advertentie
                        </a>
                      </div>
                    )}
                  </div>
                </AccordionSection>
              )}
            </div>
          </div>

          {/* ════════════ RIGHT SIDEBAR (desktop) ════════════ */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-20 space-y-4">
              <div className="space-y-2.5">
                <button onClick={handleWhatsApp} className="w-full bg-[#25D366] hover:bg-[#20c05c] text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-green-500/20 text-sm">
                  <MessageCircle className="h-5 w-5" /><span>WhatsApp over deze auto</span>
                </button>
                <button onClick={handleOfferteNavigate} className="w-full bg-gradient-to-r from-yellow-500 to-yellow-500 hover:from-yellow-600 hover:to-yellow-600 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-yellow-500/20 text-sm">
                  <FileText className="h-5 w-5" /><span>Gratis offerte aanvragen</span>
                </button>
                <button onClick={handleBelMijNavigate} className="w-full bg-white hover:bg-gray-50 text-smartlease-blue border-2 border-smartlease-blue py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2.5 transition-all text-sm">
                  <Phone className="h-5 w-5" /><span>Bel mij over deze auto</span>
                </button>
              </div>

              {vehicle.verkoopprijs > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <LeaseCalculator vehiclePrice={vehicle.verkoopprijs} onChange={setCalculatorState} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky Footer (mobile) ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200/60 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-50">
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
          <div>
            {vehicle.verkoopprijs > 0 ? (
              <>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Maandbedrag</p>
                <p className="text-xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-500 bg-clip-text text-transparent">
                  € {(calculatorState ? calculatorState.maandbedrag : berekenMaandprijs(vehicle.verkoopprijs)).toLocaleString('nl-NL')} p/m
                </p>
              </>
            ) : (
              <>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Vraagprijs</p>
                <p className="text-xl font-bold text-gray-900">{formatPrice(vehicle.verkoopprijs)}</p>
              </>
            )}
          </div>
          <button onClick={handleOfferteNavigate} className="bg-gradient-to-r from-yellow-500 to-yellow-500 hover:from-yellow-600 hover:to-yellow-600 text-white px-5 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-yellow-500/20 flex items-center gap-2">
            <FileText className="h-4 w-4" /><span>Gratis offerte</span>
          </button>
        </div>
      </div>
    </div>
  );
}