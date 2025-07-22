/**
 * Firestore Database Schema for TV Editor Finder
 * 
 * This file documents the database structure and provides helper functions
 * for interacting with the Firestore collections.
 */

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from './firebase';
import { Editor, Credit, Award } from '@/types';

/**
 * Collection Names
 */
export const COLLECTIONS = {
  EDITORS: 'editors',
  SEARCHES: 'searches',
  ANALYTICS: 'analytics'
} as const;

/**
 * Subcollection Names
 */
export const SUBCOLLECTIONS = {
  CREDITS: 'credits',
  AWARDS: 'awards'
} as const;

/**
 * Firestore Security Rules (to be applied in Firebase Console)
 * 
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     // Public read access to editors
 *     match /editors/{editorId} {
 *       allow read: if true;
 *       allow write: if request.auth != null && request.auth.token.admin == true;
 *       
 *       // Subcollections
 *       match /credits/{creditId} {
 *         allow read: if true;
 *         allow write: if request.auth != null && request.auth.token.admin == true;
 *       }
 *       
 *       match /awards/{awardId} {
 *         allow read: if true;
 *         allow write: if request.auth != null && request.auth.token.admin == true;
 *       }
 *     }
 *     
 *     // Search analytics (write-only for logged users)
 *     match /searches/{searchId} {
 *       allow read: if false;
 *       allow create: if true;
 *     }
 *     
 *     // Admin-only analytics
 *     match /analytics/{document=**} {
 *       allow read, write: if request.auth != null && request.auth.token.admin == true;
 *     }
 *   }
 * }
 */

/**
 * Database Helper Functions
 */

// Editors Collection
export const editorsCollection = () => collection(db, COLLECTIONS.EDITORS);

export const getEditor = async (editorId: string): Promise<Editor | null> => {
  try {
    const docRef = doc(db, COLLECTIONS.EDITORS, editorId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        metadata: {
          ...data.metadata,
          createdAt: data.metadata.createdAt?.toDate(),
          updatedAt: data.metadata.updatedAt?.toDate(),
        }
      } as Editor;
    }
    return null;
  } catch (error) {
    console.error('Error getting editor:', error);
    return null;
  }
};

export const addEditor = async (editorData: Omit<Editor, 'id'>): Promise<string | null> => {
  try {
    const docRef = await addDoc(editorsCollection(), {
      ...editorData,
      metadata: {
        ...editorData.metadata,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding editor:', error);
    return null;
  }
};

export const updateEditor = async (editorId: string, updates: Partial<Editor>): Promise<boolean> => {
  try {
    const docRef = doc(db, COLLECTIONS.EDITORS, editorId);
    await updateDoc(docRef, {
      ...updates,
      'metadata.updatedAt': new Date()
    });
    return true;
  } catch (error) {
    console.error('Error updating editor:', error);
    return false;
  }
};

// Credits Subcollection
export const getEditorCredits = async (editorId: string): Promise<Credit[]> => {
  try {
    const creditsRef = collection(db, COLLECTIONS.EDITORS, editorId, SUBCOLLECTIONS.CREDITS);
    const creditsQuery = query(creditsRef, orderBy('timeline.startYear', 'desc'));
    const snapshot = await getDocs(creditsQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      metadata: {
        ...doc.data().metadata,
        createdAt: doc.data().metadata.createdAt?.toDate(),
        updatedAt: doc.data().metadata.updatedAt?.toDate(),
      }
    } as Credit));
  } catch (error) {
    console.error('Error getting editor credits:', error);
    return [];
  }
};

export const addEditorCredit = async (editorId: string, creditData: Omit<Credit, 'id' | 'editorId'>): Promise<string | null> => {
  try {
    const creditsRef = collection(db, COLLECTIONS.EDITORS, editorId, SUBCOLLECTIONS.CREDITS);
    const docRef = await addDoc(creditsRef, {
      ...creditData,
      editorId,
      metadata: {
        ...creditData.metadata,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding editor credit:', error);
    return null;
  }
};

// Awards Subcollection
export const getEditorAwards = async (editorId: string): Promise<Award[]> => {
  try {
    const awardsRef = collection(db, COLLECTIONS.EDITORS, editorId, SUBCOLLECTIONS.AWARDS);
    const awardsQuery = query(awardsRef, orderBy('award.year', 'desc'));
    const snapshot = await getDocs(awardsQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      metadata: {
        ...doc.data().metadata,
        createdAt: doc.data().metadata.createdAt?.toDate(),
        updatedAt: doc.data().metadata.updatedAt?.toDate(),
      }
    } as Award));
  } catch (error) {
    console.error('Error getting editor awards:', error);
    return [];
  }
};

export const addEditorAward = async (editorId: string, awardData: Omit<Award, 'id' | 'editorId'>): Promise<string | null> => {
  try {
    const awardsRef = collection(db, COLLECTIONS.EDITORS, editorId, SUBCOLLECTIONS.AWARDS);
    const docRef = await addDoc(awardsRef, {
      ...awardData,
      editorId,
      metadata: {
        ...awardData.metadata,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding editor award:', error);
    return null;
  }
};

// Search Analytics
export const logSearch = async (searchData: {
  query?: string;
  filters: any;
  resultCount: number;
  userAgent?: string;
  timestamp: Date;
}): Promise<void> => {
  try {
    const searchesRef = collection(db, COLLECTIONS.SEARCHES);
    await addDoc(searchesRef, {
      ...searchData,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error logging search:', error);
  }
};

/**
 * Sample Data Structure for Reference
 */
export const SAMPLE_EDITOR_DOCUMENT = {
  name: "Sarah Martinez",
  email: "sarah@example.com",
  phone: "+1-555-0123",
  location: {
    city: "Los Angeles",
    state: "CA", 
    country: "USA",
    remote: true
  },
  experience: {
    yearsActive: 12,
    startYear: 2012,
    specialties: ["Drama", "Limited Series", "Feature Films"]
  },
  professional: {
    unionStatus: "guild",
    imdbId: "nm1234567",
    availability: "available",
    representation: {
      agent: "CAA",
      agentContact: "agent@caa.com",
      manager: "Management 360",
      managerContact: "manager@m360.com"
    }
  },
  metadata: {
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-12-01"),
    dataSource: ["imdb", "staff-me-up"],
    verified: true
  }
};

export const SAMPLE_CREDIT_DOCUMENT = {
  editorId: "editor_id_here",
  show: {
    title: "The Crown",
    type: "series",
    network: "Netflix",
    genre: ["Drama", "Historical"],
    imdbId: "tt4786824"
  },
  role: {
    position: "supervising-editor",
    episodeCount: 20,
    seasonCount: 2
  },
  timeline: {
    startYear: 2020,
    endYear: 2023,
    current: false
  },
  metadata: {
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-12-01"),
    dataSource: "imdb",
    verified: true
  }
};

export const SAMPLE_AWARD_DOCUMENT = {
  editorId: "editor_id_here",
  award: {
    name: "Emmy Award",
    category: "Outstanding Picture Editing for a Drama Series",
    year: 2023,
    status: "won"
  },
  show: {
    title: "The Crown",
    network: "Netflix"
  },
  metadata: {
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-12-01"), 
    dataSource: "emmys",
    verified: true
  }
}; 