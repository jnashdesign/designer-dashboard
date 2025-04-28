import { db } from './config';
import { auth } from './config';
import { collection, getDocs, query, where } from 'firebase/firestore';

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

  // Create path to the subcollection directly
  const templatesRef = collection(db, "users", user.uid, "questionnaireTemplates");
  const q = query(templatesRef, where("type", "==", type));

  try {
    const snapshot = await getDocs(q);
    console.log(`Found ${snapshot.docs.length} templates`); // Debug log
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
  } catch (error) {
    console.error("Error loading templates:", error);
    throw error;
  }
};