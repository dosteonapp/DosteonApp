/**
 * Utility functions for handling numeric input fields.
 * Removes leading zeros to prevent UX issues where typing "5" becomes "05".
 */

/**
 * Clean numeric input for float values (prices, amounts, etc.)
 * Removes leading zeros while preserving decimals
 * Examples: "0050" → "50", "0.5" → "0.5", "" → "0"
 */
export function cleanFloatInput(value: string): number {
  const trimmed = value.trim();
  const cleaned = trimmed.replace(/^0+(?=[1-9]|\d*\.)/, '') || '0';
  return parseFloat(cleaned) || 0;
}

/**
 * Clean numeric input for integer values (quantities, counts, etc.)
 * Removes leading zeros for whole numbers only
 * Examples: "0050" → "50", "005" → "5", "" → "0"
 */
export function cleanIntegerInput(value: string): number {
  const trimmed = value.trim();
  const cleaned = trimmed.replace(/^0+(?=[1-9])/, '') || '0';
  return parseInt(cleaned) || 0;
}

/**
 * Handle onChange for float number inputs
 * Use in inputs like: onChange={(e) => handleFloatChange(e, callback)}
 */
export function handleFloatChange(
  e: React.ChangeEvent<HTMLInputElement>,
  callback: (value: number) => void
): void {
  callback(cleanFloatInput(e.target.value));
}

/**
 * Handle onChange for integer number inputs
 * Use in inputs like: onChange={(e) => handleIntegerChange(e, callback)}
 */
export function handleIntegerChange(
  e: React.ChangeEvent<HTMLInputElement>,
  callback: (value: number) => void
): void {
  callback(cleanIntegerInput(e.target.value));
}
