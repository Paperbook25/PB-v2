// Common selectors used across E2E tests

export const selectors = {
  // Navigation
  sidebar: '[data-testid="sidebar"], nav',
  sidebarLink: (name: string) => `nav a:has-text("${name}"), [data-testid="sidebar"] a:has-text("${name}")`,

  // Common UI
  searchInput: 'input[placeholder*="Search"]',
  selectTrigger: (label: string) => `[role="combobox"]:near(:text("${label}"))`,
  loadingSkeleton: '[class*="skeleton"], [data-testid="skeleton"]',

  // Tables
  tableRow: 'tbody tr',
  tableCell: 'td',

  // Forms
  submitButton: 'button[type="submit"]',
  cancelButton: 'button:has-text("Cancel")',

  // Dialogs
  dialog: '[role="dialog"]',
  alertDialog: '[role="alertdialog"]',
  dialogConfirm: '[role="alertdialog"] button:has-text("Delete"), [role="alertdialog"] button:has-text("Confirm")',

  // Dropdowns
  selectContent: '[role="listbox"]',
  selectItem: (text: string) => `[role="option"]:has-text("${text}")`,
}
