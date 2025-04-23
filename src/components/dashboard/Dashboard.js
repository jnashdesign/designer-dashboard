import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase/config";
import { collection, query, where, getDocs, doc } from "firebase/firestore";
import { addProject } from "../../firebase/addProject";
import { addClient } from "../../firebase/addClient";
import SubmissionViewer from "./SubmissionViewer";
import Modal from "./Modal";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [briefs, setBriefs] = useState({});
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBriefId, setActiveBriefId] = useState(null);

  const [showAddClientForm, setShowAddClientForm] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  const [showAddProjectForm, setShowAddProjectForm] = useState(false);
  const [projectClientId, setProjectClientId] = useState("");
  const [projectType, setProjectType] = useState("branding");

  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;

    const designerRef = doc(db, "users", user.uid);

    const projectQuery = query(
      collection(db, "projects"),
      where("designerId", "==", designerRef)
    );
    const projectSnapshot = await getDocs(projectQuery);
    const projectsList = projectSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setProjects(projectsList);

    const briefsSnapshot = await getDocs(collection(db, "creativeBriefs"));
    const subs = {};
    briefsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const pid = data.projectId.id;
      subs[pid] = { ...data, briefId: doc.id };
    });
    setBriefs(subs);

    const clientsSnapshot = await getDocs(collection(db, "clients"));
    const clientsList = clientsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setClients(clientsList);

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getClientNameByRef = (clientRef) => {
    const id = clientRef?.id;
    const client = clients.find((c) => c.id === id);
    return client ? client.name : "Unknown Client";
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container">
      <h2>Designer Dashboard</h2>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <button onClick={() => setShowAddClientForm(!showAddClientForm)}>
          {showAddClientForm ? "Cancel Add Client" : "Add Client"}
        </button>
        <button onClick={() => setShowAddProjectForm(!showAddProjectForm)}>
          {showAddProjectForm ? "Cancel Add Project" : "Add Project"}
        </button>
      </div>

      <h3>Your Projects</h3>
      {projects.length === 0 ? (
        <p>No projects yet.</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          {projects.map((project) => (
            <div
              key={project.id}
              style={{
                border: "1px solid #ccc",
                padding: "1rem",
                borderRadius: "8px",
                width: "300px",
                background: "#fafafa",
              }}>
              <strong>{project.type}</strong> – <em>{project.status}</em>
              <p style={{ margin: "0.5rem 0" }}>
                <small>Client: {getClientNameByRef(project.clientId)}</small>
              </p>
              {briefs[project.id] ? (
                <>
                  <p>
                    <small>
                      <strong>Brief Type:</strong> {briefs[project.id].type}
                    </small>
                  </p>
                  <button onClick={() => setActiveBriefId(project.id)}>
                    View Creative Brief
                  </button>
                </>
              ) : (
                <p style={{ color: "gray" }}>No submission yet</p>
              )}
              {project.type === "branding" && (
                <button
                  onClick={() =>
                    navigate(`/onboarding/branding/${project.id}/step1`)
                  }>
                  Start Creative Brief
                </button>
              )}
              {project.type === "website" && (
                <button
                  onClick={() =>
                    navigate(`/onboarding/website/${project.id}/step1`)
                  }>
                  Start Creative Brief
                </button>
              )}
              {project.type === "app" && (
                <button
                  onClick={() =>
                    navigate(`/onboarding/app/${project.id}/step1`)
                  }>
                  Start Creative Brief
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!activeBriefId} onClose={() => setActiveBriefId(null)}>
        {activeBriefId && briefs[activeBriefId] && (
          <SubmissionViewer
            answers={briefs[activeBriefId].answers}
            projectId={activeBriefId}
            briefId={briefs[activeBriefId].briefId}
          />
        )}
      </Modal>
    </div>
  );
}
