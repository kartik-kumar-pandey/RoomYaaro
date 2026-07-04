import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import BrowseListings from './pages/BrowseListings';
import ListingDetail from './pages/ListingDetail';
import NotFound from './pages/NotFound';
import Chat from './pages/Chat';

import TenantDashboard from './pages/tenant/TenantDashboard';
import TenantProfile from './pages/tenant/TenantProfile';
import TenantRecommendations from './pages/tenant/TenantRecommendations';
import TenantInterests from './pages/tenant/TenantInterests';

import OwnerDashboard from './pages/owner/OwnerDashboard';
import CreateListing from './pages/owner/CreateListing';
import OwnerListings from './pages/owner/OwnerListings';
import OwnerInterests from './pages/owner/OwnerInterests';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminListings from './pages/admin/AdminListings';
import AdminAnalytics from './pages/admin/AdminAnalytics';

const App = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/verify-email" element={<VerifyEmail />} />
    <Route path="/listings" element={<BrowseListings />} />
    <Route path="/listings/:id" element={<ListingDetail />} />

    <Route path="/tenant/dashboard" element={<ProtectedRoute roles={['TENANT']}><TenantDashboard /></ProtectedRoute>} />
    <Route path="/tenant/profile" element={<ProtectedRoute roles={['TENANT']}><TenantProfile /></ProtectedRoute>} />
    <Route path="/tenant/listings" element={<BrowseListings />} />
    <Route path="/tenant/recommendations" element={<ProtectedRoute roles={['TENANT']}><TenantRecommendations /></ProtectedRoute>} />
    <Route path="/tenant/interests" element={<ProtectedRoute roles={['TENANT']}><TenantInterests /></ProtectedRoute>} />
    <Route path="/tenant/chat" element={<ProtectedRoute roles={['TENANT']}><Chat /></ProtectedRoute>} />

    <Route path="/owner/dashboard" element={<ProtectedRoute roles={['OWNER']}><OwnerDashboard /></ProtectedRoute>} />
    <Route path="/owner/create-listing" element={<ProtectedRoute roles={['OWNER']}><CreateListing /></ProtectedRoute>} />
    <Route path="/owner/listings" element={<ProtectedRoute roles={['OWNER']}><OwnerListings /></ProtectedRoute>} />
    <Route path="/owner/interests" element={<ProtectedRoute roles={['OWNER']}><OwnerInterests /></ProtectedRoute>} />
    <Route path="/owner/chat" element={<ProtectedRoute roles={['OWNER']}><Chat /></ProtectedRoute>} />

    <Route path="/admin/dashboard" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
    <Route path="/admin/users" element={<ProtectedRoute roles={['ADMIN']}><AdminUsers /></ProtectedRoute>} />
    <Route path="/admin/listings" element={<ProtectedRoute roles={['ADMIN']}><AdminListings /></ProtectedRoute>} />
    <Route path="/admin/analytics" element={<ProtectedRoute roles={['ADMIN']}><AdminAnalytics /></ProtectedRoute>} />

    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;
