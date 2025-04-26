import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import defaultQuestions from '../data/defaultQuestions.json';
import DynamicWizard from '../components/wizards/DynamicWizard';

export default function StartProjectLoader() {
  const { type, templateId } = useParams(); // ex: branding / abc123
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        if (templateId === "default") {
          setQuestions(defaultQuestions[type] || []);
        } else {
          const user = auth.currentUser;
          if (!user) throw new Error("No user authenticated.");
          const templateRef = doc(db, "users", user.uid, "questionnaireTemplates", templateId);
          const templateSnap = await getDoc(templateRef);
          if (!templateSnap.exists()) {
            throw new Error("Template not found.");
          }
          const data = templateSnap.data();
          const groupedQuestions = data.groups.flatMap(g => g.questions);
          setQuestions(groupedQuestions);
        }
      } catch (err) {
        console.error("Error loading project:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [type, templateId]);

  if (loading) return <p>Loading brief...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <DynamicWizard initialQuestions={questions} />
    </div>
  );
}