// Importers: JournalView.tsx (via ui/calendar.tsx), ui/calendar.tsx
// Affected API: cn(...) string joiner, no runtime config
// Data schemas: none
// User instruction: "all three" — implement scenario creation UI, share persona links, App.tsx refactor (current: calendar in journal tab)
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
