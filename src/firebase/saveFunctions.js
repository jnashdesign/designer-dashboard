
// saveFunctions.js
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const db = getFirestore();
const auth = getAuth();

export async function createProject(clientId, type = "branding", status = "in-progress") {
  const authUser = auth.currentUser;
  await addDoc(collection(db, "projects"), {
    clientId: clientId,
    designerId: authUser.uid,
    type,
    status,
    createdAt: serverTimestamp()
  });
}

export async function createClient(name, email) {
  const authUser = auth.currentUser;
  await addDoc(collection(db, "clients"), {
    name,
    email,
    designerId: authUser.uid,
    createdAt: serverTimestamp()
  });
}

export async function createCreativeBrief(projectId, answers) {
  await addDoc(collection(db, "creativeBriefs"), {
    projectId: projectId,
    answers: answers,
    createdAt: serverTimestamp()
  });
}
