import { db } from './config';
import { auth } from './config';
import { collection, addDoc, doc } from 'firebase/firestore';

/**
 * Save a completed creative brief.
 * @param {string} projectId - The project ID to link the brief to.
 * @param {string} type - Type of project (branding, website, app).
 * @param {object} answers - Answer object keyed by question ID.
 */
export const saveCreativeBrief = async (projectId, type, answers) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No authenticated user.");
  }

  const briefsRef = collection(db, "creativeBriefs");

  await addDoc(briefsRef, {
    projectId: doc(db, "projects", projectId),
    type,
    answers,
    createdAt: new Date()
  });
};