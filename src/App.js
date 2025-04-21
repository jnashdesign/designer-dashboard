import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from "./components/dashboard/Dashboard";
import WizardRunner from "./components/wizards/WizardRunner";
import Welcome from "./components/shared/Welcome";
import Layout from "./components/layout/Layout";
import ClientDashboard from "./components/dashboard/ClientDashboard";
import RequireAuth from "./components/auth/RequireAuth";

import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <RequireAuth role="designer">
              <Layout>
                <Dashboard />
              </Layout>
            </RequireAuth>
          }
        />

        <Route
          path="/client-dashboard"
          element={
            <RequireAuth role="client">
              <Layout>
                <ClientDashboard />
              </Layout>
            </RequireAuth>
          }
        />

        <Route
          path="/onboarding/:type/*"
          element={
            <RequireAuth>
              <Layout>
                <WizardRunner />
              </Layout>
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
