export const AUTH_CONSTANTS = {
  RESET_TOKEN_EXPIRY: 30 * 60 * 1000, // 30 minutes
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_RULES: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    SPECIAL_CHARS: /[!@#$%^&*]/
  },
  USERNAME_RULES: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    ALLOWED_CHARS: /^[a-zA-Z0-9_-]+$/
  }
};

export const UAE_NAME_CONSTANTS = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 50,
  ALLOWED_CHARS: /^[a-zA-Z\s\-']+$/
};

export const UAE_CONSTANTS = {
  EMIRATES: {
    AD: 'Abu Dhabi',
    DU: 'Dubai',
    SH: 'Sharjah',
    AJ: 'Ajman',
    UAQ: 'Umm al-Quwain',
    RAK: 'Ras Al Khaimah',
    FJR: 'Fujairah'
  }
};

export const UAE_PHONE_CONSTANTS = {
  MOBILE_REGEX: /^\+971-?5[0-9]-?[0-9]{7}$/,
  LANDLINE_REGEX: /^\+971-?[0-9]-?[0-9]{7}$/
}; 