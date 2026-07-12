import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import ForgotPassword from '../pages/ForgotPassword';
import OrganizationSetup from '../pages/OrganizationSetup';
import Assets from '../pages/Assets';
import AssetDetails from '../pages/AssetDetails';
import Allocation from '../pages/Allocation';
import AllocationDetails from '../pages/AllocationDetails';
import Transfers from '../pages/Transfers';
import Audit from '../pages/Audit';
import Reports from '../pages/Reports';
import ResourceBooking from '../pages/ResourceBooking';
import Maintenance from '../pages/Maintenance';
import Dashboard from '../pages/Dashboard';

import { Notifications } from '../pages/Notifications';
import { ActivityLogs } from '../pages/ActivityLogs';

/**
 * Defines routes for the AssetFlow module structure.
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('assetflow_token');
  return token ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Protected Routes */}
      <Route path="/organization-setup" element={<ProtectedRoute><OrganizationSetup /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/assets" element={<ProtectedRoute><Assets /></ProtectedRoute>} />
      <Route path="/assets/:id" element={<ProtectedRoute><AssetDetails /></ProtectedRoute>} />
      <Route path="/allocation" element={<ProtectedRoute><Allocation /></ProtectedRoute>} />
      <Route path="/allocations/:id" element={<ProtectedRoute><AllocationDetails /></ProtectedRoute>} />
      <Route path="/transfers" element={<ProtectedRoute><Transfers /></ProtectedRoute>} />
      <Route path="/booking" element={<ProtectedRoute><ResourceBooking /></ProtectedRoute>} />
      <Route path="/maintenance" element={<ProtectedRoute><Maintenance /></ProtectedRoute>} />
      <Route path="/audit" element={<ProtectedRoute><Audit /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/activity-logs" element={<ProtectedRoute><ActivityLogs /></ProtectedRoute>} />

      {/* Redirect wildcards */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
