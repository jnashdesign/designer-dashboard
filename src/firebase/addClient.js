import { collection, addDoc, doc } from "firebase/firestore";
import { db } from "./config";

export const addClient = async (name, email, designerId) => {
  try {
    const clientRef = await addDoc(collection(db, "clients"), {
      name,
      email,
      designerId: doc(db, "users", designerId)
    });
    return clientRef.id;
  } catch (error) {
    console.error("Error adding client:", error);
    throw error;
  }
};