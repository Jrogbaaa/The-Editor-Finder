/**
 * Data Synchronization Service
 * Handles aggregating editor data from multiple sources and managing duplicates
 */

import { db } from './firebase';
import { tmdbService, TMDbCrewMember, TMDbShow } from './tmdb';
import { 
  addEditor, 
  addEditorCredit, 
  getEditor, 
  updateEditor,
  COLLECTIONS,
  SUBCOLLECTIONS 
} from './firestore-schema';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { Editor, Credit } from '@/types';

interface SyncResult {
  success: boolean;
  editorsProcessed: number;
  editorsAdded: number;
  editorsUpdated: number;
  creditsAdded: number;
  errors: string[];
}

interface EditorMatch {
  editor: Editor;
  similarity: number;
  matchType: 'exact' | 'fuzzy' | 'none';
}

class DataSyncService {
  private readonly SIMILARITY_THRESHOLD = 0.8;
  private readonly RATE_LIMIT_DELAY = parseInt(process.env.SCRAPING_DELAY_MS || '2000');

  /**
   * Sync editors from TMDb for popular TV shows
   */
  async syncFromTMDb(maxShows = 50): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      editorsProcessed: 0,
      editorsAdded: 0,
      editorsUpdated: 0,
      creditsAdded: 0,
      errors: []
    };

    try {
      console.log(`Starting TMDb sync for ${maxShows} shows...`);
      
      // Get popular and top-rated shows
      const [popularShows, topRatedShows] = await Promise.all([
        tmdbService.getPopularTVShows(1),
        tmdbService.getTopRatedTVShows(1)
      ]);

      // Combine and deduplicate shows
      const allShows = [...popularShows.results, ...topRatedShows.results];
      const uniqueShows = allShows.filter((show, index, arr) => 
        arr.findIndex(s => s.id === show.id) === index
      ).slice(0, maxShows);

      console.log(`Found ${uniqueShows.length} unique shows to process`);

      // Process shows in batches to respect rate limits
      const batchSize = 5;
      for (let i = 0; i < uniqueShows.length; i += batchSize) {
        const batch = uniqueShows.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async (show) => {
          try {
            const syncShowResult = await this.syncShowFromTMDb(show);
            result.editorsProcessed += syncShowResult.editorsProcessed;
            result.editorsAdded += syncShowResult.editorsAdded;
            result.editorsUpdated += syncShowResult.editorsUpdated;
            result.creditsAdded += syncShowResult.creditsAdded;
            result.errors.push(...syncShowResult.errors);
          } catch (error) {
            const errorMsg = `Error syncing show ${show.name}: ${error}`;
            console.error(errorMsg);
            result.errors.push(errorMsg);
          }
        }));

        // Rate limiting between batches
        if (i + batchSize < uniqueShows.length) {
          await this.delay(this.RATE_LIMIT_DELAY);
        }
      }

      // Log sync results
      await this.logSyncResults('tmdb', result);
      
      console.log('TMDb sync completed:', result);
      return result;

    } catch (error) {
      result.success = false;
      result.errors.push(`TMDb sync failed: ${error}`);
      console.error('TMDb sync error:', error);
      return result;
    }
  }

  /**
   * Sync editors from a single TMDb show
   */
  private async syncShowFromTMDb(show: TMDbShow): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      editorsProcessed: 0,
      editorsAdded: 0,
      editorsUpdated: 0,
      creditsAdded: 0,
      errors: []
    };

    try {
      // Get show details and credits
      const [showDetails, credits] = await Promise.all([
        tmdbService.getTVShow(show.id),
        tmdbService.getTVCredits(show.id)
      ]);

      const editors = tmdbService.extractEditors(credits);
      
      if (editors.length === 0) {
        return result;
      }

      console.log(`Processing ${editors.length} editors from "${show.name}"`);

      for (const tmdbEditor of editors) {
        try {
          result.editorsProcessed++;
          
          // Find or create editor
          const existingEditor = await this.findExistingEditor(tmdbEditor.name);
          
          let editorId: string;
          
          if (existingEditor.matchType === 'exact') {
            // Update existing editor
            editorId = existingEditor.editor.id;
            await this.updateEditorFromTMDb(existingEditor.editor, tmdbEditor);
            result.editorsUpdated++;
          } else {
            // Create new editor
            const newEditor = this.createEditorFromTMDb(tmdbEditor);
            editorId = await addEditor(newEditor) || '';
            
            if (editorId) {
              result.editorsAdded++;
            } else {
              result.errors.push(`Failed to add editor: ${tmdbEditor.name}`);
              continue;
            }
          }

          // Add credit
          if (editorId) {
            const credit = tmdbService.mapShowToCredit(showDetails, tmdbEditor);
            const creditId = await addEditorCredit(editorId, credit);
            
            if (creditId) {
              result.creditsAdded++;
            } else {
              result.errors.push(`Failed to add credit for ${tmdbEditor.name} on ${show.name}`);
            }
          }

        } catch (error) {
          result.errors.push(`Error processing editor ${tmdbEditor.name}: ${error}`);
        }
      }

      return result;

    } catch (error) {
      result.success = false;
      result.errors.push(`Error syncing show ${show.name}: ${error}`);
      return result;
    }
  }

  /**
   * Find existing editor by name with fuzzy matching
   */
  private async findExistingEditor(name: string): Promise<EditorMatch> {
    try {
      // First try exact match
      const editorsRef = collection(db, COLLECTIONS.EDITORS);
      const exactQuery = query(editorsRef, where('name', '==', name));
      const exactSnapshot = await getDocs(exactQuery);

      if (!exactSnapshot.empty) {
        const editor = { id: exactSnapshot.docs[0].id, ...exactSnapshot.docs[0].data() } as Editor;
        return {
          editor,
          similarity: 1.0,
          matchType: 'exact'
        };
      }

      // If no exact match, try fuzzy matching
      const allEditorsSnapshot = await getDocs(editorsRef);
      let bestMatch: EditorMatch = {
        editor: {} as Editor,
        similarity: 0,
        matchType: 'none'
      };

      allEditorsSnapshot.forEach((doc) => {
        const editor = { id: doc.id, ...doc.data() } as Editor;
        const similarity = this.calculateNameSimilarity(name, editor.name);
        
        if (similarity > bestMatch.similarity && similarity >= this.SIMILARITY_THRESHOLD) {
          bestMatch = {
            editor,
            similarity,
            matchType: 'fuzzy'
          };
        }
      });

      return bestMatch;

    } catch (error) {
      console.error('Error finding existing editor:', error);
      return {
        editor: {} as Editor,
        similarity: 0,
        matchType: 'none'
      };
    }
  }

  /**
   * Calculate similarity between two names (simple implementation)
   */
  private calculateNameSimilarity(name1: string, name2: string): number {
    const normalize = (str: string) => str.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    
    const n1 = normalize(name1);
    const n2 = normalize(name2);
    
    if (n1 === n2) return 1.0;
    
    // Simple Levenshtein distance implementation
    const matrix = Array(n2.length + 1).fill(null).map(() => Array(n1.length + 1).fill(null));
    
    for (let i = 0; i <= n1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= n2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= n2.length; j++) {
      for (let i = 1; i <= n1.length; i++) {
        const indicator = n1[i - 1] === n2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion  
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    const distance = matrix[n2.length][n1.length];
    const maxLength = Math.max(n1.length, n2.length);
    return maxLength === 0 ? 1 : (maxLength - distance) / maxLength;
  }

  /**
   * Create editor object from TMDb crew member
   */
  private createEditorFromTMDb(tmdbEditor: TMDbCrewMember): Omit<Editor, 'id'> {
    return {
      name: tmdbEditor.name,
      location: {
        city: 'Unknown',
        state: 'Unknown', 
        country: 'Unknown',
        remote: false
      },
      experience: {
        yearsActive: 0, // Will be calculated from credits
        startYear: new Date().getFullYear(),
        specialties: [this.mapJobToSpecialty(tmdbEditor.job)]
      },
      professional: {
        unionStatus: 'unknown',
        availability: 'unknown'
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        dataSource: ['tmdb'],
        verified: false
      }
    };
  }

  /**
   * Update existing editor with TMDb data
   */
  private async updateEditorFromTMDb(editor: Editor, tmdbEditor: TMDbCrewMember): Promise<void> {
    const updates: Partial<Editor> = {
      metadata: {
        ...editor.metadata,
        updatedAt: new Date(),
        dataSource: Array.from(new Set([...editor.metadata.dataSource, 'tmdb']))
      }
    };

    // Add specialty if not already present
    const newSpecialty = this.mapJobToSpecialty(tmdbEditor.job);
    if (!editor.experience.specialties.includes(newSpecialty)) {
      updates.experience = {
        ...editor.experience,
        specialties: [...editor.experience.specialties, newSpecialty]
      };
    }

    await updateEditor(editor.id, updates);
  }

  /**
   * Map TMDb job to our specialty categories
   */
  private mapJobToSpecialty(job: string): string {
    const jobLower = job.toLowerCase();
    
    if (jobLower.includes('supervising')) return 'Supervising Editor';
    if (jobLower.includes('assistant')) return 'Assistant Editor';
    if (jobLower.includes('associate')) return 'Associate Editor';
    if (jobLower.includes('additional')) return 'Additional Editor';
    if (jobLower.includes('online')) return 'Online Editor';
    if (jobLower.includes('offline')) return 'Offline Editor';
    
    return 'Editor';
  }

  /**
   * Log sync results to Firestore for analytics
   */
  private async logSyncResults(source: string, result: SyncResult): Promise<void> {
    try {
      const syncLogRef = collection(db, 'syncLogs');
      await addDoc(syncLogRef, {
        source,
        timestamp: new Date(),
        ...result
      });
    } catch (error) {
      console.error('Error logging sync results:', error);
    }
  }

  /**
   * Utility method for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const dataSyncService = new DataSyncService();

// Export types
export type { SyncResult, EditorMatch }; 