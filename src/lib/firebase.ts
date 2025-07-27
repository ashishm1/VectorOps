
import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
    try {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
        });
        console.log("Firebase Admin SDK initialized successfully.");
    } catch (error) {
        console.error("Firebase Admin initialization error:", error);
    }
}

export const db = getFirestore();
