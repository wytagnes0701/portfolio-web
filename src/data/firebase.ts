import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getDatabase, type Database } from 'firebase/database'
import { getRemoteConfig, type RemoteConfig } from 'firebase/remote-config'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

export type FirebaseClients = {
  app: FirebaseApp
  auth: Auth
  database: Database
  storage: FirebaseStorage
  remoteConfig: RemoteConfig
}

function readConfig() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  }
}

export function isFirebaseConfigured() {
  const config = readConfig()
  return Boolean(config.apiKey && config.projectId && config.databaseURL && config.appId)
}

let clients: FirebaseClients | null = null

export function getFirebase(): FirebaseClients {
  if (clients) return clients
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase web config is missing')
  }
  const app = initializeApp(readConfig())
  const remoteConfig = getRemoteConfig(app)
  remoteConfig.settings.minimumFetchIntervalMillis = 0
  remoteConfig.defaultConfig = {
    master_login: '',
    master_account_info: '',
  }
  clients = {
    app,
    auth: getAuth(app),
    database: getDatabase(app, readConfig().databaseURL),
    storage: getStorage(app),
    remoteConfig,
  }
  return clients
}
