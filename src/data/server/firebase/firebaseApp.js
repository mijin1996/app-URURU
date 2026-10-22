/* =========================================================
   [Data] firebase/firebaseApp.js — Firebase 연결 (한 번만 만들어서 같이 써요)
   ---------------------------------------------------------
   설정값은 .env의 VITE_FIREBASE_* 에서 읽어요 (코드에 키를 적지 않기, tech-stack 2번).
   VITE_FIREBASE_EMULATOR=true 이면 내 컴퓨터 안의 가짜 Firebase(에뮬레이터)에 붙어요.
   이 파일은 RealServer가 필요할 때만 불러와서(import()), 시연 모드에서는 Firebase를 아예 안 읽어요.
   ========================================================= */

import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { connectStorageEmulator, getStorage } from "firebase/storage";

const REGION = "asia-northeast3";   // 서울 (functions/index.js와 같아야 해요)
const EMULATOR_HOST = "127.0.0.1";
const EMULATOR_PORTS = { auth: 9099, firestore: 8080, functions: 5001, storage: 9199 };   // firebase.json과 같게

// appName: 운영자 사이트는 "admin"으로 따로 만들어서, 같은 브라우저라도 앱 로그인과 섞이지 않게 해요
export function createFirebase(env, appName = undefined)
{
  const app = initializeApp({
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID
  }, appName);
  const auth = getAuth(app);
  // 오프라인 저장: 인터넷이 끊겨도 보낸 메시지를 기억했다가 다시 연결되면 보내요 (D7, SYNC-03)
  const db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
  const storage = getStorage(app);
  const functions = getFunctions(app, REGION);
  if (env.VITE_FIREBASE_EMULATOR === "true")
  {
    connectAuthEmulator(auth, `http://${EMULATOR_HOST}:${EMULATOR_PORTS.auth}`, { disableWarnings: true });
    connectFirestoreEmulator(db, EMULATOR_HOST, EMULATOR_PORTS.firestore);
    connectStorageEmulator(storage, EMULATOR_HOST, EMULATOR_PORTS.storage);
    connectFunctionsEmulator(functions, EMULATOR_HOST, EMULATOR_PORTS.functions);
  }
  return { app, auth, db, storage, functions };
}
