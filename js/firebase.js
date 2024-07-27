// Import the functions you need from the SDKs you need
import * as appFirebaseOrigiginal from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import * as authFirebaseOriginal from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import * as firestoreFirebaseOriginal from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import * as analyticsFirebaseOriginal from "https://www.gstatic.com/firebasejs/10.12.4/firebase-analytics.js";
import * as storageFirebaseOriginal from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: "",
};

// Initialize Firebase
const appModule = appFirebaseOrigiginal;
const authModule = authFirebaseOriginal;
const firestoreModule = firestoreFirebaseOriginal;
const analyticsModule = analyticsFirebaseOriginal;
const storageModule = storageFirebaseOriginal;

const app = appModule.initializeApp(firebaseConfig);
const auth = authModule.getAuth(app);
const firestore = firestoreModule.getFirestore(app);
const analytics = analyticsModule.getAnalytics(app);
const storage = storageModule.getStorage(app);

export {
  app,
  auth,
  firestore,
  analytics,
  storage,
  appModule,
  authModule,
  firestoreModule,
  analyticsModule,
  storageModule,
};
