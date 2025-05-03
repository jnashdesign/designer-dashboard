import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import '../../bootstrap.min.css';
import { Modal } from 'react-bootstrap';

export default function ProjectView() {
  const { id } = useParams();
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showNewQuestionnaire, setShowNewQuestionnaire] = useState(false);

  return (
    <div className="container">
      <h2>Project View - {id}</h2>
      <p>Project details, client briefs, and design comps will go here.</p>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Dashboard</h2>
        <div>
          <button 
            className="btn btn-primary me-2" 
            onClick={() => setShowAddClient(true)}
          >
            Add Client
          </button>
          <button 
            className="btn btn-primary me-2" 
            onClick={() => setShowAddProject(true)}
          >
            Add Project
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowNewQuestionnaire(true)}
          >
            Create New Questionnaire
          </button>
        </div>
      </div>

      {/* Add Client Modal */}
      <Modal show={showAddClient} onHide={() => setShowAddClient(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Client</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleAddClient}>
            <div className="mb-3">
              <label className="form-label">Client Name</label>
              <input
                type="text"
                className="form-control"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Client Email</label>
              <input
                type="email"
                className="form-control"
                value={newClientEmail}
                onChange={(e) => setNewClientEmail(e.target.value)}
                required
              />
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowAddClient(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
              >
                Add Client
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Add Project Modal */}
      <Modal show={showAddProject} onHide={() => setShowAddProject(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Project</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleAddProject}>
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
              <label className="form-label">Client</label>
              <select 
                className="form-select"
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                required
              >
                <option value="">Select a client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowAddProject(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
              >
                Add Project
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Create New Questionnaire Modal */}
      <Modal show={showNewQuestionnaire} onHide={() => setShowNewQuestionnaire(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Questionnaire</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <h5>What type of questionnaire do you want to create?</h5>
            <div className="d-grid gap-2">
              <button 
                className="btn btn-outline-primary"
                onClick={() => navigate('/choose-template/website')}
              >
                Website Questionnaire
              </button>
              <button 
                className="btn btn-outline-primary"
                onClick={() => navigate('/choose-template/app')}
              >
                App Questionnaire
              </button>
              <button 
                className="btn btn-outline-primary"
                onClick={() => navigate('/choose-template/branding')}
              >
                Branding Questionnaire
              </button>
            </div>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setShowNewQuestionnaire(false)}
            >
              Cancel
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}