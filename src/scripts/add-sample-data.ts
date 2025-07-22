/**
 * Script to add sample editor data to Firebase for testing
 * Run with: npx tsx src/scripts/add-sample-data.ts
 */

import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { addEditor, addEditorCredit, addEditorAward } from '../lib/firestore-schema';

console.log('🔥 Starting Firebase initialization...');

// Initialize Firebase (you can use the same config from your .env file)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log('🔧 Firebase config loaded:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  hasApiKey: !!firebaseConfig.apiKey
});

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Missing required Firebase configuration in environment variables');
  console.error('Make sure .env.local has all required NEXT_PUBLIC_FIREBASE_* variables');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('✅ Firebase initialized successfully');

const sampleEditors = [
  {
    name: "Sarah Martinez",
    email: "sarah.martinez@example.com",
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
      specialties: ["Drama", "Limited Series", "Thriller"]
    },
    professional: {
      unionStatus: "guild" as const,
      imdbId: "nm1234567",
      availability: "available" as const,
      representation: {
        agent: "Creative Artists Agency",
        agentContact: "agent@caa.com",
        manager: "Management 360",
        managerContact: "manager@m360.com"
      }
    },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      dataSource: ["manual", "imdb"],
      verified: true
    }
  },
  {
    name: "Michael Chen",
    email: "mike.chen@example.com",
    location: {
      city: "New York",
      state: "NY", 
      country: "USA",
      remote: false
    },
    experience: {
      yearsActive: 8,
      startYear: 2016,
      specialties: ["Comedy", "Talk Shows", "Reality TV"]
    },
    professional: {
      unionStatus: "guild" as const,
      imdbId: "nm2345678",
      availability: "busy" as const,
      representation: {
        agent: "William Morris Endeavor",
        agentContact: "agent@wmeagency.com"
      }
    },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      dataSource: ["manual", "linkedin"],
      verified: true
    }
  },
  {
    name: "Emily Rodriguez",
    email: "emily.rodriguez@example.com",
    location: {
      city: "Atlanta",
      state: "GA",
      country: "USA", 
      remote: true
    },
    experience: {
      yearsActive: 15,
      startYear: 2009,
      specialties: ["Documentary", "News", "Sports"]
    },
    professional: {
      unionStatus: "guild" as const,
      imdbId: "nm3456789",
      availability: "available" as const
    },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      dataSource: ["manual"],
      verified: false
    }
  },
  {
    name: "David Kim",
    location: {
      city: "Vancouver",
      state: "BC",
      country: "Canada",
      remote: true
    },
    experience: {
      yearsActive: 6,
      startYear: 2018,
      specialties: ["Animation", "Children's TV", "VFX"]
    },
    professional: {
      unionStatus: "non-union" as const,
      availability: "available" as const
    },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      dataSource: ["manual"],
      verified: false
    }
  }
];

const sampleCredits = [
  {
    editorIndex: 0, // Sarah Martinez
    credits: [
      {
        show: {
          title: "The Crown",
          type: "series" as const,
          network: "Netflix",
          genre: ["Drama", "Historical"],
          imdbId: "tt4786824"
        },
        role: {
          position: "supervising-editor" as const,
          episodeCount: 20,
          seasonCount: 2
        },
        timeline: {
          startYear: 2020,
          endYear: 2023,
          current: false
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          dataSource: "imdb",
          verified: true
        }
      },
      {
        show: {
          title: "Stranger Things",
          type: "series" as const,
          network: "Netflix",
          genre: ["Drama", "Horror", "Sci-Fi"],
          imdbId: "tt4574334"
        },
        role: {
          position: "editor" as const,
          episodeCount: 8,
          seasonCount: 1
        },
        timeline: {
          startYear: 2019,
          endYear: 2020,
          current: false
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          dataSource: "imdb",
          verified: true
        }
      }
    ]
  },
  {
    editorIndex: 1, // Michael Chen
    credits: [
      {
        show: {
          title: "Saturday Night Live",
          type: "series" as const,
          network: "NBC",
          genre: ["Comedy", "Variety"],
          imdbId: "tt0072562"
        },
        role: {
          position: "editor" as const,
          episodeCount: 45,
          seasonCount: 3
        },
        timeline: {
          startYear: 2021,
          current: true
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          dataSource: "imdb",
          verified: true
        }
      }
    ]
  },
  {
    editorIndex: 2, // Emily Rodriguez
    credits: [
      {
        show: {
          title: "Our Planet",
          type: "documentary" as const,
          network: "Netflix",
          genre: ["Documentary", "Nature"],
          imdbId: "tt9253866"
        },
        role: {
          position: "supervising-editor" as const,
          episodeCount: 8,
          seasonCount: 1
        },
        timeline: {
          startYear: 2018,
          endYear: 2019,
          current: false
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          dataSource: "imdb",
          verified: true
        }
      }
    ]
  }
];

const sampleAwards = [
  {
    editorIndex: 0, // Sarah Martinez
    awards: [
      {
        award: {
          name: "Emmy Award",
          category: "Outstanding Picture Editing for a Drama Series",
          year: 2023,
          status: "won" as const
        },
        show: {
          title: "The Crown",
          network: "Netflix"
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          dataSource: "emmys",
          verified: true
        }
      },
      {
        award: {
          name: "Emmy Award", 
          category: "Outstanding Picture Editing for a Drama Series",
          year: 2022,
          status: "nominated" as const
        },
        show: {
          title: "The Crown",
          network: "Netflix"
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          dataSource: "emmys",
          verified: true
        }
      }
    ]
  }
];

async function addSampleData() {
  console.log('Starting to add sample data...');
  
  try {
    const editorIds: string[] = [];

    // Add editors
    for (const editor of sampleEditors) {
      console.log(`Adding editor: ${editor.name}`);
      const editorId = await addEditor(editor);
      if (editorId) {
        editorIds.push(editorId);
        console.log(`✅ Added editor ${editor.name} with ID: ${editorId}`);
      } else {
        console.log(`❌ Failed to add editor ${editor.name}`);
      }
    }

    // Add credits
    for (const editorCredits of sampleCredits) {
      const editorId = editorIds[editorCredits.editorIndex];
      if (!editorId) continue;

      for (const credit of editorCredits.credits) {
        console.log(`Adding credit: ${credit.show.title} for editor ${editorId}`);
        const creditId = await addEditorCredit(editorId, credit);
        if (creditId) {
          console.log(`✅ Added credit ${credit.show.title}`);
        } else {
          console.log(`❌ Failed to add credit ${credit.show.title}`);
        }
      }
    }

    // Add awards
    for (const editorAwards of sampleAwards) {
      const editorId = editorIds[editorAwards.editorIndex];
      if (!editorId) continue;

      for (const award of editorAwards.awards) {
        console.log(`Adding award: ${award.award.name} for editor ${editorId}`);
        const awardId = await addEditorAward(editorId, award);
        if (awardId) {
          console.log(`✅ Added award ${award.award.name}`);
        } else {
          console.log(`❌ Failed to add award ${award.award.name}`);
        }
      }
    }

    console.log('\n🎉 Sample data added successfully!');
    console.log(`✅ Added ${editorIds.length} editors`);
    console.log(`✅ Added ${sampleCredits.reduce((sum, ec) => sum + ec.credits.length, 0)} credits`);
    console.log(`✅ Added ${sampleAwards.reduce((sum, ea) => sum + ea.awards.length, 0)} awards`);

  } catch (error) {
    console.error('❌ Error adding sample data:', error);
  }
}

// Run the script
addSampleData().then(() => {
  console.log('Script completed.');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
}); 