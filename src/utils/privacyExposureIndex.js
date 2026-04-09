/**
 * Privacy Exposure Index Calculator
 * Calculates a 0-100 score representing privacy exposure/risk for services
 *
 * IMPORTANT: Two separate but related metrics:
 *
 * 1. exposureIndex (0-100): Higher = More Risk/Exposure
 *    - Calculated dynamically from risk factors
 *    - Used in exposure analysis dashboards
 *    - Color: Red (≥70 high) → Orange (≥50) → Yellow (≥30) → Green (<30 low)
 *
 * 2. privacy_score (0-100): Higher = Better Privacy
 *    - Calculated as: 100 - exposureIndex
 *    - Used in service catalog displays
 *    - Color: Green (≥70 good) → Yellow (≥50) → Red (<50 bad)
 *
 * These are mathematical inverses of each other.
 *
 * METHODOLOGY (8-factor, aligned with app):
 * - Factor 2 (Known Issues): Excludes breach- and sharing-related issues (counted in Factor 3 and 8 to avoid double-counting).
 * - Factor 4 (Regulatory Oversight): More regulations = more oversight = lower exposure; max(0, 12 − count×3).
 * - Factor 7 (User Control): Zero for privacy-enhancing categories (security-tools, vpn); recommended actions there are best practices.
 * - Privacy-enhancing cap: VPN/security-tools with no breach and no third-party sharing are capped at 49 (Medium).
 * - Data Breach History: 0-14 points (breachCount×4 max 8 + severity×2 max 6). Third-Party Data Sharing: 0-25 (top risk, highest weight).
 *
 * @version 2.5.0
 * @date 2026-02
 */

import { serviceCatalog } from '../data/serviceCatalog.js';
import { getAllEnhancedServices } from '../data/serviceCatalogEnhanced.js';
import { serviceRiskProfiles } from '../data/serviceRiskProfiles.js';
import { serviceRelationships } from '../data/serviceRelationships.js';
import subscriptionService from '../services/subscriptionService';

/**
 * Check if user has premium subscription
 * @returns {boolean} - True if user has active premium/family subscription
 */
function isPremiumUser() {
  return subscriptionService.hasActiveSubscription();
}

/**
 * Resolve service data from enhanced catalog first, then base catalog.
 * @param {string} serviceId
 * @returns {Object|null}
 */
function resolveService(serviceId) {
  const allServices = getAllEnhancedServices();
  return allServices.find(s => s.id === serviceId) || serviceCatalog.find(s => s.id === serviceId) || null;
}

/**
 * Breach detection is now hybrid:
 * 1) Structured incidents from enhanced catalog breaches[] (preferred; includes source_url references)
 * 2) Keyword fallback from risk-profile known issues for services without structured incidents
 *
 * This keeps the model deterministic while allowing incremental integration of external breach databases
 * by curating new incidents into breaches[] with verifiable source URLs.
 */
const BREACH_KEYWORDS = [
  'breach',
  'hack',
  'leak',
  'exposed',
  'compromised',
  'stolen',
  'unauthorized access',
  'data exposure',
  'security incident',
  'credential stuffing'
];
const CRITICAL_BREACH_HINTS = ['critical', 'major', 'billion', 'ransomware'];
const HIGH_BREACH_HINTS = ['million', 'significant', 'widespread', 'large-scale'];
const BREACH_SEVERITY_BY_LABEL = { low: 1, medium: 1, high: 2, critical: 3 };

/** Keywords used to detect third-party/sharing-related issues (Factor 8). */
const SHARING_KEYWORDS = ['third-party', 'advertis', 'shares data', 'data broker'];

/** Parent companies that are privacy-first; do not add Factor 8 "data sharing network" penalty for these. */
const PRIVACY_FIRST_PARENTS = ['duckduckgo', 'the-tor-project'];

/**
 * Category sensitivity weighting for Factor 6 (0-8 points).
 *
 * Rationale references:
 * - GDPR Art. 9 special-category data (health/biometric/sexual-life type sensitivity)
 * - NIST SP 800-122 guidance on high-impact PII confidentiality loss
 * - OECD privacy principles (collection limitation, purpose limitation, use limitation)
 */
const CATEGORY_RISK_SCORES = {
  // Highest sensitivity: direct financial harm, identity fraud, or intimate-profile misuse.
  financial: 8,
  dating: 8,
  health: 8,

  // High sensitivity: frequent location + health/behavioral telemetry combinations.
  lifestyle: 7,

  // Elevated sensitivity: always-on sensors/social graph inferences.
  'smart-home': 6,
  'social-media': 6,

  // Moderate-high: deep content repositories and collaboration trails.
  'cloud-storage': 5,

  // Moderate: business/workflow metadata and communication context.
  productivity: 4,
  messaging: 4,
  'search-email': 4,
  gaming: 4,

  // Moderate-lower: purchase/content preference telemetry.
  shopping: 3,
  news: 3,
  'password-manager': 3,

  // Lower relative platform-level exposure (still non-zero risk).
  education: 2,
  streaming: 2,
  browser: 2,

  // Privacy-enhancing categories are intentionally low and additionally capped elsewhere.
  vpn: 1,
  'security-tools': 1
};
const PRIVACY_ENHANCING_CATEGORIES = ['security-tools', 'vpn'];

function inferSeverityFromStructuredBreach(breach) {
  const severityLabel = String(breach?.severity || '').toLowerCase();
  let severity = BREACH_SEVERITY_BY_LABEL[severityLabel] || 0;

  const affectedUsers = Number(breach?.affected_users || 0);
  if (affectedUsers >= 1_000_000_000) severity = Math.max(severity, 3);
  else if (affectedUsers >= 1_000_000) severity = Math.max(severity, 2);
  else if (affectedUsers > 0) severity = Math.max(severity, 1);

  const description = String(breach?.description || '').toLowerCase();
  if (CRITICAL_BREACH_HINTS.some(k => description.includes(k))) severity = Math.max(severity, 3);
  else if (HIGH_BREACH_HINTS.some(k => description.includes(k))) severity = Math.max(severity, 2);

  return severity;
}

function detectStructuredBreachHistory(service) {
  const breaches = Array.isArray(service?.breaches) ? service.breaches : [];
  let severity = 0;
  let hasExternalSourceEvidence = false;

  breaches.forEach(breach => {
    severity = Math.max(severity, inferSeverityFromStructuredBreach(breach));
    if (typeof breach?.source_url === 'string' && breach.source_url.startsWith('http')) {
      hasExternalSourceEvidence = true;
    }
  });

  return {
    breachCount: breaches.length,
    severity,
    hasExternalSourceEvidence
  };
}

function detectKeywordBreachHistory(riskProfile) {
  const knownIssues = riskProfile.knownIssues || [];
  let breachCount = 0;
  let severity = 0; // 0 = none, 1 = minor, 2 = major, 3 = critical

  knownIssues.forEach(issue => {
    const lowerIssue = issue.toLowerCase();
    if (BREACH_KEYWORDS.some(keyword => lowerIssue.includes(keyword))) {
      breachCount++;

      // Determine severity from language cues when structured incident data is unavailable
      if (CRITICAL_BREACH_HINTS.some(keyword => lowerIssue.includes(keyword))) {
        severity = Math.max(severity, 3);
      } else if (HIGH_BREACH_HINTS.some(keyword => lowerIssue.includes(keyword))) {
        severity = Math.max(severity, 2);
      } else {
        severity = Math.max(severity, 1);
      }
    }
  });

  return { breachCount, severity };
}

/**
 * Detect known breach history using structured incidents first, with keyword fallback.
 * @param {Object|null} service
 * @param {Object} riskProfile
 * @returns {{ breachCount: number, severity: number, evidenceSource: string }}
 */
function detectBreachHistory(service, riskProfile) {
  const structured = detectStructuredBreachHistory(service);
  const keyword = detectKeywordBreachHistory(riskProfile);

  if (structured.breachCount === 0) {
    return {
      breachCount: keyword.breachCount,
      severity: keyword.severity,
      evidenceSource: keyword.breachCount > 0 ? 'keyword-fallback' : 'none'
    };
  }

  return {
    // Use max() to avoid overcounting duplicated incidents described in both sources.
    breachCount: Math.max(structured.breachCount, keyword.breachCount),
    severity: Math.max(structured.severity, keyword.severity),
    evidenceSource: structured.hasExternalSourceEvidence ? 'structured-with-source-url' : 'structured'
  };
}

/**
 * Calculate third-party sharing score from issue text + company relationship graph.
 * @param {Object} riskProfile
 * @param {Object|undefined} relationship
 * @param {{ issuesPoints: number, relationshipPoints: number, cap: number }} config
 * @returns {number}
 */
function getThirdPartySharingScore(riskProfile, relationship, config) {
  let score = 0;
  const knownIssues = riskProfile.knownIssues || [];
  if (knownIssues.some(issue => SHARING_KEYWORDS.some(keyword => issue.toLowerCase().includes(keyword)))) {
    score += config.issuesPoints;
  }
  const isPrivacyFirstParent = relationship?.parent && PRIVACY_FIRST_PARENTS.includes(relationship.parent);
  if (!isPrivacyFirstParent && (relationship?.parent || (relationship?.siblings && relationship.siblings.length > 0))) {
    score += config.relationshipPoints;
  }
  return Math.min(score, config.cap);
}

/**
 * Get known issues that contribute to Factor 2 only (exclude breach and sharing to avoid double-counting with Factor 3 and 8).
 * @param {Object} riskProfile - The service risk profile
 * @returns {{ count: number, items: string[] }}
 */
function getKnownIssuesForFactor2(riskProfile) {
  const knownIssues = riskProfile.knownIssues || [];
  const items = knownIssues.filter(issue => {
    const l = issue.toLowerCase();
    const isBreach = BREACH_KEYWORDS.some(k => l.includes(k));
    const isSharing = SHARING_KEYWORDS.some(k => l.includes(k));
    return !isBreach && !isSharing;
  });
  return { count: items.length, items };
}

/**
 * Calculate full Digital Privacy Footprint Analysis (Premium Plan)
 * Uses 8 factors matching the documented Privacy Exposure Index methodology
 *
 * Formula (weights aligned with METHODOLOGY_PRINCIPLES: Factor 8 = top risk, highest weight):
 * Factor 1: Typical Privacy Risks (0-22)       = riskCount × 5, cap 22
 * Factor 2: Known Privacy Issues (0-24)       = issueCount × 6, cap 24
 * Factor 3: Data Breach History (0-14)        = (breachCount × 4, max 8) + (severity × 2, max 6), cap 14
 * Factor 4: Regulatory Oversight (0-12)       = max(0, 12 − regulationCount×3); more regulations = more oversight = lower exposure
 * Factor 5: Parent Company & Siblings (0-8)    = parent(4) + siblings(×1, max 4)
 * Factor 6: Data Sensitivity Category (0-8)   = categoryScore
 * Factor 7: User Control & Privacy (0-10)    = recommendedActionCount × 2
 * Factor 8: Third-Party Data Sharing (0-25)    = indicators (top risk — highest weight)
 * ────────────────────────────────────────────────────────────────
 * TOTAL: 0-123 points (sum capped at 100)
 *
 * @param {string} serviceId - The service ID
 * @returns {number|null} - Exposure index (0-100) or null if service not found
 */
function calculateFullExposureIndex(serviceId) {
  const service = resolveService(serviceId);
  const riskProfile = serviceRiskProfiles[serviceId];
  const relationship = serviceRelationships[serviceId];
  
  // Only require risk profile - service can be in either catalog
  if (!riskProfile) return null;
  
  let score = 0;
  
  // Factor 1: Typical Privacy Risks (0-22 points)
  const riskCount = riskProfile.typicalRisks?.length || 0;
  score += Math.min(riskCount * 5, 22);
  
  // Factor 2: Known Privacy Issues (0-24 points) — exclude breach and sharing issues to avoid double-counting with Factor 3 and 8
  const { count: issueCount } = getKnownIssuesForFactor2(riskProfile);
  score += Math.min(issueCount * 6, 24);
  
  // Factor 3: Data Breach History (0-14 points)
  const breachInfo = detectBreachHistory(service, riskProfile);
  let breachScore = 0;
  if (breachInfo.breachCount > 0) {
    breachScore += Math.min(breachInfo.breachCount * 4, 8);
    breachScore += breachInfo.severity * 2; // Up to 6 points for severity (3 max severity * 2)
  }
  score += Math.min(breachScore, 14); // Cap breach factor at 14 (8 + 6)
  
  // Factor 4: Regulatory Oversight (0-12 points) — more regulations = more oversight = lower exposure
  const regulationCount = riskProfile.regulations?.length || 0;
  score += Math.max(0, 12 - regulationCount * 3);
  
  // Factor 5: Parent Company & Data Sharing Network (0-8 points)
  let parentScore = 0;
  if (relationship?.parent) {
    parentScore = 4; // Base parent company
    if (relationship.siblings && relationship.siblings.length > 0) {
      parentScore += Math.min(relationship.siblings.length * 1, 4); // Sibling services
    }
  }
  score += Math.min(parentScore, 8); // Cap only Factor 5 contribution, not total score
  
  // Factor 6: Data Sensitivity by Category (0-8 points)
  const categoryScore = CATEGORY_RISK_SCORES[service.category] || 4;
  score += Math.min(categoryScore, 8); // Cap only Factor 6 contribution, not total score
  
  // Factor 7: User Control & Privacy by Default (0-10 points)
  // For privacy-enhancing tools (security-tools, VPN), recommended actions are best practices—do not penalize.
  const actionCount = riskProfile.recommendedActions?.length || 0;
  const isPrivacyEnhancing = PRIVACY_ENHANCING_CATEGORIES.includes(service.category);
  if (!isPrivacyEnhancing) {
    score += Math.min(actionCount * 2, 10);
  }
  
  // Factor 8: Third-Party Data Sharing (0-25 points) — top risk, highest weight per METHODOLOGY_PRINCIPLES
  const thirdPartySharing = getThirdPartySharingScore(riskProfile, relationship, {
    issuesPoints: 15,
    relationshipPoints: 10,
    cap: 25
  });
  score += thirdPartySharing;
  
  // Avoid false attribution: privacy-enhancing services must not show High/Very High unless real breach or third-party.
  if (isPrivacyEnhancing && breachScore === 0 && thirdPartySharing === 0) {
    score = Math.min(score, 49);
  }
  
  // Normalize to 0-100
  return Math.min(Math.round(score), 100);
}

/**
 * Calculate Privacy Exposure Index (0-100) for a service
 * Uses the full 8-factor analysis only (same formula as app) for consistent index across app and website.
 * Higher score = higher privacy exposure/risk
 *
 * @param {string} serviceId - The service ID
 * @param {boolean} [forcePremium=false] - Unused; kept for API compatibility and testing
 * @returns {number|null} - Exposure index (0-100) or null if service not found
 */
export function calculatePrivacyExposureIndex(serviceId, forcePremium = false) {
  return calculateFullExposureIndex(serviceId);
}

/**
 * Get exposure level label and color styling
 * 
 * @param {number|null} index - The exposure index (0-100)
 * @returns {Object} - Object with level, color, and Tailwind classes
 */
export function getExposureLevel(index) {
  if (index === null || index === undefined) {
    return { 
      level: 'Unknown', 
      color: 'gray', 
      bgColor: 'bg-gray-100 dark:bg-gray-700', 
      textColor: 'text-gray-700 dark:text-gray-300',
      barColor: 'bg-gray-400'
    };
  }
  
  if (index >= 70) {
    return { 
      level: 'Very High', 
      color: 'red', 
      bgColor: 'bg-red-100 dark:bg-red-900/30', 
      textColor: 'text-red-700 dark:text-red-300',
      barColor: 'bg-red-500'
    };
  } else if (index >= 50) {
    return { 
      level: 'High', 
      color: 'orange', 
      bgColor: 'bg-orange-100 dark:bg-orange-900/30', 
      textColor: 'text-orange-700 dark:text-orange-300',
      barColor: 'bg-orange-500'
    };
  } else if (index >= 30) {
    return { 
      level: 'Medium', 
      color: 'yellow', 
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', 
      textColor: 'text-yellow-700 dark:text-yellow-300',
      barColor: 'bg-yellow-500'
    };
  } else {
    return { 
      level: 'Low', 
      color: 'green', 
      bgColor: 'bg-green-100 dark:bg-green-900/30', 
      textColor: 'text-green-700 dark:text-green-300',
      barColor: 'bg-green-500'
    };
  }
}

function buildEightFactorBreakdown(serviceId, { includeDetails = true } = {}) {
  const service = resolveService(serviceId);
  const riskProfile = serviceRiskProfiles[serviceId];
  const relationship = serviceRelationships[serviceId];

  if (!service || !riskProfile) return null;

  const { count: issueCount, items: factor2Items } = getKnownIssuesForFactor2(riskProfile);
  const breachInfo = detectBreachHistory(service, riskProfile);
  let breachScore = 0;
  if (breachInfo.breachCount > 0) {
    breachScore = Math.min(breachInfo.breachCount * 4, 8) + (breachInfo.severity * 2);
  }
  breachScore = Math.min(breachScore, 14);

  const regulationCount = riskProfile.regulations?.length || 0;
  const regulatoryScore = Math.max(0, 12 - regulationCount * 3);

  let parentScore = 0;
  if (relationship?.parent) {
    parentScore = 4;
    if (relationship.siblings && relationship.siblings.length > 0) {
      parentScore += Math.min(relationship.siblings.length * 1, 4);
    }
  }

  const categoryScore = CATEGORY_RISK_SCORES[service.category] || 4;
  const actionCount = riskProfile.recommendedActions?.length || 0;
  const isPrivacyEnhancing = PRIVACY_ENHANCING_CATEGORIES.includes(service.category);
  const thirdPartySharing = getThirdPartySharingScore(riskProfile, relationship, {
    issuesPoints: 15,
    relationshipPoints: 10,
    cap: 25
  });

  return {
    serviceId,
    serviceName: service.name,
    totalScore: calculateFullExposureIndex(serviceId),
    factors: {
      typicalPrivacyRisks: {
        name: 'Typical Privacy Risks',
        score: Math.min((riskProfile.typicalRisks?.length || 0) * 5, 22),
        maxScore: 22,
        weight: '22',
        ...(includeDetails ? { details: riskProfile.typicalRisks || [] } : {})
      },
      knownPrivacyIssues: {
        name: 'Known Privacy Issues',
        score: Math.min(issueCount * 6, 24),
        maxScore: 24,
        weight: '24',
        ...(includeDetails ? { details: factor2Items } : {})
      },
      dataBreachHistory: {
        name: 'Known Breach History',
        score: Math.min(breachScore, 14),
        maxScore: 14,
        weight: '14',
        breachCount: breachInfo.breachCount,
        severity: breachInfo.severity,
        evidenceSource: breachInfo.evidenceSource
      },
      regulatoryComplexity: {
        name: 'Regulatory Oversight',
        score: regulatoryScore,
        maxScore: 12,
        weight: '12',
        ...(includeDetails ? { regulations: riskProfile.regulations || [] } : {})
      },
      parentCompanyDataSharing: {
        name: 'Parent Company & Data Sharing Network',
        score: Math.min(parentScore, 8),
        maxScore: 8,
        weight: '8',
        hasParent: !!relationship?.parent,
        parentCompany: relationship?.parent || null,
        siblingCount: relationship?.siblings?.length || 0
      },
      dataSensitivityByCategory: {
        name: 'Data Sensitivity by Category',
        score: categoryScore,
        maxScore: 8,
        weight: '8',
        category: service.category
      },
      userControlPrivacyByDefault: {
        name: 'User Control & Privacy by Default',
        score: isPrivacyEnhancing ? 0 : Math.min(actionCount * 2, 10),
        maxScore: 10,
        weight: '10',
        recommendedActionsCount: actionCount
      },
      thirdPartyDataSharing: {
        name: 'Third-Party Data Sharing',
        score: thirdPartySharing,
        maxScore: 25,
        weight: '25',
        hasThirdPartySharing: thirdPartySharing > 0
      }
    }
  };
}

/**
 * Get 8-factor breakdown for any tier.
 * compact=true returns score-focused output (for free-tier concise UI).
 *
 * @param {string} serviceId
 * @param {{ compact?: boolean }} [options]
 * @returns {Object|null}
 */
export function getEightFactorExposureBreakdown(serviceId, options = {}) {
  const { compact = false } = options;
  return buildEightFactorBreakdown(serviceId, { includeDetails: !compact });
}

/**
 * Get detailed exposure breakdown (Premium only).
 * @param {string} serviceId
 * @returns {Object|null}
 */
export function getDetailedExposureBreakdown(serviceId) {
  if (!isPremiumUser()) {
    return null;
  }
  return buildEightFactorBreakdown(serviceId, { includeDetails: true });
}

/**
 * Get all services sorted by exposure index
 * 
 * @param {Array} services - Array of service objects
 * @param {string} order - 'asc' or 'desc' (default: 'desc')
 * @returns {Array} - Sorted array of services with exposure index
 */
export function sortServicesByExposure(services, order = 'desc') {
  return services
    .map(service => ({
      ...service,
      exposureIndex: calculatePrivacyExposureIndex(service.id)
    }))
    .sort((a, b) => {
      const indexA = a.exposureIndex || 0;
      const indexB = b.exposureIndex || 0;
      return order === 'desc' ? indexB - indexA : indexA - indexB;
    });
}

