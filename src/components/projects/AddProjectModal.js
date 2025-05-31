import React, { useState } from 'react';
import { auth, db } from '../../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { createClient, createProject } from '../../firebase/saveFunctions';

export default function AddProjectModal({ show, onHide, onProjectCreated, clients }) {
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [isAddingNewClient, setIsAddingNewClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      let clientId = selectedClient;

      if (isAddingNewClient) {
        if (!newClientName || !newClientEmail || !newProjectName) {
          alert('Please fill in all required fields');
          setIsSubmitting(false);
          return;
        }

        // Create the client first
        await createClient(newClientName, newClientEmail);
        
        // Fetch the new client ID
        const user = auth.currentUser;
        const clientQuery = query(
          collection(db, 'clients'),
          where('designerId', '==', user.uid),
          where('email', '==', newClientEmail)
        );
        const snapshot = await getDocs(clientQuery);
        
        if (snapshot.empty) {
          throw new Error('Failed to create client');
        }
        
        clientId = snapshot.docs[0].id;
      } else {
        if (!selectedClient || !newProjectName) {
          alert('Please fill in all required fields');
          setIsSubmitting(false);
          return;
        }
      }

      // Create the project with the client ID
      await createProject(clientId, newProjectName, 'branding', 'in-progress', newProjectDescription);
      resetForm();
      if (onProjectCreated) onProjectCreated();
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewProjectName('');
    setNewProjectDescription('');
    setSelectedClient('');
    setNewClientName('');
    setNewClientEmail('');
    setIsAddingNewClient(false);
    onHide();
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add New Project</h5>
            <button type="button" className="btn-close" onClick={resetForm}></button>
          </div>
          <form onSubmit={handleAddProject}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Project Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  rows={2}
                  placeholder="Describe this project (optional)"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Client</label>
                <select 
                  className="form-select"
                  value={selectedClient}
                  onChange={(e) => {
                    if (e.target.value === 'new') {
                      setIsAddingNewClient(true);
                      setSelectedClient('');
                    } else {
                      setSelectedClient(e.target.value);
                      setIsAddingNewClient(false);
                    }
                  }}
                  required={!isAddingNewClient}
                >
                  <option value="">Select a client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                  <option value="new">+ Add New Client</option>
                </select>
              </div>
              {isAddingNewClient && (
                <>
                  <div className="mb-3">
                    <label className="form-label">Client Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newClientName}
                      onChange={e => setNewClientName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Client Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={newClientEmail}
                      onChange={e => setNewClientEmail(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Add Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 