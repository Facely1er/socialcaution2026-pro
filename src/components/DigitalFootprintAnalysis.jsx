import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Shield, AlertTriangle, TrendingDown, TrendingUp, Globe, Users, ShoppingCart, MessageCircle, Film, Database, BarChart3, Target, ArrowRight, ExternalLink, Gauge, Info, Lock, Sparkles } from 'lucide-react';
import { serviceCatalog } from '../data/serviceCatalog';
import { serviceRiskProfiles } from '../data/serviceRiskProfiles';
import { getToolsByService } from '../data/tools.js';
import { analytics } from '../utils/analytics.js';
import { calculatePrivacyExposureIndex, getExposureLevel } from '../utils/privacyExposureIndex';
import { calculateDigitalFootprintFromServices } from '../utils/digitalFootprintCalculator';

const DigitalFootprintAnalysis = ({ assessmentResults, selectedServices, persona }) => {
  const navigate = useNavigate();

  const getCategoryIcon = (category) => {
    const icons = {
      'social-media': Users,
      'shopping': ShoppingCart,
      'messaging': MessageCircle,
      'streaming': Film,
      'search-email': Globe,
      'cloud-storage': Database,
      'financial': Shield
    };
    return icons[category] || Activity;
  };

  const formatCategoryLabel = (category) => {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Analyze footprint data using combined features usage results
  const footprintData = useMemo(() => {
    if (!assessmentResults && (!selectedServices || selectedServices.length === 0)) {
      return null;
    }

    const exposureResults = assessmentResults?.exposureResults || {};
    const rightsResults = assessmentResults?.rightsResults || {};
    const exposureScore = assessmentResults?.exposureScore || 0;
    const rightsScore = assessmentResults?.rightsScore || 0;

    // Use the calculator utility for combined features usage results summary report
    const digitalFootprintReport = calculateDigitalFootprintFromServices(selectedServices || [], assessmentResults);
    
    // Service analysis
    const services = selectedServices || [];
    const serviceCategories = {};
    const serviceRisks = [];

    // Build service risks from the report
    digitalFootprintReport.services.forEach(serviceEval => {
      const service = serviceCatalog.find(s => s.id === serviceEval.serviceId);
      if (service) {
        const category = service.category || 'other';
        serviceCategories[category] = (serviceCategories[category] || 0) + 1;
        
        serviceRisks.push({
          id: serviceEval.serviceId,
          name: serviceEval.serviceName,
          category: category,
          riskLevel: serviceEval.riskCount,
          risks: serviceEval.typicalRisks || [],
          exposureIndex: serviceEval.exposureIndex,
          exposureLevel: getExposureLevel(serviceEval.exposureIndex)
        });
      }
    });
    
    // Get average exposure index from report
    const averageExposureIndex = digitalFootprintReport.averageExposureIndex;
    const averageExposureLevel = getExposureLevel(averageExposureIndex);

    // Social footprint analysis
    const socialFootprint = {
      usage: exposureResults.socialMediaUse || 'unknown',
      sharing: exposureResults.publicSharing || 'unknown',
      riskLevel: 'moderate'
    };

    if (socialFootprint.usage === 'heavy' || socialFootprint.usage === 'daily') {
      socialFootprint.riskLevel = 'high';
    } else if (socialFootprint.usage === 'never') {
      socialFootprint.riskLevel = 'low';
    }

    if (socialFootprint.sharing === 'everything' || socialFootprint.sharing === 'frequently') {
      socialFootprint.riskLevel = 'high';
    }

    // Data exposure analysis
    const dataExposure = {
      passwordManagement: exposureResults.passwordManagement || 'unknown',
      dataSharing: exposureResults.dataSharing || 'unknown',
      deviceSecurity: exposureResults.deviceSecurity || 'unknown',
      publicWiFi: exposureResults.publicWiFi || 'unknown',
      riskScore: 0
    };

    // Calculate data exposure risk
    if (dataExposure.passwordManagement === 'same' || dataExposure.passwordManagement === 'variations') {
      dataExposure.riskScore += 25;
    }
    if (dataExposure.dataSharing === 'noReview' || dataExposure.dataSharing === 'quickReview') {
      dataExposure.riskScore += 15;
    }
    if (dataExposure.deviceSecurity === 'minimal' || dataExposure.deviceSecurity === 'basic') {
      dataExposure.riskScore += 15;
    }
    if (dataExposure.publicWiFi === 'frequent' || dataExposure.publicWiFi === 'occasional') {
      dataExposure.riskScore += 10;
    }

    // Overall footprint score from the calculator (uses combined features usage results)
    const footprintScore = digitalFootprintReport.score;

    // Category breakdown from report
    const categoryBreakdown = digitalFootprintReport.categoryBreakdown.map(cat => ({
      category: cat.category,
      count: cat.count,
      icon: getCategoryIcon(cat.category),
      label: formatCategoryLabel(cat.category)
    }));

    // Generate recommendations
    const recommendations = generateRecommendations(
      exposureResults,
      rightsResults,
      services,
      serviceRisks,
      socialFootprint,
      dataExposure
    );

    return {
      footprintScore,
      totalServices: services.length,
      serviceCategories: categoryBreakdown,
      serviceRisks: serviceRisks.sort((a, b) => {
        // Sort by exposure index first (highest first), then by risk level
        const exposureA = a.exposureIndex || 0;
        const exposureB = b.exposureIndex || 0;
        if (exposureB !== exposureA) {
          return exposureB - exposureA;
        }
        return b.riskLevel - a.riskLevel;
      }),
      socialFootprint,
      dataExposure,
      exposureScore,
      rightsScore,
      recommendations,
      overallRisk: digitalFootprintReport.riskLevel,
      averageExposureIndex,
      averageExposureLevel,
      breakdown: digitalFootprintReport.breakdown // Include breakdown from calculator
    };
  }, [assessmentResults, selectedServices, persona]);

  const generateRecommendations = (exposureResults, rightsResults, services, serviceRisks, socialFootprint, dataExposure) => {
    const recommendations = [];

    // High-risk service recommendations
    const highRiskServices = serviceRisks.filter(s => s.riskLevel >= 3).slice(0, 3);
    if (highRiskServices.length > 0) {
      recommendations.push({
        type: 'service',
        priority: 'high',
        title: 'Review High-Risk Services',
        description: `You're using ${highRiskServices.length} service(s) with significant privacy risks. Review their privacy settings and consider data minimization.`,
        services: highRiskServices.map(s => s.name),
        action: { label: 'View Services Monitoring', url: '/service-catalog' }
      });
    }

    // Social footprint recommendations
    if (socialFootprint.riskLevel === 'high') {
      recommendations.push({
        type: 'social',
        priority: 'high',
        title: 'Reduce Social Media Exposure',
        description: 'Your social media usage and sharing patterns create a large digital footprint. Consider reducing public sharing and reviewing privacy settings.',
        action: { label: 'Social Media Privacy Guide', url: '/toolkit-access' }
      });
    }

    // Data exposure recommendations
    if (dataExposure.riskScore >= 30) {
      recommendations.push({
        type: 'security',
        priority: 'high',
        title: 'Improve Security Practices',
        description: 'Your password management, device security, or data sharing practices increase your exposure risk.',
        action: { label: 'Security Tools', url: '/toolkit-access' }
      });
    }

    // Service count recommendations
    if (services.length > 10) {
      recommendations.push({
        type: 'minimization',
        priority: 'moderate',
        title: 'Consider Service Consolidation',
        description: `You're using ${services.length} services, which increases your digital footprint. Consider consolidating or removing unused accounts.`,
        action: { label: 'Review Services', url: '/service-catalog' }
      });
    }

    // Rights exercise recommendations
    if (rightsResults && assessmentResults?.rightsScore < 50) {
      recommendations.push({
        type: 'rights',
        priority: 'moderate',
        title: 'Exercise Your Privacy Rights',
        description: 'You can reduce your digital footprint by exercising your rights to access, delete, or limit data collection.',
        action: { label: 'Privacy Rights Tools', url: '/toolkit-access' }
      });
    }

    return recommendations;
  };

  if (!footprintData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-8 text-center">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Digital Footprint Analysis
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            To get your digital footprint analysis, please complete a privacy assessment and add services to your Services Monitoring.
          </p>
          <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 p-3 mb-6 rounded-r">
            <p className="text-xs text-purple-900 dark:text-purple-200">
              <strong>What is Digital Footprint Score?</strong> Your personal privacy exposure score calculated from the Service Exposure Indices 
              of services you use. This is different from individual Service Exposure Indices shown for each service in the catalog.
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/assessment')}
              className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium flex items-center gap-2"
            >
              Take Assessment
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/service-catalog')}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors font-medium"
            >
              Add Services
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { footprintScore, totalServices, serviceCategories, serviceRisks, socialFootprint, dataExposure, recommendations, overallRisk, averageExposureIndex, averageExposureLevel } = footprintData;

  const riskBgColor = overallRisk === 'high' ? 'bg-red-100 dark:bg-red-900/30' : overallRisk === 'moderate' ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-green-100 dark:bg-green-900/30';
  const riskTextColor = overallRisk === 'high' ? 'text-red-700 dark:text-red-400' : overallRisk === 'moderate' ? 'text-yellow-700 dark:text-yellow-400' : 'text-green-700 dark:text-green-400';

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [showScoreInfo, setShowScoreInfo] = useState(false);

  const isPremium = (() => {
    try {
      const sub = JSON.parse(localStorage.getItem('socialcaution_subscription') || '{}');
      return sub.tier === 'premium' || sub.tier === 'family';
    } catch { return false; }
  })();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            Digital Privacy Footprint
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            {selectedServices && selectedServices.length > 0
              ? `Based on ${selectedServices.length} service${selectedServices.length !== 1 ? 's' : ''} from your Services Monitoring`
              : 'Based on your assessment results'}
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex-shrink-0 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm"
        >
          ← Dashboard
        </button>
      </div>

      {/* Score + key metrics row */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-5 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          {/* Big score */}
          <div className="text-center flex-shrink-0">
            <div className={`text-6xl font-bold ${riskTextColor}`}>{footprintScore}</div>
            <div className={`mt-1 px-3 py-1 rounded-full text-xs font-semibold ${riskBgColor} ${riskTextColor} inline-block`}>
              {overallRisk.toUpperCase()} FOOTPRINT
            </div>
          </div>
          {/* Interpretive text + metrics */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              {footprintScore >= 70
                ? 'Your digital footprint is large. Take action to reduce your online exposure.'
                : footprintScore >= 40
                ? 'Your digital footprint is moderate. There are clear opportunities to reduce exposure.'
                : 'Your digital footprint is relatively small. Keep up the good practices!'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">{totalServices}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Services</div>
              </div>
              {averageExposureIndex !== null && (
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2 text-center">
                  <div className={`text-lg font-bold ${averageExposureLevel.textColor}`}>{averageExposureIndex}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Avg. Exposure</div>
                </div>
              )}
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">{100 - footprintData.exposureScore}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Exposure Risk</div>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white capitalize">{socialFootprint.usage}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Social Use</div>
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible "How scores work" — single source of truth for all explanations */}
        <div className="mt-4 border-t border-gray-100 dark:border-slate-700 pt-3">
          <button
            type="button"
            onClick={() => setShowScoreInfo(v => !v)}
            className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            {showScoreInfo ? 'Hide' : 'How are these scores calculated?'}
          </button>
          {showScoreInfo && (
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <p><strong>Digital Footprint Score (0–100)</strong> — aggregated from the Privacy Exposure Indices of your tracked services. Higher = more risk.</p>
              <p><strong>Avg. Exposure Index</strong> — the mean Privacy Exposure Index across your services (each shown individually in the catalog).</p>
              <p><strong>Combined Risk Score</strong> — your assessment score (60%) + this footprint score (40%).</p>
              {selectedServices && selectedServices.length > 0 && (
                <button onClick={() => navigate('/service-catalog')} className="text-blue-600 dark:text-blue-400 hover:underline font-medium mt-1 block">
                  View individual service indices →
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Factor-level detail — Premium gated */}
      {isPremium ? (
        <>
          {/* Service Categories */}
          {serviceCategories.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-6 h-6" />
                Services by Category
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {serviceCategories.map((cat) => {
                  const Icon = getCategoryIcon(cat.category);
                  return (
                    <div key={cat.category} className="text-center p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <Icon className="w-8 h-8 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{cat.count}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">{cat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* High-Risk Services */}
          {serviceRisks.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                High-Risk Services
              </h3>
              <div className="space-y-3">
                {serviceRisks.slice(0, 5).map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white">{service.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {service.risks.length} known privacy risks
                        {service.exposureIndex !== null && (
                          <span className={`ml-2 font-medium ${service.exposureLevel.textColor}`}>
                            • Exposure: {service.exposureIndex}/100
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {service.exposureIndex !== null && (
                        <div className="flex items-center gap-1">
                          <Gauge className={`w-4 h-4 ${service.exposureLevel.textColor}`} />
                          <span className={`text-xs font-medium ${service.exposureLevel.textColor}`}>
                            {service.exposureIndex}
                          </span>
                        </div>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        service.riskLevel >= 3 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        service.riskLevel >= 2 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {service.riskLevel >= 3 ? 'High Risk' : service.riskLevel >= 2 ? 'Moderate' : 'Low Risk'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                Personalized Recommendations
              </h3>
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    rec.priority === 'high'
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                  }`}>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{rec.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{rec.description}</p>
                      {rec.services && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          Services: {rec.services.join(', ')}
                        </div>
                      )}
                      {rec.action && (
                        <button
                          onClick={() => navigate(rec.action.url)}
                          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                          {rec.action.label}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Free tier — premium upgrade gate */
        <div className="relative mb-6 rounded-xl overflow-hidden border border-purple-200 dark:border-purple-800">
          {/* Blurred preview of what's behind the gate */}
          <div className="opacity-20 blur-sm pointer-events-none select-none p-6 space-y-4" aria-hidden="true">
            <div className="h-6 w-48 bg-gray-300 dark:bg-slate-600 rounded" />
            <div className="grid grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-200 dark:bg-slate-700 rounded-lg" />)}
            </div>
            <div className="h-6 w-40 bg-gray-300 dark:bg-slate-600 rounded mt-4" />
            {[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 dark:bg-slate-700 rounded-lg" />)}
          </div>
          {/* Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 p-8 text-center">
            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/40 rounded-2xl flex items-center justify-center mb-4">
              <Lock className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-base font-bold text-gray-900 dark:text-white mb-2">
              Factor-level detail is a Premium feature
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 max-w-sm">
              Upgrade to see your per-category breakdown, high-risk service list, and personalised action recommendations.
            </p>
            <button
              onClick={() => navigate('/pricing')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              Unlock with Premium — $2.99/mo
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/toolkit-access')}
          className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium flex items-center justify-center gap-2"
        >
          View Privacy Tools
          <ExternalLink className="w-5 h-5" />
        </button>
        <button
          onClick={() => navigate('/service-catalog')}
          className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors font-medium"
        >
          Manage Services
        </button>
      </div>
    </div>
  );
};

export default DigitalFootprintAnalysis;

