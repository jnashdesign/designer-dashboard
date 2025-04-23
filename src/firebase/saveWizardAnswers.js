import { collection, addDoc, doc } from 'firebase/firestore';
import { db } from './config';

export const saveWizardAnswers = async (projectId, answers, type) => {
  if (!projectId || !type) {
    throw new Error('Missing projectId or type');
  }

  return await addDoc(collection(db, 'creativeBriefs'), {
    projectId: doc(db, 'projects', projectId),
    type,
    answers,
    createdAt: new Date()
  });
};