
// migrateTestData.js
import { getFirestore, collection, getDocs, updateDoc } from "firebase/firestore";

const db = getFirestore();

export async function migrateProjects() {
  const projectsRef = collection(db, "projects");
  const snapshot = await getDocs(projectsRef);

  for (const project of snapshot.docs) {
    const data = project.data();
    if (typeof data.designerId !== "string") {
      await updateDoc(project.ref, {
        designerId: data.designerId.id,
        clientId: data.clientId.id
      });
      console.log(`Updated project ${project.id}`);
    }
  }
}

export async function migrateClients() {
  const clientsRef = collection(db, "clients");
  const snapshot = await getDocs(clientsRef);

  for (const client of snapshot.docs) {
    const data = client.data();
    if (typeof data.designerId !== "string") {
      await updateDoc(client.ref, {
        designerId: data.designerId.id
      });
      console.log(`Updated client ${client.id}`);
    }
  }
}

export async function migrateCreativeBriefs() {
  const briefsRef = collection(db, "creativeBriefs");
  const snapshot = await getDocs(briefsRef);

  for (const brief of snapshot.docs) {
    const data = brief.data();
    if (typeof data.projectId !== "string") {
      await updateDoc(brief.ref, {
        projectId: data.projectId.id
      });
      console.log(`Updated brief ${brief.id}`);
    }
  }
}
