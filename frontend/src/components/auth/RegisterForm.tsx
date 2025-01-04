import React, { useState, ChangeEvent, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useRegisterMutation, useLoginMutation } from '../../store/api/authApi'
import { setCredentials } from '../../store/slices/authSlice'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import styles from './RegisterForm.module.scss'

const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{8,}$/;

const RULES = {
  username: { min: 3, max: 50 },
  password: { min: 8 }
}

interface FormData {
  username: string
  email: string
  password: string
  confirmPassword: string
  newsletterSubscribed: boolean
}

interface ValidationErrors {
  username?: string
  email?: string
  password?: string
  confirmPassword?: string
}

interface ValidationState {
  errors: ValidationErrors;
  focusedField: string | null;
}

const RegisterForm: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [register, { isLoading: isRegistering, error: registerError }] = useRegisterMutation()
  const [login, { isLoading: isLoggingIn }] = useLoginMutation()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    newsletterSubscribed: true
  })
  
  const [validationState, setValidationState] = useState<ValidationState>({
    errors: {},
    focusedField: null
  });

  const helpMessages = {
    username: '3-50 characters',
    email: 'Enter a valid email address',
    password: 'Min. 8 chars, 1 uppercase, 1 special char',
    confirmPassword: 'Must match password'
  };

  const handleFocus = (fieldName: string) => {
    setValidationState(prev => ({
      ...prev,
      focusedField: fieldName
    }));
  };

  const handleBlur = () => {
    setValidationState(prev => ({
      ...prev,
      focusedField: null
    }));
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required'
    } else if (
      formData.username.length < RULES.username.min ||
      formData.username.length > RULES.username.max
    ) {
      errors.username = `Username must be between ${RULES.username.min} and ${RULES.username.max} characters`
    } else if (!USERNAME_REGEX.test(formData.username)) {
      errors.username = 'Username must contain only letters, numbers, dashes and underscores'
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!EMAIL_REGEX.test(formData.email)) {
      errors.email = 'Invalid email format'
    }
    
    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (!PASSWORD_REGEX.test(formData.password)) {
      errors.password = 'Password must contain at least 8 characters, one uppercase letter and one special character'
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setValidationState(prev => ({
      ...prev,
      errors
    }));
    return Object.keys(errors).length === 0
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const userData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      newsletter: formData.newsletterSubscribed
    }

    try {
      await register(userData).unwrap()

      // After successful registration, automatically log in
      const loginResponse = await login({
        email: formData.email,
        password: formData.password
      }).unwrap()

      dispatch(setCredentials(loginResponse.data))
      toast.success('Account created successfully! Welcome to your profile.')
      navigate('/profile')
    } catch (err) {
      console.error('Registration/Login failed:', err)
      toast.error('Registration failed. Please try again.')
    }
  }

  return (
    <div className={styles.registerContainer}>
      <form onSubmit={handleSubmit} className={styles.registerForm}>
        <h2>Create Account</h2>
        
        <div className={styles.formGroup}>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            onFocus={() => handleFocus('username')}
            onBlur={handleBlur}
            placeholder="Username"
            className={validationState.focusedField === 'username' && !validationState.errors.username ? styles.info : validationState.errors.username ? styles.error : ''}
          />
          <label className={styles.floatingLabel}>Username</label>
          {validationState.focusedField === 'username' && !validationState.errors.username && (
            <span className={`${styles.errorMessage} ${styles.info}`}>
              {helpMessages.username}
            </span>
          )}
          {validationState.errors.username && (
            <span className={`${styles.errorMessage} ${styles.error}`}>
              {validationState.errors.username}
            </span>
          )}
        </div>

        <div className={styles.formGroup}>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onFocus={() => handleFocus('email')}
            onBlur={handleBlur}
            placeholder="Email"
            className={validationState.focusedField === 'email' && !validationState.errors.email ? styles.info : validationState.errors.email ? styles.error : ''}
          />
          <label className={styles.floatingLabel}>Email</label>
          {validationState.focusedField === 'email' && !validationState.errors.email && (
            <span className={`${styles.errorMessage} ${styles.info}`}>
              {helpMessages.email}
            </span>
          )}
          {validationState.errors.email && (
            <span className={`${styles.errorMessage} ${styles.error}`}>
              {validationState.errors.email}
            </span>
          )}
        </div>

        <div className={styles.formGroup}>
          <div className={styles.passwordInputWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => handleFocus('password')}
              onBlur={handleBlur}
              placeholder="Password"
              className={validationState.focusedField === 'password' && !validationState.errors.password ? styles.info : validationState.errors.password ? styles.error : ''}
            />
            <label className={styles.floatingLabel}>Password</label>
            <button
              type="button"
              className={styles.togglePassword}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {validationState.focusedField === 'password' && !validationState.errors.password && (
            <span className={`${styles.errorMessage} ${styles.info}`}>
              {helpMessages.password}
            </span>
          )}
          {validationState.errors.password && (
            <span className={`${styles.errorMessage} ${styles.error}`}>
              {validationState.errors.password}
            </span>
          )}
        </div>

        <div className={styles.formGroup}>
          <div className={styles.passwordInputWrapper}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onFocus={() => handleFocus('confirmPassword')}
              onBlur={handleBlur}
              placeholder="Confirm Password"
              className={validationState.focusedField === 'confirmPassword' && !validationState.errors.confirmPassword ? styles.info : validationState.errors.confirmPassword ? styles.error : ''}
            />
            <label className={styles.floatingLabel}>Confirm Password</label>
            <button
              type="button"
              className={styles.togglePassword}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {validationState.focusedField === 'confirmPassword' && !validationState.errors.confirmPassword && (
            <span className={`${styles.errorMessage} ${styles.info}`}>
              {helpMessages.confirmPassword}
            </span>
          )}
          {validationState.errors.confirmPassword && (
            <span className={`${styles.errorMessage} ${styles.error}`}>
              {validationState.errors.confirmPassword}
            </span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="newsletterSubscribed"
              checked={formData.newsletterSubscribed}
              onChange={handleChange}
              className={styles.checkbox}
            />
            <span className={styles.checkmark}></span>
            Subscribe to our newsletter
          </label>
        </div>

        {registerError && 'data' in registerError && (
          <div className={styles.apiError}>
            {(registerError.data as { message?: string })?.message || 'An error occurred during registration'}
          </div>
        )}

        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={isRegistering || isLoggingIn}
        >
          {isRegistering ? 'Creating account...' : isLoggingIn ? 'Logging in...' : 'Create Account'}
        </button>
      </form>
    </div>
  )
}

export default RegisterForm 