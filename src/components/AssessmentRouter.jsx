import React from 'react';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EnhancedBreadcrumbs from './common/EnhancedBreadcrumbs';
import ThemeToggle from './common/ThemeToggle';
import AssessmentLimitChecker from './common/AssessmentLimitChecker';
import PrivacyRightsStartScreen from './assessments/PrivacyRightsStartScreen';
import ExposureStartScreen from './assessments/ExposureStartScreen';
import PrivacyRiskExposure from './assessments/PrivacyRiskExposure';
import PrivacyRightsCheckup from './assessments/PrivacyRightsCheckup';
import AssessmentResults from './assessments/AssessmentResults';
import { analytics } from '../utils/analytics.js';
import { calculateExposureScore, calculateRightsScore } from '../utils/assessmentScoring.js';

const AssessmentRouter = ({ onComplete }) => {
  const { type } = useParams();
  const navigate = useNavigate();

  // Only the two workflow assessments: exposure and rights (privacy-rights is alias for rights)
  const validTypes = ['exposure', 'rights', 'privacy-rights'];
  if (!validTypes.includes(type)) {
    navigate('/assessment');
    return null;
  }

  const [exposureResults, setExposureResults] = useState(null);
  const [rightsResults, setRightsResults] = useState(null);
  const [currentStep, setCurrentStep] = useState('start');

  const handleStartAssessment = () => {
    setCurrentStep('assessment');
  };

  const handleExposureComplete = (results) => {
    setExposureResults(results);

    // Merge with existing assessment-results so workflow tracker sees both exposure and rights when both are done
    try {
      const existing = localStorage.getItem('assessment-results');
      const merged = existing ? JSON.parse(existing) : {};
      const prevData = merged?.data && typeof merged.data === 'object' && !Array.isArray(merged.data) ? merged.data : {};
      localStorage.setItem('assessment-results', JSON.stringify({
        type: prevData.rights ? 'full' : 'exposure',
        data: { ...prevData, exposure: results },
        timestamp: new Date().toISOString()
      }));
    } catch (e) {
      localStorage.setItem('assessment-results', JSON.stringify({
        type: 'exposure',
        data: { exposure: results },
        timestamp: new Date().toISOString()
      }));
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('workflowProgressChange'));
    }
    
    // Track assessment completion with calculated scores
    const exposureScore = calculateExposureScore(results);
    analytics.trackAssessmentComplete('exposure', null, {
      exposureScore,
      rightsScore: 0
    });
    
    setCurrentStep('results');
  };

  const handleRightsComplete = (results) => {
    setRightsResults(results);

    // Merge with existing assessment-results so workflow tracker sees both exposure and rights when both are done
    try {
      const existing = localStorage.getItem('assessment-results');
      const merged = existing ? JSON.parse(existing) : {};
      const prevData = merged?.data && typeof merged.data === 'object' && !Array.isArray(merged.data) ? merged.data : {};
      localStorage.setItem('assessment-results', JSON.stringify({
        type: prevData.exposure ? 'full' : 'rights',
        data: { ...prevData, rights: results },
        timestamp: new Date().toISOString()
      }));
    } catch (e) {
      localStorage.setItem('assessment-results', JSON.stringify({
        type: 'rights',
        data: { rights: results },
        timestamp: new Date().toISOString()
      }));
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('workflowProgressChange'));
    }
    
    // Track assessment completion with calculated scores
    const rightsScore = calculateRightsScore(results);
    analytics.trackAssessmentComplete('rights', null, {
      exposureScore: 0,
      rightsScore
    });
    
    setCurrentStep('results');
  };

  const handleResultsComplete = (persona, userBehavior) => {
    const finalExposureResults = exposureResults;
    const finalRightsResults = rightsResults;

    // Store combined results in localStorage if both assessments completed
    if (finalExposureResults && finalRightsResults) {
      localStorage.setItem('assessment-results', JSON.stringify({
        type: 'full',
        data: {
          exposure: finalExposureResults,
          rights: finalRightsResults
        },
        timestamp: new Date().toISOString()
      }));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('workflowProgressChange'));
      }
    }

    if (onComplete) {
      onComplete(finalExposureResults, finalRightsResults, persona);
    }
    navigate('/dashboard');
  };

  if (currentStep === 'start') {
    // Wrap start screens with AssessmentLimitChecker (only exposure and rights)
    const startScreenContent = (() => {
      if (type === 'privacy-rights' || type === 'rights') {
        return (
          <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
            <div className="max-w-6xl mx-auto px-4">
              <PrivacyRightsStartScreen onStart={handleStartAssessment} />
            </div>
          </div>
        );
      }
      // type === 'exposure'
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
          <div className="max-w-6xl mx-auto px-4">
            <ExposureStartScreen onStart={handleStartAssessment} />
          </div>
        </div>
      );
    })();

    return (
      <AssessmentLimitChecker>
        {startScreenContent}
      </AssessmentLimitChecker>
    );
  }

  if (currentStep === 'assessment') {
    const commonProps = {
      breadcrumbs: <EnhancedBreadcrumbs className="mb-8 sm:mb-12" />,
      themeToggle: <ThemeToggle />
    };

    if (type === 'exposure') {
      return <PrivacyRiskExposure onComplete={handleExposureComplete} {...commonProps} />;
    }
    if (type === 'rights' || type === 'privacy-rights') {
      return <PrivacyRightsCheckup onComplete={handleRightsComplete} {...commonProps} />;
    }
  }

  if (currentStep === 'results') {
      return (
        <AssessmentResults
          exposureResults={exposureResults}
          rightsResults={rightsResults}
          completeAssessmentResults={null}
          actionPlan={null}
          assessmentType={type}
          onComplete={handleResultsComplete}
        breadcrumbs={<EnhancedBreadcrumbs className="mb-8 sm:mb-12" customBreadcrumbs={[
          { name: 'Privacy Toolkit', href: '/toolkit-access', current: false },
          { name: 'Assessment Results', href: '#', current: true }
        ]} />}
        themeToggle={<ThemeToggle />}
      />
    );
  }

  return null;
};

export default AssessmentRouter;