/**
 * Data Reliability Service
 * Validates, verifies, and scores data authenticity and reliability
 */

import { db } from './firebase';
import { collection, doc, setDoc, getDocs, query, where, orderBy } from 'firebase/firestore';

interface DataSource {
  id: string;
  name: string;
  type: 'official' | 'industry' | 'directory' | 'social' | 'scraped';
  reliability: number; // 0-100
  verificationMethod: 'manual' | 'api' | 'cross-reference' | 'none';
  lastVerified: Date;
  active: boolean;
}

interface DataValidation {
  recordId: string;
  recordType: 'editor' | 'credit' | 'award' | 'research';
  validationStatus: 'verified' | 'pending' | 'disputed' | 'invalid';
  verificationSources: string[];
  verifiedBy: string;
  verifiedAt: Date;
  confidence: number; // 0-100
  notes?: string;
}

interface ReliabilityScore {
  overall: number; // 0-100
  factors: {
    sourceQuality: number;
    crossReference: number;
    freshness: number;
    verification: number;
  };
  recommendation: 'trusted' | 'caution' | 'verify' | 'reject';
}

class DataReliabilityService {
  private readonly OFFICIAL_SOURCES: DataSource[] = [
    {
      id: 'emmy-awards',
      name: 'Emmy Awards Official Database',
      type: 'official',
      reliability: 95,
      verificationMethod: 'api',
      lastVerified: new Date(),
      active: true
    },
    {
      id: 'television-academy',
      name: 'Television Academy',
      type: 'official',
      reliability: 95,
      verificationMethod: 'api',
      lastVerified: new Date(),
      active: true
    },
    {
      id: 'american-cinema-editors',
      name: 'American Cinema Editors (ACE)',
      type: 'directory',
      reliability: 90,
      verificationMethod: 'manual',
      lastVerified: new Date(),
      active: true
    },
    {
      id: 'motion-picture-editors',
      name: 'Motion Picture Editors Guild',
      type: 'directory',
      reliability: 90,
      verificationMethod: 'manual',
      lastVerified: new Date(),
      active: true
    },
    {
      id: 'tmdb',
      name: 'The Movie Database (TMDb)',
      type: 'industry',
      reliability: 80,
      verificationMethod: 'api',
      lastVerified: new Date(),
      active: true
    },
    {
      id: 'imdb-pro',
      name: 'IMDb Pro',
      type: 'industry',
      reliability: 85,
      verificationMethod: 'api',
      lastVerified: new Date(),
      active: true
    },
    {
      id: 'variety',
      name: 'Variety Magazine',
      type: 'industry',
      reliability: 75,
      verificationMethod: 'cross-reference',
      lastVerified: new Date(),
      active: true
    },
    {
      id: 'hollywood-reporter',
      name: 'The Hollywood Reporter',
      type: 'industry',
      reliability: 75,
      verificationMethod: 'cross-reference',
      lastVerified: new Date(),
      active: true
    },
    {
      id: 'deadline',
      name: 'Deadline Hollywood',
      type: 'industry',
      reliability: 70,
      verificationMethod: 'cross-reference',
      lastVerified: new Date(),
      active: true
    }
  ];

  async validateRecord(
    recordId: string,
    recordType: string,
    data: any,
    sources: string[]
  ): Promise<DataValidation> {
    try {
      console.log(`🔍 Validating ${recordType} record: ${recordId}`);
      
      const validationSources = sources.filter(source => 
        this.OFFICIAL_SOURCES.some(os => os.id === source || os.name === source)
      );
      
      const confidence = this.calculateConfidence(validationSources, data);
      const status = this.determineValidationStatus(confidence, validationSources);
      
      const validation: DataValidation = {
        recordId,
        recordType: recordType as any,
        validationStatus: status,
        verificationSources: validationSources,
        verifiedBy: 'system',
        verifiedAt: new Date(),
        confidence,
        notes: this.generateValidationNotes(confidence, validationSources)
      };
      
      // Store validation record
      const validationRef = doc(db, 'dataValidations', `${recordType}-${recordId}`);
      await setDoc(validationRef, validation);
      
      return validation;
    } catch (error) {
      console.error('Error validating record:', error);
      throw error;
    }
  }

  calculateReliabilityScore(data: any, sources: string[]): ReliabilityScore {
    const sourceQuality = this.calculateSourceQuality(sources);
    const crossReference = this.calculateCrossReferenceScore(sources);
    const freshness = this.calculateFreshnessScore(data);
    const verification = this.calculateVerificationScore(data);
    
    const overall = Math.round(
      (sourceQuality * 0.4) +
      (crossReference * 0.3) +
      (freshness * 0.2) +
      (verification * 0.1)
    );
    
    return {
      overall,
      factors: {
        sourceQuality,
        crossReference,
        freshness,
        verification
      },
      recommendation: this.getRecommendation(overall)
    };
  }

  private calculateSourceQuality(sources: string[]): number {
    if (sources.length === 0) return 0;
    
    const sourceReliabilities = sources.map(source => {
      const officialSource = this.OFFICIAL_SOURCES.find(os => 
        os.id === source || os.name === source
      );
      return officialSource ? officialSource.reliability : 30; // Default low score for unknown sources
    });
    
    return Math.round(
      sourceReliabilities.reduce((sum, reliability) => sum + reliability, 0) / 
      sourceReliabilities.length
    );
  }

  private calculateCrossReferenceScore(sources: string[]): number {
    if (sources.length <= 1) return 30;
    if (sources.length === 2) return 60;
    if (sources.length === 3) return 80;
    return 100; // 4+ sources
  }

  private calculateFreshnessScore(data: any): number {
    const updatedAt = data.metadata?.updatedAt || data.updatedAt;
    if (!updatedAt) return 50;
    
    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceUpdate <= 7) return 100;
    if (daysSinceUpdate <= 30) return 80;
    if (daysSinceUpdate <= 90) return 60;
    if (daysSinceUpdate <= 365) return 40;
    return 20;
  }

  private calculateVerificationScore(data: any): number {
    const verified = data.metadata?.verified || data.verified;
    if (verified === true) return 100;
    if (verified === false) return 30;
    return 50; // Unknown verification status
  }

  private calculateConfidence(sources: string[], data: any): number {
    const reliability = this.calculateReliabilityScore(data, sources);
    return reliability.overall;
  }

  private determineValidationStatus(
    confidence: number,
    sources: string[]
  ): DataValidation['validationStatus'] {
    if (confidence >= 85 && sources.length >= 2) return 'verified';
    if (confidence >= 70) return 'pending';
    if (confidence >= 50) return 'disputed';
    return 'invalid';
  }

  private generateValidationNotes(confidence: number, sources: string[]): string {
    if (confidence >= 85) {
      return `High confidence data verified by ${sources.length} reliable sources`;
    }
    if (confidence >= 70) {
      return `Moderate confidence data from ${sources.length} sources, pending additional verification`;
    }
    if (confidence >= 50) {
      return `Low confidence data, requires manual verification`;
    }
    return `Very low confidence data, recommend rejection or extensive verification`;
  }

  private getRecommendation(overall: number): ReliabilityScore['recommendation'] {
    if (overall >= 85) return 'trusted';
    if (overall >= 70) return 'caution';
    if (overall >= 50) return 'verify';
    return 'reject';
  }

  async getValidationHistory(recordId: string): Promise<DataValidation[]> {
    try {
      const validationsQuery = query(
        collection(db, 'dataValidations'),
        where('recordId', '==', recordId),
        orderBy('verifiedAt', 'desc')
      );
      
      const snapshot = await getDocs(validationsQuery);
      const validations: DataValidation[] = [];
      
      snapshot.forEach((doc) => {
        validations.push(doc.data() as DataValidation);
      });
      
      return validations;
    } catch (error) {
      console.error('Error getting validation history:', error);
      return [];
    }
  }

  async flagForReview(recordId: string, reason: string): Promise<void> {
    try {
      const flagRef = doc(db, 'dataFlags', recordId);
      await setDoc(flagRef, {
        recordId,
        reason,
        flaggedAt: new Date(),
        flaggedBy: 'system',
        status: 'pending',
        priority: this.calculateFlagPriority(reason)
      });
      
      console.log(`🚩 Flagged record ${recordId} for review: ${reason}`);
    } catch (error) {
      console.error('Error flagging record for review:', error);
    }
  }

  private calculateFlagPriority(reason: string): 'low' | 'medium' | 'high' | 'critical' {
    const lowReasons = ['outdated', 'incomplete'];
    const mediumReasons = ['unverified', 'conflicting'];
    const highReasons = ['disputed', 'suspicious'];
    const criticalReasons = ['fraud', 'harmful', 'copyright'];
    
    if (criticalReasons.some(r => reason.toLowerCase().includes(r))) return 'critical';
    if (highReasons.some(r => reason.toLowerCase().includes(r))) return 'high';
    if (mediumReasons.some(r => reason.toLowerCase().includes(r))) return 'medium';
    return 'low';
  }

  async generateDataQualityReport(): Promise<{
    totalRecords: number;
    verifiedRecords: number;
    pendingRecords: number;
    disputedRecords: number;
    invalidRecords: number;
    averageReliability: number;
    topSources: { source: string; reliability: number }[];
    recommendations: string[];
  }> {
    try {
      const validationsSnapshot = await getDocs(collection(db, 'dataValidations'));
      const validations: DataValidation[] = [];
      
      validationsSnapshot.forEach((doc) => {
        validations.push(doc.data() as DataValidation);
      });
      
      const totalRecords = validations.length;
      const verifiedRecords = validations.filter(v => v.validationStatus === 'verified').length;
      const pendingRecords = validations.filter(v => v.validationStatus === 'pending').length;
      const disputedRecords = validations.filter(v => v.validationStatus === 'disputed').length;
      const invalidRecords = validations.filter(v => v.validationStatus === 'invalid').length;
      
      const averageReliability = validations.length > 0 
        ? Math.round(validations.reduce((sum, v) => sum + v.confidence, 0) / validations.length)
        : 0;
      
      const topSources = this.OFFICIAL_SOURCES
        .sort((a, b) => b.reliability - a.reliability)
        .slice(0, 5)
        .map(source => ({ source: source.name, reliability: source.reliability }));
      
      const recommendations = this.generateRecommendations({
        totalRecords,
        verifiedRecords,
        pendingRecords,
        disputedRecords,
        invalidRecords,
        averageReliability
      });
      
      return {
        totalRecords,
        verifiedRecords,
        pendingRecords,
        disputedRecords,
        invalidRecords,
        averageReliability,
        topSources,
        recommendations
      };
    } catch (error) {
      console.error('Error generating data quality report:', error);
      throw error;
    }
  }

  private generateRecommendations(stats: any): string[] {
    const recommendations: string[] = [];
    
    if (stats.averageReliability < 70) {
      recommendations.push('Improve data source quality - consider prioritizing official sources');
    }
    
    if (stats.disputedRecords > stats.totalRecords * 0.1) {
      recommendations.push('High number of disputed records - implement additional verification processes');
    }
    
    if (stats.pendingRecords > stats.totalRecords * 0.2) {
      recommendations.push('Many records pending verification - allocate resources for validation review');
    }
    
    if (stats.verifiedRecords < stats.totalRecords * 0.5) {
      recommendations.push('Low verification rate - establish systematic verification workflows');
    }
    
    return recommendations;
  }
}

export const dataReliabilityService = new DataReliabilityService();
export type { DataSource, DataValidation, ReliabilityScore }; 