import { db } from './config';
import { auth } from './config';
import { collection, getDocs, query, where, doc } from 'firebase/firestore';

/**
 * Load templates for the current user filtered by project type.
 * @param {string} type - branding, website, or app
 * @returns {Promise<Array>} Array of templates
 */
export const loadTemplatesByType = async (type) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No authenticated user found.");
  }

  const templatesRef = collection(doc(db, "users", user.uid), "questionnaireTemplates");
  const q = query(templatesRef, where("type", "==", type));

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};