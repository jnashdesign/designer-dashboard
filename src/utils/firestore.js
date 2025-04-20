import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const saveFormToFirestore = async (formData) => {
  try {
    const docRef = await addDoc(collection(db, 'brandingForms'), formData);
    return docRef.id;
  } catch (e) {
    console.error('Error saving to Firestore: ', e);
  }
};