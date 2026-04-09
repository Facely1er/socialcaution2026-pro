/**
 * Law Enforcement Transparency Scoring
 * Separate from the Privacy Exposure Index (8-factor methodology).
 * Scale: 0-100 (lower = lower risk / better privacy protection against government access).
 *
 * Only LE-specific practices are scored. Regulatory compliance (GDPR/FRADCA) is not included
 * to avoid (1) duplicating the Exposure Index Factor 4 (regulatory oversight) and (2) overlapping
 * with notification/transparency, which those regimes already require or encourage.
 */

/**
 * @param {Object} leProfile - lawEnforcementPractices from service risk profile
 * @returns {number} 0-100, lower = lower risk (better privacy protection)
 */
export function calculateLawEnforcementScore(leProfile) {
  if (!leProfile || typeof leProfile !== 'object') return 50;

  let riskPoints = 0;

  // Factor 1: Warrant requirement (45 points) - MOST IMPORTANT
  if (leProfile.warrantsRequired === true) {
    riskPoints += 0;
  } else if (leProfile.warrantForMetadata === true) {
    riskPoints += 17;
  } else {
    riskPoints += 45;
  }

  // Factor 2: User notification (33 points)
  if (leProfile.notifyUsersBeforeDisclose === true) {
    riskPoints += 0;
  } else {
    riskPoints += 33;
  }

  // Factor 3: Transparency reports (22 points)
  if (leProfile.publicizeRequestVolume && leProfile.transparencyReportUrl) {
    riskPoints += 0;
  } else if (leProfile.publicizeRequestVolume) {
    riskPoints += 11;
  } else {
    riskPoints += 22;
  }

  // Bonus: Short data retention reduces risk (up to -5 points)
  if (leProfile.dataRetentionForGov === '0days') {
    riskPoints = Math.max(0, riskPoints - 5);
  } else if (leProfile.dataRetentionForGov === '30days') {
    riskPoints = Math.max(0, riskPoints - 2);
  }

  return Math.max(0, Math.min(100, Math.round(riskPoints)));
}

/**
 * @param {number} score - LE risk score 0-100 (lower = lower risk / better protection)
 * @returns {Object} level, color, label, badge
 */
export function getLawEnforcementRiskLevel(score) {
  if (score <= 20) {
    return { level: 'low', color: 'green', label: 'Strong Privacy Protection', badge: '🟢' };
  }
  if (score <= 40) {
    return { level: 'moderate', color: 'yellow', label: 'Moderate Protection', badge: '🟡' };
  }
  if (score <= 60) {
    return { level: 'high', color: 'orange', label: 'Weak Protection', badge: '🟠' };
  }
  return { level: 'critical', color: 'red', label: 'Minimal Protection', badge: '🔴' };
}

/**
 * @param {Object} leProfile - lawEnforcementPractices
 * @returns {Array<{severity: string, issue: string, description: string}>}
 */
export function getLawEnforcementVulnerabilities(leProfile) {
  if (!leProfile) return [];
  const vulnerabilities = [];

  if (leProfile.warrantsRequired === false && leProfile.warrantForMetadata !== true) {
    vulnerabilities.push({
      severity: 'critical',
      issue: 'No warrant requirement',
      description: 'Data can be shared on subpoena or request without court order'
    });
  } else if (leProfile.warrantsRequired === false && leProfile.warrantForMetadata === true) {
    vulnerabilities.push({
      severity: 'high',
      issue: 'Warrant required for metadata only',
      description: 'Full content requires a warrant, but metadata can be shared without one'
    });
  }
  if (leProfile.notifyUsersBeforeDisclose === false) {
    vulnerabilities.push({
      severity: 'high',
      issue: 'No user notification',
      description: "You won't know when authorities access your data"
    });
  }
  if (!leProfile.publicizeRequestVolume) {
    vulnerabilities.push({
      severity: 'medium',
      issue: 'No transparency',
      description: "Service doesn't publish data about law enforcement requests"
    });
  }
  return vulnerabilities;
}

/**
 * Recommendations (no assessment dependency; based on avgScore only)
 * @param {number} avgScore - Average LE score across selected services
 * @returns {Array<Object>}
 */
export function getLawEnforcementRecommendations(avgScore = 50) {
  const recommendations = [];

  if (avgScore > 40) {
    recommendations.push({
      type: 'service-switch',
      priority: 'high',
      title: 'Consider Privacy-Focused Alternatives',
      description: 'Some of your services provide weak protection against law enforcement access. Consider alternatives like Signal (messaging) or ProtonMail (email) that require warrants and publish transparency reports.',
      action: 'View service catalog',
      link: '/service-catalog'
    });
  }

  recommendations.push({
    type: 'encryption',
    priority: 'medium',
    title: 'Use End-to-End Encryption',
    description: "Use encrypted messaging and storage where the provider can't decrypt your data.",
    action: 'View toolkit',
    link: '/toolkit'
  });

  recommendations.push({
    type: 'monitoring',
    priority: 'medium',
    title: 'Monitor Transparency Reports',
    description: 'Check when services publish law enforcement request statistics.',
    action: 'Review service links below',
    link: null
  });

  recommendations.push({
    type: 'legal-prep',
    priority: 'low',
    title: 'Know Your Rights',
    description: 'Learn about warrants, subpoenas, and how to respond to law enforcement requests.',
    resources: [
      { name: "EFF's Guide to Law Enforcement Requests", url: 'https://ssd.eff.org/' },
      { name: 'Digital Rights Watch', url: 'https://digitalrightswatch.org/' }
    ]
  });

  return recommendations;
}
