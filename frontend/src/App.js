import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Project from './components/project';
import ProjectManager from './components/ProjectManager';
import Layout from './components/layout';
import About from './components/about';
import Contact from './components/contact';
import Homeinfo from './components/homeinfo';
import Event from './components/event';
import LoginForm from './components/LoginForm';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import RegistrationForm from './components/RegistrationForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import ChangePasswordPage from './components/ChangePasswordPage';
import Privacy from './components/Privacy';
import Terms from './components/Terms';

import Blog from './components/Blog';
import BlogPost from './components/BlogPost';
import BlogManager from './components/BlogManager';
import EventDetail from './components/EventDetail';
import ProjectDetail from './components/ProjectDetail';
import ErrorPage from './components/ErrorPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import PendingApproval from './components/PendingApproval';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Homeinfo/>} />
          <Route path="about" element={<About />} />
          <Route path="event" element={<Event />} />
          <Route path="event/:id" element={<EventDetail />} />
          <Route path="contact" element={<Contact />} />
          <Route path="project" element={<Project />} />
          <Route path="project/:id" element={<ProjectDetail />} />
          <Route path="projects/manage" element={
            <ProtectedRoute>
              <ProjectManager />
            </ProtectedRoute>
          } />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:id" element={<BlogPost />} />
          <Route path="blog/manage" element={
            <ProtectedRoute>
              <BlogManager />
            </ProtectedRoute>
          } />
          <Route path="login" element={<LoginForm />} />
          <Route path="pending-approval" element={<PendingApproval />} />
          <Route path="dashboard" element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path="admin" element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            </ProtectedRoute>
          } />
          <Route path="register" element={<RegistrationForm />} />
          <Route path="forgot-password" element={<ForgotPasswordForm />} />
          <Route path="change-password" element={<ChangePasswordPage />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />

          <Route path="*" element={<ErrorPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
