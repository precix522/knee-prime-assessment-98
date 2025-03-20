
// Format phone number to E.164 format
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");
  
  // Check if the phone already has a country code (starts with +)
  if (phone.startsWith("+")) {
    return phone;
  }
  
  // For Singapore numbers (8 digits, should have +65 prefix)
  if (digits.length === 8) {
    return `+65${digits}`; // Singapore format
  }
  // For US/Canada (10 digits, should have +1 prefix)
  else if (digits.length === 10) {
    return `+1${digits}`; // US/Canada format
  } 
  // If starting with 65 and has 10 digits total, it's likely a Singapore number without +
  else if (digits.length === 10 && digits.startsWith("65")) {
    return `+${digits}`;
  }
  // For other international numbers
  else {
    return `+${digits}`;
  }
};

// Validate phone number format
export const validatePhoneNumber = (phone: string): boolean => {
  // Basic E.164 validation (+ followed by at least 8 digits for Singapore)
  const e164Regex = /^\+[1-9]\d{7,14}$/;
  return e164Regex.test(phone);
};
