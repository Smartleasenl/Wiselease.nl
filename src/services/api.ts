async search(params: SearchParams): Promise<SearchResponse> {
  const queryParams = new URLSearchParams();
  
  const multiKeys = new Set(['merk', 'model', 'categorie', 'brandstof', 'transmissie', 'kleur', 'btw_marge']);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (multiKeys.has(key)) {
      // Stuur als meerdere aparte params zodat getAll() werkt
      const vals = value.toString().split(',').map((v: string) => v.trim()).filter(Boolean);
      vals.forEach((v: string) => queryParams.append(key, v));
    } else {
      queryParams.append(key, value.toString());
    }
  });
  
  const response = await fetch(`${API_BASE_URL}/search?${queryParams}`);
  if (!response.ok) throw new Error('Failed to fetch vehicles');
  return response.json();
},