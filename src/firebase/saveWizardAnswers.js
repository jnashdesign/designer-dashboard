import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

export const saveWizardAnswers = async (projectId, answers, type, clientId) => {
  if (!projectId || !type) {
    throw new Error('Missing projectId or type');
  }

  return await addDoc(collection(db, 'creativeBriefs'), {
    projectId: projectId,
    clientId: clientId || null,
    type,
    answers,
    createdAt: serverTimestamp()
  });
};