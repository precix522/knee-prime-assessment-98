
// Format phone number to E.164 format
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters except plus sign
  const cleaned = phone.replace(/[^\d+]/g, "");
  
  // If the number already starts with +, return it
  if (cleaned.startsWith("+")) {
    return cleaned;
  }
  
  // For Singapore numbers (8 digits)
  if (cleaned.length === 8) {
    return `+65${cleaned}`; // Singapore format
  }
  
  // For US/Canada numbers (10 digits)
  if (cleaned.length === 10) {
    return `+1${cleaned}`; // US/Canada format
  }
  
  // If number starts with 65 and is 10 digits
  if (cleaned.length === 10 && cleaned.startsWith("65")) {
    return `+${cleaned}`;
  }
  
  // For other cases, just add + if not present
  return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
};

// Validate phone number format
export const validatePhoneNumber = (phone: string): boolean => {
  // Matches E.164 format more loosely to support various international formats
  // Allows + followed by 7-15 digits (international standard for phone numbers)
  const e164Regex = /^\+\d{7,15}$/;
  return e164Regex.test(phone);
};
