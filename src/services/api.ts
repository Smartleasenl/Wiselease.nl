async search(params: SearchParams): Promise<SearchResponse> {
  const queryParams = new URLSearchParams();
  const multiKeys = ['merk', 'model', 'categorie', 'brandstof', 'transmissie', 'kleur', 'btw_marge'];
  
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (multiKeys.includes(key)) {
      const vals = value.toString().split(',').map(v => v.trim()).filter(Boolean);
      vals.forEach(v => queryParams.append(key, v));
    } else {
      queryParams.append(key, value.toString());
    }
  });
  
  const response = await fetch(`${API_BASE_URL}/search?${queryParams}`);
  if (!response.ok) throw new Error('Failed to fetch vehicles');
  return response.json();
},