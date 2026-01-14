import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { store } from './store/store.ts'
import App from './App'
import Home from './pages/Home/Home'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import './styles/main.scss'

// Lazy load non-critical pages for better initial load performance
const RegisterForm = lazy(() => import('./components/auth/RegisterForm'))
const Login = lazy(() => import('./components/auth/Login'))
const Services = lazy(() => import('./pages/Services/Services'))
const Portfolio = lazy(() => import('./pages/Portfolio/Portfolio'))
const About = lazy(() => import('./pages/About/About'))
const Contact = lazy(() => import('./pages/Contact/Contact'))
const Profile = lazy(() => import('./pages/Profile/Profile'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard/AdminDashboard'))

// Loading fallback component
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
    <div style={{ color: '#7A5C10', fontSize: '1rem' }}>Loading...</div>
  </div>
)

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: '/auth/register',
        element: <Suspense fallback={<PageLoader />}><RegisterForm /></Suspense>,
      },
      {
        path: '/auth/login',
        element: <Suspense fallback={<PageLoader />}><Login /></Suspense>,
      },
      {
        path: '/services',
        element: <Suspense fallback={<PageLoader />}><Services /></Suspense>,
      },
      {
        path: '/portfolio',
        element: <Suspense fallback={<PageLoader />}><Portfolio /></Suspense>,
      },
      {
        path: '/about',
        element: <Suspense fallback={<PageLoader />}><About /></Suspense>,
      },
      {
        path: '/contact',
        element: <Suspense fallback={<PageLoader />}><Contact /></Suspense>,
      },
      {
        path: '/profile',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}><Profile /></Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin',
        element: (
          <ProtectedRoute requiredRole="admin">
            <Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>
          </ProtectedRoute>
        ),
      },
    ],
  },
])

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Failed to find the root element')

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>,
) 