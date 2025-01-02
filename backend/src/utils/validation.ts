import { AUTH_CONSTANTS } from '../config/constants';

export const isPasswordValid = (password: string): boolean => {
  const { MIN_LENGTH, REQUIRE_UPPERCASE, SPECIAL_CHARS } = AUTH_CONSTANTS.PASSWORD_RULES;
  
  return password.length >= MIN_LENGTH && 
         (!REQUIRE_UPPERCASE || /[A-Z]/.test(password)) && 
         SPECIAL_CHARS.test(password);
};

export const isUsernameValid = (username: string): boolean => {
  const { MIN_LENGTH, MAX_LENGTH, ALLOWED_CHARS } = AUTH_CONSTANTS.USERNAME_RULES;
  
  return username.length >= MIN_LENGTH && 
         username.length <= MAX_LENGTH && 
         ALLOWED_CHARS.test(username);
}; 