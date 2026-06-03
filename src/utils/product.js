export const PRODUCT_NAME = 'AI Market Insights System';

/** Map legacy engine label to current product name for UI display. */
export function displayProductName(name) {
  if (!name || name === 'AMD AI Engine' || name === 'AMD AI Trading Engine') {
    return PRODUCT_NAME;
  }
  return name;
}
