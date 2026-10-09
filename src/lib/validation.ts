export const onlyDigits = (value: string) => value.replace(/\D/g, '');

/* ---------------- WhatsApp / telefone ---------------- */

const VALID_DDDS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38, 41, 42,
  43, 44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69, 71, 73, 74,
  75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

/** (86) 99999-9999 para celular, (86) 3222-2222 para fixo. */
export function maskPhone(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function validatePhone(value: string): string | null {
  const d = onlyDigits(value);
  if (!d) return 'Informe seu WhatsApp com DDD.';
  if (d.length < 10) return 'Número incompleto. Inclua o DDD e todos os dígitos.';
  if (!VALID_DDDS.has(Number(d.slice(0, 2)))) return 'DDD inválido. Confira os dois primeiros dígitos.';
  if (d.length === 11 && d[2] !== '9') return 'Celulares começam com 9 após o DDD.';
  if (d.length === 10 && !/[2-5]/.test(d[2])) return 'Número inválido. Para celular, inclua o 9 após o DDD.';
  if (/^(\d)\1+$/.test(d.slice(2))) return 'Número inválido.';
  return null;
}

/* ---------------- CNPJ (numérico e alfanumérico) ---------------- */

/** Mantém letras e números — o CNPJ alfanumérico da Receita Federal está em vigor desde jul/2026. */
export const normalizeCnpj = (value: string) =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 14);

export function maskCnpj(value: string): string {
  const c = normalizeCnpj(value);
  const parts = [c.slice(0, 2), c.slice(2, 5), c.slice(5, 8), c.slice(8, 12), c.slice(12, 14)];
  let out = parts[0];
  if (c.length > 2) out += `.${parts[1]}`;
  if (c.length > 5) out += `.${parts[2]}`;
  if (c.length > 8) out += `/${parts[3]}`;
  if (c.length > 12) out += `-${parts[4]}`;
  return out;
}

function cnpjCheckDigit(base: string): number {
  const weights = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const sum = base.split('').reduce((acc, ch, i) => acc + (ch.charCodeAt(0) - 48) * weights[i], 0);
  const rest = sum % 11;
  return rest < 2 ? 0 : 11 - rest;
}

export function isValidCnpj(value: string): boolean {
  const c = normalizeCnpj(value);
  if (!/^[A-Z0-9]{12}\d{2}$/.test(c)) return false;
  if (/^(.)\1+$/.test(c)) return false;
  const d1 = cnpjCheckDigit(c.slice(0, 12));
  const d2 = cnpjCheckDigit(c.slice(0, 12) + d1);
  return c.endsWith(`${d1}${d2}`);
}

export function validateCnpj(value: string): string | null {
  const c = normalizeCnpj(value);
  if (!c) return null; // opcional
  if (c.length < 14) return 'CNPJ incompleto. Confira os 14 caracteres ou deixe em branco.';
  if (!isValidCnpj(c)) return 'CNPJ inválido. Confira os números ou deixe em branco.';
  return null;
}

/* ---------------- Textos ---------------- */

const NAME_CHARS = /^[\p{L}' .-]+$/u;

export function validateFullName(value: string): string | null {
  const v = value.trim().replace(/\s+/g, ' ');
  if (!v) return 'Informe seu nome completo.';
  if (!NAME_CHARS.test(v)) return 'Use apenas letras no nome.';
  const words = v.split(' ').filter((w) => w.replace(/[.'-]/g, '').length >= 1);
  if (words.length < 2) return 'Informe nome e sobrenome.';
  if (v.length < 5) return 'Nome muito curto.';
  return null;
}

export function validateBusiness(value: string): string | null {
  const v = value.trim();
  if (!v) return 'Informe o nome do seu estabelecimento.';
  if (v.length < 2) return 'Nome muito curto.';
  return null;
}

export function validateCity(value: string): string | null {
  const v = value.trim();
  if (!v) return 'Informe a cidade do seu estabelecimento.';
  if (v.length < 2 || !/^[\p{L}' .-]+$/u.test(v)) return 'Informe um nome de cidade válido.';
  return null;
}
