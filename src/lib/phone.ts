/** Convert a phone number into a synthetic email for Supabase email auth. */
export function phoneToEmail(phone: string): string {
  const clean = phone.replace(/[^0-9]/g, "");
  return `${clean}@kitchen.app`;
}

export function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9+]/g, "");
}

export function isValidPhone(phone: string): boolean {
  const clean = normalizePhone(phone);
  return /^\+?\d{8,15}$/.test(clean);
}
