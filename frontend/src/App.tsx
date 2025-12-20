import { Outlet, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast';
import './App.css'
import { lazy, Suspense } from 'react'
import LayoutSkeleton from './components/LayoutSkeleton'
import SocketManager from './components/SocketManager'

//lazy load components
const Login =  lazy(() => import('./pages/Login'))
const Navbar =  lazy(() => import('./components/Navbar'))
const Header =  lazy(() => import('./components/Header'))
const Assigned =  lazy(() => import('./pages/Assigned'))
const Created =  lazy(() => import('./pages/Created'))
const Overdue =  lazy(() => import('./pages/Overdued'))
const Profile =  lazy(() => import('./pages/Profile'))
const Network =  lazy(() => import('./pages/Network'))
const History =  lazy(() => import('./pages/History'))
const Settings =  lazy(() => import('./pages/Settings'))

function App() {

  return (
    <>
    <Toaster 
        position="top-right"
        toastOptions={{
            // Define default options
            duration: 4000,
            style: {
                background: '#333',
                color: '#fff',
            },
            // Default options for specific types
            success: {
                iconTheme: {
                    primary: '#22c55e', // Green
                    secondary: '#fff',
                },
            },
            error: {
                iconTheme: {
                    primary: '#ef4444', // Red
                    secondary: '#fff',
                },
            },
        }}
    />
    <SocketManager />
    <Routes>
      <Route path='/' element={<Login/>} />
      
      <Route path='/:username' element={
        <>
        <Suspense fallback={<LayoutSkeleton />}>
          <Navbar />
        </Suspense>
        <Outlet />
        </>
      } >
        
        <Route element={
          <Suspense fallback={<LayoutSkeleton />}>
            <Header />
            <Outlet />
          </Suspense>
        } >
          <Route index element={<Assigned/>} />
          <Route path='/:username/created' element={<Created/>} />
          <Route path='/:username/overdue' element={<Overdue/>} />
        </Route>
        <Route path='profile' element={<Profile/>} />
        <Route path='network' element={<Network/>} />
        <Route path='history' element={<History/>} />
        <Route path='settings' element={<Settings/>} />
        
        </Route>
    </Routes>
      
      
    </>
  )
}

export default App
