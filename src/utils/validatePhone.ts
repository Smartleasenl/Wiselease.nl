// Valideer Nederlands telefoonnummer
// Accepteert: 06xxxxxxxx, 085xxxxxxx, +31xxxxxxxxx, 0031xxxxxxxxx
// Met of zonder spaties/streepjes
export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-().]/g, '');
  // NL mobiel: 06 + 8 cijfers
  // NL vast: 0[1-9] + 7-8 cijfers  
  // Internationaal: +31 of 0031 + 9 cijfers
  return /^((\+31|0031)[1-9][0-9]{8}|0[1-9][0-9]{7,8})$/.test(cleaned);
}

export function phoneErrorMsg(): string {
  return 'Vul een geldig telefoonnummer in (bijv. 06-12345678 of 085 800 8777)';
}
