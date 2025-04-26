import { db } from './config';
import { auth } from './config';
import { collection, addDoc, doc } from 'firebase/firestore';

/**
 * Save a custom questionnaire template for the current user.
 * @param {object} templateData - The template object to save (name, type, groups, createdAt)
 */
export const saveTemplateToFirestore = async (templateData) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No authenticated user found.");
  }

  const templatesCollection = collection(doc(db, "users", user.uid), "questionnaireTemplates");

  await addDoc(templatesCollection, templateData);
};