import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import ForgotPassword from '../pages/ForgotPassword';
import OrganizationSetup from '../pages/OrganizationSetup';
import ComingSoon from '../pages/ComingSoon';

/**
 * Defines routes for the AssetFlow module structure.
 */
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Module 2 Core Route */}
      <Route path="/organization-setup" element={<OrganizationSetup />} />
      
      {/* Sidebar Mock Placeholder Routes */}
      <Route path="/dashboard" element={<ComingSoon title="Dashboard" />} />
      <Route path="/assets" element={<ComingSoon title="Assets" />} />
      <Route path="/allocation" element={<ComingSoon title="Allocation & Transfer" />} />
      <Route path="/booking" element={<ComingSoon title="Resource Booking" />} />
      <Route path="/maintenance" element={<ComingSoon title="Maintenance" />} />
      <Route path="/audit" element={<ComingSoon title="Audit" />} />
      <Route path="/reports" element={<ComingSoon title="Reports" />} />
      <Route path="/notifications" element={<ComingSoon title="Notifications" />} />

      {/* Redirect wildcards */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
