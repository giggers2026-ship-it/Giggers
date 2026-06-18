import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';

// Public Pages
import Landing from './pages/Landing';
import Welcome from './pages/auth/Welcome';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import OtpVerify from './pages/auth/OtpVerify';


// Unified Pages
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import PostJob from './pages/PostJob';
import Profile from './pages/Profile';

// Shared Pages
import ChatList from './pages/shared/ChatList';
import ChatThread from './pages/shared/ChatThread';
import Wallet from './pages/shared/Wallet';
import Notifications from './pages/shared/Notifications';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page completely outside AppShell so it takes full screen width */}
        <Route path="/" element={<Landing />} />

        <Route element={<AppShell />}>
          {/* Public Routes */}
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/otp" element={<OtpVerify />} />


          {/* Unified Authenticated Routes */}
          <Route path="/home" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/post-job" element={<PostJob />} />
          <Route path="/profile" element={<Profile />} />

          {/* Shared Routes */}
          <Route path="/chat" element={<ChatList />} />
          <Route path="/chat/:id" element={<ChatThread />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/notifications" element={<Notifications />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
