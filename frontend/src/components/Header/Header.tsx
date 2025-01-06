import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Logo from '../Logo/Logo'
import { selectCurrentUser, setCredentials } from '../../store/slices/authSlice'
import { useGetProfileQuery } from '../../store/api/profileApi'
import styles from './Header.module.scss'

interface HeaderProps {
  isFirstVisit: boolean
}

const Header: React.FC<HeaderProps> = ({ isFirstVisit }) => {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const token = localStorage.getItem('token')
  const { data: profileData } = useGetProfileQuery(undefined, {
    skip: !token || !!user
  })

  useEffect(() => {
    if (token && !user && profileData?.data) {
      dispatch(setCredentials({
        user: profileData.data,
        token
      }))
    }
  }, [dispatch, user, profileData, token])

  return (
    <header className={styles.header}>
      <h1 className={styles.srOnly}>Dynamic Vision Global</h1>
      <h2 className={styles.srOnly}>The best PR & Marketing provider in Dubai</h2>
      <Logo isFirstVisit={isFirstVisit} />
      {(user || (token && profileData?.data)) && (
        <div className={styles.welcomeMessage}>
          <span>Hello {user?.username || profileData?.data.username} 👋</span>
        </div>
      )}
    </header>
  )
}

export default Header 