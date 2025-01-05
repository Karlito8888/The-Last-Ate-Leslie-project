import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Logo from '../Logo/Logo'
import { selectCurrentUser, setCredentials } from '../../store/slices/authSlice'
import styles from './Header.module.scss'

interface HeaderProps {
  isFirstVisit: boolean
}

const Header: React.FC<HeaderProps> = ({ isFirstVisit }) => {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)

  useEffect(() => {
    // Vérifier si un token existe dans le localStorage
    const token = localStorage.getItem('token')
    if (token && !user) {
      // Si on a un token mais pas d'utilisateur dans le state, on récupère les infos du token
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]))
        console.log('Token décodé:', tokenData)
        dispatch(setCredentials({
          user: {
            id: tokenData.userId,
            username: tokenData.username,
            email: tokenData.email,
            role: tokenData.role
          },
          token
        }))
      } catch (error) {
        console.error('Failed to parse token:', error)
        localStorage.removeItem('token')
      }
    }
  }, [dispatch, user])

  return (
    <header className={styles.header}>
      <h1 className={styles.srOnly}>Dynamic Vision Global</h1>
      <h2 className={styles.srOnly}>The best PR & Marketing provider in Dubai</h2>
      <Logo isFirstVisit={isFirstVisit} />
      {user && (
        <div className={styles.welcomeMessage}>
          <span>Hello {user?.username || 'User'} 👋</span>
        </div>
      )}
    </header>
  )
}

export default Header 