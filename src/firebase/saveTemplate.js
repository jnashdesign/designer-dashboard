import { db } from './config';
import { auth } from './config';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Save a custom questionnaire template for the current user.
 * @param {object} templateData - The template object to save (name, type, groups, createdAt)
 */
export const saveTemplateToFirestore = async (templateData) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No authenticated user found.");
  }

  const templateId = `template-${Date.now()}`;
  const templateRef = doc(db, "users", user.uid, "questionnaireTemplates", templateId);
  const data = {
    ...templateData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  await setDoc(templateRef, data);
  return templateId;
};