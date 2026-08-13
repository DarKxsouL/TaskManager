import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast';
import './App.css'
import { lazy, Suspense } from 'react'
import LayoutSkeleton from './components/LayoutSkeleton'
import SocketManager from './components/SocketManager'
import { useAuth } from './context/AuthContext'

//lazy load components
const Login =  lazy(() => import('./pages/Login'))
const JoinRoom = lazy(() => import('./pages/JoinRoom'))
const Navbar =  lazy(() => import('./components/Navbar'))
const Header =  lazy(() => import('./components/Header'))
const Assigned =  lazy(() => import('./pages/Assigned'))
const Created =  lazy(() => import('./pages/Created'))
const Overdue =  lazy(() => import('./pages/Overdued'))
const Profile =  lazy(() => import('./pages/Profile'))
const Network =  lazy(() => import('./pages/Network'))
const History =  lazy(() => import('./pages/History'))
const Settings =  lazy(() => import('./pages/Settings'))

const RequireApprovedRoom = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, roomStatus } = useAuth();

  if (loading) return <LayoutSkeleton />;

  // Not logged in → back to login
  if (!user) return <Navigate to="/" replace />;

  // Logged in but not in a room yet → join room page
  if (roomStatus !== 'approved') return <Navigate to="/join-room" replace />;

  return <>{children}</>;
};

function App() {

  const { user } = useAuth();

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
      {/* Public — login */}
      <Route path='/' element={<Login/>} />
      
      {/* Semi-public — logged in but no room yet */}
      <Route
          path="/join-room"
          element={
            <Suspense fallback={<LayoutSkeleton />}>
              <JoinRoom />
            </Suspense>
          }
        />

      {/* Protected — needs approved room */}
      <Route path='/:username' element={
        <>
        <RequireApprovedRoom>
        <Suspense fallback={<LayoutSkeleton />}>
          <Navbar />
        </Suspense>
        <Outlet />
        </RequireApprovedRoom>
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
