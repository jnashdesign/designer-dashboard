// App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './components/shared/Welcome';
import Dashboard from './components/dashboard/Dashboard';
import ProjectView from './components/dashboard/ProjectView';
import WizardRunner from './components/wizards/WizardRunner';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects/:id" element={<ProjectView />} />
        <Route path="/onboarding/:type/*" element={<WizardRunner />} />
      </Routes>
    </Router>
  );
}

export default App;
