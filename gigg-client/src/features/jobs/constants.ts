export interface JobCategoryOption {
  value: string;
  label: string;
  icon: string;
}

export const JOB_CATEGORIES: JobCategoryOption[] = [
  { value: 'Catering', label: 'Catering', icon: '👨‍🍳' },
  { value: 'Pamphlet Dist.', label: 'Pamphlet Distribution', icon: '📄' },
  { value: 'Survey', label: 'Survey', icon: '📋' },
  { value: 'Event Staff', label: 'Event Staff', icon: '🎪' },
  { value: 'Promotion', label: 'Promotion / Brand Ambassador', icon: '📣' },
  { value: 'Delivery', label: 'Delivery', icon: '🛵' },
  { value: 'Data Entry', label: 'Data Entry', icon: '💻' },
  { value: 'Other', label: 'Other', icon: '🧩' },
];

/** The dosAndDonts field is stored as a single string (no DB schema change).
 * These markers let the UI split it into separate Do's / Don'ts textareas and display blocks. */
const DOS_MARKER = "Do's:";
const DONTS_MARKER = "Don'ts:";

export function parseDosAndDonts(combined: string): { dos: string; donts: string } {
  if (!combined) return { dos: '', donts: '' };
  const dontsIndex = combined.indexOf(DONTS_MARKER);
  if (!combined.startsWith(DOS_MARKER) || dontsIndex === -1) {
    // Legacy free-text value written before the split existed — show as-is under Do's.
    return { dos: combined, donts: '' };
  }
  // Strip only the single separating newline directly after each marker, not user-typed whitespace.
  const dos = combined.slice(DOS_MARKER.length + 1, dontsIndex - 2);
  const donts = combined.slice(dontsIndex + DONTS_MARKER.length + 1);
  return { dos, donts };
}

export function formatDosAndDonts(dos: string, donts: string): string {
  if (!dos && !donts) return '';
  return `${DOS_MARKER}\n${dos}\n\n${DONTS_MARKER}\n${donts}`;
}
