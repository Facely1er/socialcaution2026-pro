/**
 * Audit: Enhanced service risk-profile coverage
 *
 * Verifies that all enhanced catalog services have matching risk profiles.
 * Intended for methodology quality gates and release checks.
 */

import { enhancedServiceCatalog } from '../src/data/serviceCatalogEnhanced.js';
import { serviceRiskProfiles } from '../src/data/serviceRiskProfiles.js';

const EXPECTED_ENHANCED_SERVICES = 201;

function uniqueDuplicates(items) {
  const seen = new Set();
  const dupes = new Set();
  items.forEach(item => {
    if (seen.has(item)) dupes.add(item);
    else seen.add(item);
  });
  return Array.from(dupes).sort();
}

function formatList(ids) {
  return ids.length === 0 ? 'None' : ids.join(', ');
}

function main() {
  const enhancedIds = enhancedServiceCatalog.map(service => service.id);
  const riskProfileIds = Object.keys(serviceRiskProfiles);

  const enhancedSet = new Set(enhancedIds);
  const riskProfileSet = new Set(riskProfileIds);

  const duplicateEnhancedIds = uniqueDuplicates(enhancedIds);
  const missingRiskProfiles = enhancedIds.filter(id => !riskProfileSet.has(id));
  const orphanRiskProfiles = riskProfileIds.filter(id => !enhancedSet.has(id));

  const malformedRiskProfiles = enhancedIds.filter(id => {
    const profile = serviceRiskProfiles[id];
    return !profile ||
      !Array.isArray(profile.typicalRisks) ||
      !Array.isArray(profile.knownIssues) ||
      !Array.isArray(profile.recommendedActions) ||
      !Array.isArray(profile.regulations);
  });

  const checks = [
    {
      ok: enhancedIds.length === EXPECTED_ENHANCED_SERVICES,
      label: `Enhanced catalog count is ${EXPECTED_ENHANCED_SERVICES}`,
      detail: `Found: ${enhancedIds.length}`
    },
    {
      ok: duplicateEnhancedIds.length === 0,
      label: 'No duplicate enhanced service IDs',
      detail: formatList(duplicateEnhancedIds)
    },
    {
      ok: missingRiskProfiles.length === 0,
      label: 'Every enhanced service has a risk profile',
      detail: formatList(missingRiskProfiles)
    },
    {
      ok: orphanRiskProfiles.length === 0,
      label: 'No orphan risk profiles (outside enhanced catalog)',
      detail: formatList(orphanRiskProfiles)
    },
    {
      ok: malformedRiskProfiles.length === 0,
      label: 'Risk profiles include required array fields',
      detail: formatList(malformedRiskProfiles)
    }
  ];

  console.log('\n=== Enhanced Service Risk Profile Coverage Audit ===\n');
  checks.forEach(check => {
    const icon = check.ok ? 'PASS' : 'FAIL';
    console.log(`[${icon}] ${check.label}`);
    if (!check.ok) {
      console.log(`       ${check.detail}`);
    }
  });

  const allPassed = checks.every(check => check.ok);
  console.log('\nSummary');
  console.log(`- Enhanced services: ${enhancedIds.length}`);
  console.log(`- Risk profiles: ${riskProfileIds.length}`);
  console.log(`- Missing profiles: ${missingRiskProfiles.length}`);
  console.log(`- Orphan profiles: ${orphanRiskProfiles.length}`);

  if (!allPassed) {
    console.error('\nCoverage audit failed.');
    process.exitCode = 1;
    return;
  }

  console.log('\nCoverage audit passed.');
}

main();

