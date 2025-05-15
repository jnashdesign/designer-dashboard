import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import '../bootstrap.min.css';

export default function ViewBrief() {
  const { briefId } = useParams();
  const navigate = useNavigate();
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBrief = async () => {
      setLoading(true);
      setError(null);
      try {
        const briefRef = doc(db, 'creativeBriefs', briefId);
        const briefSnap = await getDoc(briefRef);
        if (briefSnap.exists()) {
          setBrief({ id: briefSnap.id, ...briefSnap.data() });
        } else {
          setError('Brief not found.');
        }
      } catch (err) {
        setError('Error loading brief.');
      } finally {
        setLoading(false);
      }
    };
    fetchBrief();
  }, [briefId]);

  if (loading) return <div className="p-4">Loading brief...</div>;
  if (error) return <div className="p-4 text-danger">{error}</div>;
  if (!brief) return null;

  return (
    <div className="container py-4">
      <button className="btn btn-secondary mb-4" onClick={() => navigate(-1)}>&larr; Back</button>
      <h2 className="mb-3">{brief.type?.charAt(0).toUpperCase() + brief.type?.slice(1)} Brief</h2>
      <p className="text-muted mb-4">Created: {brief.createdAt?.toDate?.() ? brief.createdAt.toDate().toLocaleDateString() : ''}</p>
      {brief.answers ? (
        <div className="card p-4">
          {Object.entries(brief.answers).map(([qid, answerObj]) => (
            <div key={qid} className="mb-3 border-bottom pb-2">
              <p className="fw-bold mb-1">Q: {answerObj?.questionText || 'Unknown Question'}</p>
              <p className="mb-0" style={{ color: answerObj?.answerText ? '#333' : '#888', fontStyle: answerObj?.answerText ? 'normal' : 'italic' }}>
                {answerObj?.answerText || '(No answer provided)'}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p>No answers available.</p>
      )}
    </div>
  );
} 