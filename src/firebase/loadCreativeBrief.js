
// loadCreativeBrief.js

import { getFirestore, doc, getDoc } from "firebase/firestore";

const db = getFirestore();

/**
 * Load a Creative Brief by its ID.
 * Anyone with the ID can read.
 * Only the linked project owner can edit.
 *
 * @param {string} briefId
 * @returns {Promise<object|null>} The brief data, or null if not found
 */
export async function loadCreativeBrief(briefId) {
  try {
    const briefRef = doc(db, "creativeBriefs", briefId);
    const briefSnap = await getDoc(briefRef);

    if (briefSnap.exists()) {
      return briefSnap.data();
    } else {
      console.warn("Creative Brief not found:", briefId);
      return null;
    }
  } catch (error) {
    console.error("Error loading Creative Brief:", error);
    return null;
  }
}
