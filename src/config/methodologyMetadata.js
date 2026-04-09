/**
 * Methodology and data-source freshness registry.
 * Keep this updated whenever scoring logic or curated source data changes.
 */
export const METHODOLOGY_METADATA = {
  version: '2.5.0',
  releasedOn: '2026-02-26',
  lastReviewedOn: '2026-03-27',
  scoringModel: 'Unified 8-factor model across all tiers',
  expectedEnhancedServiceCount: 222,
  breachDetectionApproach: 'Structured breach records (with source URLs) plus keyword fallback'
};

export const DATA_SOURCE_FRESHNESS = [
  {
    id: 'enhanced-catalog',
    name: 'Enhanced service catalog',
    file: 'src/data/serviceCatalogEnhanced.js',
    lastUpdated: '2026-03-27',
    cadence: 'Quarterly + major incident updates',
    notes: '222 enhanced services with metadata, policy links, and structured breach entries'
  },
  {
    id: 'risk-profiles',
    name: 'Service risk profiles',
    file: 'src/data/serviceRiskProfiles.js',
    lastUpdated: '2026-02-26',
    cadence: 'Quarterly + regulatory/news refresh',
    notes: 'Typical risks, known issues, regulations, and recommended actions'
  },
  {
    id: 'relationships',
    name: 'Service relationship graph',
    file: 'src/data/serviceRelationships.js',
    lastUpdated: '2026-02-26',
    cadence: 'As parent-company structures change',
    notes: 'Parent/sibling mapping for factor 5 and sharing-network context'
  },
  {
    id: 'breach-intelligence',
    name: 'Breach intelligence signals',
    file: 'src/utils/privacyExposureIndex.js',
    lastUpdated: '2026-02-26',
    cadence: 'When breach entries or detection heuristics are updated',
    notes: 'Prefers structured breach incidents (source_url) with keyword fallback from known issues'
  },
  {
    id: 'privacy-radar-feeds',
    name: 'Privacy Radar / Trends feeds',
    file: 'src/data/rssFeeds.js',
    lastUpdated: '2026-02-26',
    cadence: 'Feed health review monthly',
    notes: 'External public feeds that inform curation and situational awareness'
  }
];

