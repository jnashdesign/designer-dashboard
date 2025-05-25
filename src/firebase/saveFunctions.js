// saveFunctions.js
import { getFirestore, collection, addDoc, serverTimestamp, doc, getDoc, query, where, getDocs } from "firebase/firestore";
import { getAuth, fetchSignInMethodsForEmail } from "firebase/auth";

const db = getFirestore();
const auth = getAuth();

export async function createProject(clientId, name, type = "branding", status = "in-progress", description = "") {
  const authUser = auth.currentUser;
  
  // Get client's email and name from the clients collection
  const clientRef = doc(db, "clients", clientId);
  const clientDoc = await getDoc(clientRef);
  const clientEmail = clientDoc.exists() ? clientDoc.data().email : null;
  const clientName = clientDoc.exists() ? clientDoc.data().name : null;

  // Get designer's name from the users collection
  const designerRef = doc(db, "users", authUser.uid);
  const designerDoc = await getDoc(designerRef);
  const designerName = designerDoc.exists() ? designerDoc.data().name : null;

  await addDoc(collection(db, "projects"), {
    clientId: clientId,
    clientEmail: clientEmail,
    clientName: clientName,
    designerId: authUser.uid,
    designerName: designerName,
    name,
    type,
    status,
    description,
    createdAt: serverTimestamp()
  });
}

export async function createClient(name, email) {
  const authUser = auth.currentUser;
  
  // Check if user exists in auth
  const signInMethods = await fetchSignInMethodsForEmail(auth, email);
  let photoURL = null;
  
  if (signInMethods.length > 0) {
    // User exists in auth, get their profile data
    // First get their UID by querying the users collection
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      photoURL = userData.photoURL;
    }
  }

  await addDoc(collection(db, "clients"), {
    name,
    email,
    designerId: authUser.uid,
    photoURL: photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
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
