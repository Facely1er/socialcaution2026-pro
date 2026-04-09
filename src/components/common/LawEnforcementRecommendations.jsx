import React, { useMemo } from 'react';
import { Scale, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { calculateLawEnforcementScore, getLawEnforcementRiskLevel, getLawEnforcementVulnerabilities, getLawEnforcementRecommendations } from '../../utils/lawEnforcementScoring';
import { serviceRiskProfiles } from '../../data/serviceRiskProfiles';
import { useTranslation } from '../../contexts/TranslationContext';

/**
 * Law Enforcement Transparency block.
 * Separate from the Privacy Exposure Index (8-factor methodology). Shows LE-only scores and recommendations.
 * @param {{ selectedServices: string[], compact?: boolean }} props - selectedServices = array of service ids; compact = smaller layout for catalog
 */
const LawEnforcementRecommendations = ({ selectedServices = [], compact = false }) => {
  const { t } = useTranslation();
  const serviceScores = useMemo(() => {
    return (selectedServices || [])
      .map((serviceId) => {
        const leProfile = serviceRiskProfiles[serviceId]?.lawEnforcementPractices;
        if (!leProfile) return null;
        const score = calculateLawEnforcementScore(leProfile);
        return {
          serviceId,
          score,
          riskLevel: getLawEnforcementRiskLevel(score),
          vulnerabilities: getLawEnforcementVulnerabilities(leProfile),
          profile: leProfile
        };
      })
      .filter(Boolean);
  }, [selectedServices]);

  const avgScore = useMemo(() => {
    if (serviceScores.length === 0) return 50;
    return Math.round(
      serviceScores.reduce((sum, s) => sum + s.score, 0) / serviceScores.length
    );
  }, [serviceScores]);

  const highRisk = serviceScores.filter((s) => s.score > 40);
  const moderateRisk = serviceScores.filter((s) => s.score > 20 && s.score <= 40);
  const lowRisk = serviceScores.filter((s) => s.score <= 20);
  const recommendations = getLawEnforcementRecommendations(avgScore);
  const overallLevel = getLawEnforcementRiskLevel(avgScore);

  if (serviceScores.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-purple-200 dark:border-purple-800 p-6">
        <div className="flex items-center gap-3 mb-2">
          <Scale className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Law Enforcement Transparency
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Add services to your list to see how they handle law enforcement requests, warrants, and transparency.
        </p>
      </div>
    );
  }

  const serviceName = (id) => id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-purple-200 dark:border-purple-800 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Scale className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0" />
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Law Enforcement Transparency
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            How your selected services handle government data requests (separate from Privacy Exposure Index).
          </p>
        </div>
      </div>

      {/* Overall score */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 mb-4 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">{t('dashboard.leRiskScoreOverall')}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">{avgScore}</span>
              <span className="text-gray-500 dark:text-gray-400">/100</span>
            </div>
          </div>
          <span className="text-3xl" aria-hidden>{overallLevel.badge}</span>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
          <strong>{overallLevel.label}</strong>
          {avgScore <= 20 && ' — Your services have strong protections against law enforcement data requests.'}
          {avgScore > 20 && avgScore <= 40 && ' — Moderate protections. Consider reviewing policies.'}
          {avgScore > 40 && ' — Weak protections. Consider more privacy-protective services.'}
        </p>
      </div>

      {/* Per-service breakdown */}
      {!compact && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">By service</h4>
          {highRisk.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> High risk ({highRisk.length})
              </p>
              <div className="space-y-2">
                {highRisk.map((s) => (
                  <ServiceLeCard key={s.serviceId} {...s} serviceName={serviceName} />
                ))}
              </div>
            </div>
          )}
          {moderateRisk.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 mb-1.5">Moderate risk ({moderateRisk.length})</p>
              <div className="space-y-2">
                {moderateRisk.map((s) => (
                  <ServiceLeCard key={s.serviceId} {...s} serviceName={serviceName} />
                ))}
              </div>
            </div>
          )}
          {lowRisk.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1.5 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Low risk ({lowRisk.length})
              </p>
              <div className="space-y-2">
                {lowRisk.map((s) => (
                  <ServiceLeCard key={s.serviceId} {...s} serviceName={serviceName} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Recommendations</h4>
        <ul className="space-y-2">
          {recommendations.map((rec, idx) => (
            <li
              key={idx}
              className={`text-sm rounded-lg border-l-4 pl-3 py-2 ${
                rec.priority === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
                rec.priority === 'high' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500' :
                'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
              }`}
            >
              <span className="font-medium text-gray-900 dark:text-white">{rec.title}</span>
              <p className="text-gray-700 dark:text-gray-300 mt-0.5">{rec.description}</p>
              {rec.link && (
                <a href={rec.link} className="text-xs text-blue-600 dark:text-blue-400 underline mt-1 inline-block">
                  {rec.action} →
                </a>
              )}
              {rec.resources && (
                <ul className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 space-y-0.5">
                  {rec.resources.map((r, i) => (
                    <li key={i}>
                      · <a href={r.url} target="_blank" rel="noopener noreferrer" className="underline">{r.name}</a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Learn more */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2 text-sm">
          <FileText className="w-4 h-4" /> Learn more
        </h4>
        <ul className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
          <li>· <a href="https://ssd.eff.org/" target="_blank" rel="noopener noreferrer" className="underline">EFF&apos;s Guide to Law Enforcement Requests</a></li>
          <li>· <a href="https://www.aclu.org/" target="_blank" rel="noopener noreferrer" className="underline">ACLU: Know Your Rights</a></li>
          <li>· <a href="https://digitalrightswatch.org/" target="_blank" rel="noopener noreferrer" className="underline">Digital Rights Watch</a></li>
        </ul>
      </div>
    </div>
  );
};

function ServiceLeCard({ serviceId, score, riskLevel, vulnerabilities, profile, serviceName }) {
  const name = serviceName(serviceId);
  const colorClasses = {
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300',
    orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300',
    red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
  };
  const cls = colorClasses[riskLevel.color] || colorClasses.yellow;
  return (
    <div className={`p-2.5 rounded-lg border ${cls}`}>
      <div className="flex justify-between items-start gap-2">
        <div>
          <p className="font-semibold text-gray-900 dark:text-white capitalize">{name}</p>
          <p className="text-xs">{riskLevel.label}</p>
        </div>
        <span className="text-lg font-bold text-gray-600 dark:text-gray-400">{score}</span>
      </div>
      {vulnerabilities.length > 0 && (
        <ul className="text-xs mt-1.5 space-y-0.5 text-gray-700 dark:text-gray-300">
          {vulnerabilities.slice(0, 2).map((v, i) => (
            <li key={i}>⚠ {v.issue}</li>
          ))}
        </ul>
      )}
      {profile?.transparencyReportUrl && (
        <a
          href={profile.transparencyReportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 dark:text-blue-400 underline mt-1.5 inline-block"
        >
          View transparency report →
        </a>
      )}
    </div>
  );
}

export default LawEnforcementRecommendations;
