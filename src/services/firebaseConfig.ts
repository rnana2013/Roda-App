import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyA0iI4Zf9qgsneKvIp-1xq1fYkZnrXTiq4",
  authDomain: "pit-stop-app-b606e.firebaseapp.com",
  projectId: "pit-stop-app-b606e",
  storageBucket: "pit-stop-app-b606e.firebasestorage.app",
  messagingSenderId: "352665731759",
  appId: "1:352665731759:web:d011a6a68befd41fb3ca5a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
