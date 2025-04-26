import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ViewBrief() {
  const { briefId } = useParams();
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBrief = async () => {
      try {
        const briefRef = doc(db, 'creativeBriefs', briefId);
        const briefSnap = await getDoc(briefRef);

        if (briefSnap.exists()) {
          setBrief(briefSnap.data());
        } else {
          throw new Error('Brief not found.');
        }
      } catch (err) {
        console.error('Error loading brief:', err);
        setError('Failed to load brief.');
      } finally {
        setLoading(false);
      }
    };

    fetchBrief();
  }, [briefId]);

  if (loading) return <LoadingSpinner message="Fetching brief details..." />;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  const { type, createdAt, answers } = brief;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>← Back</button>
      <h2>{type?.charAt(0).toUpperCase() + type?.slice(1)} Brief</h2>
      <p style={{ fontStyle: 'italic', marginBottom: '2rem' }}>
        Created: {createdAt?.toDate?.().toLocaleDateString()}
      </p>
      {answers ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Object.entries(answers).map(([qid, answer]) => (
            <div key={qid} style={{ borderBottom: '1px solid #ddd', paddingBottom: '0.5rem' }}>
              <strong>Question ID: {qid}</strong>
              <p>Answer: {answer}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No answers recorded.</p>
      )}
    </div>
  );
}