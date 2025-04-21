import { collection, addDoc, doc } from 'firebase/firestore';
import { db } from './config';

export const saveWizardAnswers = async (projectId, answers) => {
  try {
    const ref = await addDoc(collection(db, 'submissions'), {
      projectId: doc(db, 'projects', projectId),
      wizardAnswers: answers,
      createdAt: new Date()
    });
    return ref.id;
  } catch (err) {
    console.error("Error saving wizard answers:", err);
    throw err;
  }
};