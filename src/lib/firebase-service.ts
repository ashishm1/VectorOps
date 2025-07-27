
'use server';

import * as admin from 'firebase-admin';
import { db } from './firebase'; // Ensures admin is initialized

// This file is intended for server-side Firebase operations that might be shared across flows.
// For now, it's empty as sendFcmNotification has been moved to its specific flow.

