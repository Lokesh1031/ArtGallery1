// Currency Utility for INR display only
// All prices are stored in Indian Rupees (INR) in the database

/**
 * Formats a price in INR
 * @param {number} amount - The amount in INR
 * @returns {string} Formatted INR price
 */
export const formatINR = (amount) => {
  if (!amount || isNaN(amount)) return '₹0.00';
  
  // Format with Indian numbering system (lakhs, crores)
  const formatted = parseFloat(amount).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });
  
  return `₹${formatted}`;
};

/**
 * Formats a price for compact display (no conversion needed)
 * @param {number} inrAmount - The amount in INR
 * @returns {object} Object with inr string
 */
export const formatPriceSplit = (inrAmount) => {
  if (!inrAmount || isNaN(inrAmount)) {
    return { inr: '₹0.00' };
  }
  
  return {
    inr: formatINR(inrAmount)
  };
};

export default {
  formatINR,
  formatPriceSplit
};
