import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LogoFull } from './components/shared/Logo';
import useAuthStore from './store/authStore';
import './styles/globals.css';

// Pages – lazy loaded
const Landing        = lazy(() => import('./pages/Landing'));
const UserLogin      = lazy(() => import('./pages/auth/UserLogin'));
const UserRegister   = lazy(() => import('./pages/auth/UserRegister'));
const TrainerLogin   = lazy(() => import('./pages/auth/TrainerLogin'));
const TrainerRegister= lazy(() => import('./pages/auth/TrainerRegister'));
const AdminLogin     = lazy(() => import('./pages/auth/AdminLogin'));
const Onboarding     = lazy(() => import('./pages/auth/Onboarding'));

const UserDashboard  = lazy(() => import('./pages/user/Dashboard'));
const UserWorkouts   = lazy(() => import('./pages/user/Workouts'));
const UserWorkoutDetail = lazy(() => import('./pages/user/WorkoutDetail'));
const UserProgress   = lazy(() => import('./pages/user/Progress'));
const UserNutrition  = lazy(() => import('./pages/user/Nutrition'));
const UserBookings   = lazy(() => import('./pages/user/Bookings'));
const UserTrainers   = lazy(() => import('./pages/user/Trainers'));
const UserPrograms   = lazy(() => import('./pages/user/Programs'));
const UserProfile    = lazy(() => import('./pages/user/Profile'));
const UserChat       = lazy(() => import('./pages/user/Chat'));
const UserSessions   = lazy(() => import('./pages/user/Sessions'));

const TrainerDashboard = lazy(() => import('./pages/trainer/Dashboard'));
const TrainerClients   = lazy(() => import('./pages/trainer/Clients'));
const TrainerSchedule  = lazy(() => import('./pages/trainer/Schedule'));
const TrainerWorkouts  = lazy(() => import('./pages/trainer/Workouts'));
const TrainerNutrition = lazy(() => import('./pages/trainer/Nutrition'));
const TrainerBookings  = lazy(() => import('./pages/trainer/Bookings'));
const TrainerAnalytics = lazy(() => import('./pages/trainer/Analytics'));
const TrainerProfile   = lazy(() => import('./pages/trainer/Profile'));
const TrainerChat      = lazy(() => import('./pages/trainer/Chat'));

const AdminDashboard   = lazy(() => import('./pages/admin/Dashboard'));
const AdminTrainers    = lazy(() => import('./pages/admin/Trainers'));
const AdminUsers       = lazy(() => import('./pages/admin/Users'));
const AdminBookings    = lazy(() => import('./pages/admin/Bookings'));
const AdminPayments    = lazy(() => import('./pages/admin/Payments'));
const AdminWorkouts    = lazy(() => import('./pages/admin/Workouts'));
const AdminPrograms    = lazy(() => import('./pages/admin/Programs'));
const AdminNutrition   = lazy(() => import('./pages/admin/Nutrition'));
const AdminAnalytics   = lazy(() => import('./pages/admin/Analytics'));
const AdminNotifications = lazy(() => import('./pages/admin/Notifications'));
const AdminBlog          = lazy(() => import('./pages/admin/Blog'));

// Info pages
const AboutPage         = lazy(() => import('./pages/info/About'));
const ContactPage       = lazy(() => import('./pages/info/Contact'));
const PrivacyPage       = lazy(() => import('./pages/info/Privacy'));
const TermsPage         = lazy(() => import('./pages/info/Terms'));
const RefundPage        = lazy(() => import('./pages/info/InfoPages').then(m => ({ default: m.RefundPage })));
const HelpPage          = lazy(() => import('./pages/info/InfoPages').then(m => ({ default: m.HelpPage })));
const BecomeTrainerPage = lazy(() => import('./pages/info/InfoPages').then(m => ({ default: m.BecomeTrainerPage })));
const BlogPage          = lazy(() => import('./pages/info/InfoPages').then(m => ({ default: m.BlogPage })));
const CareersPage       = lazy(() => import('./pages/info/InfoPages').then(m => ({ default: m.CareersPage })));
const CookiePage        = lazy(() => import('./pages/info/InfoPages').then(m => ({ default: m.CookiePage })));

const UserLayout    = lazy(() => import('./components/layouts/UserLayout'));
const TrainerLayout = lazy(() => import('./components/layouts/TrainerLayout'));
const AdminLayout   = lazy(() => import('./components/layouts/AdminLayout'));

// ── Loading screen ──────────────────────────────────────────────────────────
const LoadingScreen = () => (
  <div className="loading-screen">
    <div style={{ textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:20 }}>
      <LogoFull height={42} linkTo={null}/>
      <div className="spinner spinner-lg"/>
    </div>
  </div>
);

// ── Route guards ─────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role } = useAuthStore();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/" state={{ from: location }} replace/>;
  if (allowedRoles && !allowedRoles.includes(role)) {
    const map = { user:'/user/dashboard', trainer:'/trainer/dashboard', admin:'/admin/dashboard', superadmin:'/admin/dashboard' };
    return <Navigate to={map[role] || '/'} replace/>;
  }
  return children;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated, role, user } = useAuthStore();
  if (!isAuthenticated) return children;
  if (role === 'user') return <Navigate to={user?.onboardingCompleted ? '/user/dashboard' : '/onboarding'} replace/>;
  if (role === 'trainer') return <Navigate to="/trainer/dashboard" replace/>;
  if (role === 'admin' || role === 'superadmin') return <Navigate to="/admin/dashboard" replace/>;
  return children;
};

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (accessToken) {
      import('./utils/api').then(m => {
        m.default.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      });
    }
  }, [accessToken]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background:'var(--surface)', color:'var(--text-primary)',
            border:'1px solid var(--border)', borderRadius:10,
            fontSize:14, fontFamily:'var(--font-body)',
            boxShadow:'var(--shadow-md)',
          },
          success: { iconTheme:{ primary:'var(--neon-lime)', secondary:'#060608' } },
          error:   { iconTheme:{ primary:'var(--error)',    secondary:'#fff' } },
          duration: 3500,
        }}
      />
      <Suspense fallback={<LoadingScreen/>}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<GuestRoute><Landing/></GuestRoute>}/>

          {/* Auth */}
          <Route path="/login"            element={<GuestRoute><UserLogin/></GuestRoute>}/>
          <Route path="/register"         element={<GuestRoute><UserRegister/></GuestRoute>}/>
          <Route path="/trainer/login"    element={<GuestRoute><TrainerLogin/></GuestRoute>}/>
          <Route path="/trainer/register" element={<GuestRoute><TrainerRegister/></GuestRoute>}/>
          <Route path="/admin/login"      element={<GuestRoute><AdminLogin/></GuestRoute>}/>
          <Route path="/onboarding"       element={<ProtectedRoute allowedRoles={['user']}><Onboarding/></ProtectedRoute>}/>

          {/* User */}
          <Route path="/user" element={<ProtectedRoute allowedRoles={['user']}><UserLayout/></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace/>}/>
            <Route path="dashboard" element={<UserDashboard/>}/>
            <Route path="workouts"  element={<UserWorkouts/>}/>
            <Route path="workouts/:id" element={<UserWorkoutDetail/>}/>
            <Route path="progress"  element={<UserProgress/>}/>
            <Route path="nutrition" element={<UserNutrition/>}/>
            <Route path="bookings"  element={<UserBookings/>}/>
            <Route path="trainers"  element={<UserTrainers/>}/>
            <Route path="programs"  element={<UserPrograms/>}/>
            <Route path="chat"      element={<UserChat/>}/>
            <Route path="sessions"  element={<UserSessions/>}/>
            <Route path="profile"   element={<UserProfile/>}/>
          </Route>

          {/* Trainer */}
          <Route path="/trainer" element={<ProtectedRoute allowedRoles={['trainer']}><TrainerLayout/></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace/>}/>
            <Route path="dashboard" element={<TrainerDashboard/>}/>
            <Route path="clients"   element={<TrainerClients/>}/>
            <Route path="schedule"  element={<TrainerSchedule/>}/>
            <Route path="workouts"  element={<TrainerWorkouts/>}/>
            <Route path="nutrition" element={<TrainerNutrition/>}/>
            <Route path="bookings"  element={<TrainerBookings/>}/>
            <Route path="analytics" element={<TrainerAnalytics/>}/>
            <Route path="chat"      element={<TrainerChat/>}/>
            <Route path="profile"   element={<TrainerProfile/>}/>
          </Route>

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin','superadmin']}><AdminLayout/></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace/>}/>
            <Route path="dashboard"     element={<AdminDashboard/>}/>
            <Route path="trainers"      element={<AdminTrainers/>}/>
            <Route path="users"         element={<AdminUsers/>}/>
            <Route path="bookings"      element={<AdminBookings/>}/>
            <Route path="payments"      element={<AdminPayments/>}/>
            <Route path="workouts"      element={<AdminWorkouts/>}/>
            <Route path="programs"      element={<AdminPrograms/>}/>
            <Route path="nutrition"     element={<AdminNutrition/>}/>
            <Route path="analytics"     element={<AdminAnalytics/>}/>
            <Route path="notifications" element={<AdminNotifications/>}/>
            <Route path="blog"           element={<AdminBlog/>}/>
          </Route>

          {/* Info / legal pages — public */}
          <Route path="/info/about"          element={<AboutPage/>}/>
          <Route path="/info/contact"        element={<ContactPage/>}/>
          <Route path="/info/privacy"        element={<PrivacyPage/>}/>
          <Route path="/info/terms"          element={<TermsPage/>}/>
          <Route path="/info/refund"         element={<RefundPage/>}/>
          <Route path="/info/help"           element={<HelpPage/>}/>
          <Route path="/info/become-trainer" element={<BecomeTrainerPage/>}/>
          <Route path="/info/blog"           element={<BlogPage/>}/>
          <Route path="/info/careers"        element={<CareersPage/>}/>
          <Route path="/info/cookies"        element={<CookiePage/>}/>

          <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
