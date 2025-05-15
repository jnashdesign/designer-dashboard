import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from './context/ThemeContext';
import '../src/bootstrap.min.css';

import Dashboard from "./components/dashboard/Dashboard";
import WizardRunner from "./components/wizards/WizardRunner";
import Welcome from "./components/shared/Welcome";
import Layout from "./components/layout/Layout";
import ClientDashboard from "./components/dashboard/ClientDashboard";
import RequireAuth from "./components/auth/RequireAuth";

import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import EditQuestions from './pages/EditQuestions';
import TemplateChooser from './pages/TemplateChooser';
import StartProjectLoader from './pages/StartProjectLoader';
import ViewBrief from './pages/ViewBrief';
import QuestionnaireBuilder from './pages/QuestionnaireBuilder';
import QuestionnaireEditor from './pages/QuestionnaireEditor';
import AssetRepository from './components/brand/AssetRepository';
import AllAssets from './pages/AllAssets';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/signup" element={
            <Layout>
            <SignupPage />
          </Layout>
          } />

          <Route path="/login" element={
            <Layout>
            <LoginPage />
            </Layout>
          } />

          <Route
            path="/dashboard"
            element={
              <RequireAuth role="designer">
                <Layout>
                  <Dashboard />
                </Layout>
              </RequireAuth>
            } />

          <Route
            path="/client-dashboard"
            element={
              <RequireAuth role="client">
                <Layout>
                  <ClientDashboard />
                </Layout>
              </RequireAuth>
            } />

          <Route
            path="/onboarding/:type/:projectId/*"
            element={
              <RequireAuth role="designer">
              <Layout>
                <WizardRunner />
                </Layout>
              </RequireAuth>
            } 
          />

          <Route path="/edit-questions" element={
            <RequireAuth role="designer">
              <Layout>
                <EditQuestions />
              </Layout>
            </RequireAuth>
            }
          />

          <Route path="/choose-template/:type" element={
            <RequireAuth role="designer">
              <Layout>
                <TemplateChooser /> 
              </Layout>
            </RequireAuth>
          } />

          <Route path="/start-project/:type/:templateId" element={
            <RequireAuth role="designer">
              <Layout>
                <StartProjectLoader /> 
              </Layout>
            </RequireAuth>
          } />

          <Route path="/view-brief/:briefId" element={<ViewBrief />} />

          <Route path="/dashboard/create-draft" element={
            <RequireAuth role="designer">
              <Layout>
                <QuestionnaireBuilder /> 
              </Layout>
            </RequireAuth>
          } />

          <Route path="/template/:templateId/edit" element={
            <RequireAuth role="designer">
              <Layout>
                <QuestionnaireEditor />
              </Layout>
            </RequireAuth>
          } />

          <Route path="/template/create/:type" element={
            <RequireAuth role="designer">
              <Layout>
                <QuestionnaireEditor />
              </Layout>
            </RequireAuth>
          } />

          <Route path="/wizard/:type/:templateId" element={
            <RequireAuth>
              <Layout>
                <WizardRunner />
              </Layout>
            </RequireAuth>
          } />

          <Route path="/project/:projectId/assets" element={
            <RequireAuth role="designer">
              <Layout>
                <AssetRepository />
              </Layout>
            </RequireAuth>
          } />

          <Route path="/my-assets" element={
            <RequireAuth role="designer">
            <Layout>
            <AllAssets />
            </Layout>
          </RequireAuth>} />
          
        </Routes>      
      </Router>
    </ThemeProvider>
  );
}

export default App;
