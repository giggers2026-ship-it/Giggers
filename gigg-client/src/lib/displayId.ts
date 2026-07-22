/** Pure display-layer IDs derived from the profile UUID — no schema change. */

export function workerDisplayId(id: string): string {
  return `WRK-${id.replace(/-/g, '').slice(0, 6).toUpperCase()}`;
}

export function employerDisplayId(id: string): string {
  return `EMP-${id.replace(/-/g, '').slice(0, 6).toUpperCase()}`;
}

export function displayIdForRole(id: string, role: 'worker' | 'employer' | 'client'): string {
  return role === 'employer' ? employerDisplayId(id) : workerDisplayId(id);
}
