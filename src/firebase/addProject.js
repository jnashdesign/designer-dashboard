import { collection, addDoc, doc } from "firebase/firestore";
import { db } from "./config";

export const addProject = async (clientId, designerId, type = "branding") => {
  try {
    const projectRef = await addDoc(collection(db, "projects"), {
      clientId: doc(db, "clients", clientId),
      designerId: doc(db, "users", designerId),
      type,
      status: "in-progress",
      createdAt: new Date()
    });
    return projectRef.id;
  } catch (error) {
    console.error("Error adding project:", error);
    throw error;
  }
};