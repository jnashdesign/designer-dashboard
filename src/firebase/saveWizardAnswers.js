import { collection, addDoc, doc } from 'firebase/firestore';
import { db } from './config';

export const saveWizardAnswers = async (projectId, answers) => {
  if (!projectId) {
    throw new Error('Project ID is required to save wizard answers');
  }

  return await addDoc(collection(db, 'submissions'), {
    projectId: doc(db, 'projects', projectId),
    wizardAnswers: answers,
    createdAt: new Date()
  });
};
