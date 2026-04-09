import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Target, AlertCircle, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { privacyConcernCategories, migrateConcerns, getConcernLabel } from '../../data/privacyConcerns';
import { getIconComponent } from '../../utils/iconMapping.js';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import SEOHead from '../common/SEOHead';
import { useTranslation } from '../../contexts/TranslationContext';
import EmailCaptureModal from '../lead/EmailCaptureModal';

const PersonaSelection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [personaFromStorage, setPersonaFromStorage] = useLocalStorage('socialcaution_persona', null);
  const [selectedConcerns, setSelectedConcerns] = useState([]);
  // All categories start expanded so users see their options immediately
  const [expandedCategories, setExpandedCategories] = useState(() => {
    const initial = {};
    privacyConcernCategories.forEach(c => { initial[c.id] = true; });
    return initial;
  });
  const [submitting, setSubmitting] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (personaFromStorage?.customConcerns && personaFromStorage.customConcerns.length > 0) {
      const migratedConcerns = migrateConcerns(personaFromStorage.customConcerns);
      setSelectedConcerns(migratedConcerns);
    } else if (personaFromStorage?.primary) {
      if (privacyConcernCategories.length > 0 && privacyConcernCategories[0].concerns.length > 0) {
        setSelectedConcerns([privacyConcernCategories[0].concerns[0].id]);
      }
    }
  }, [personaFromStorage]);

  const handleCategoryToggle = (categoryId) => {
    const category = privacyConcernCategories.find(c => c.id === categoryId);
    if (!category) return;
    const categoryConcernIds = category.concerns.map(c => c.id);
    const allCategoryConcernsSelected = categoryConcernIds.every(id => selectedConcerns.includes(id));
    setSelectedConcerns(prev => {
      if (allCategoryConcernsSelected) {
        const newConcerns = prev.filter(c => !categoryConcernIds.includes(c));
        if (newConcerns.length === 0) {
          const otherCategory = privacyConcernCategories.find(cat => cat.id !== categoryId);
          if (otherCategory && otherCategory.concerns.length > 0) return [otherCategory.concerns[0].id];
          return prev;
        }
        return newConcerns;
      } else {
        const newConcerns = [...prev];
        categoryConcernIds.forEach(id => { if (!newConcerns.includes(id)) newConcerns.push(id); });
        return newConcerns;
      }
    });
    setValidationError('');
  };

  const handleConcernToggle = (concernId) => {
    setSelectedConcerns(prev => {
      if (prev.includes(concernId)) {
        const newConcerns = prev.filter(c => c !== concernId);
        if (newConcerns.length === 0) return prev;
        return newConcerns;
      }
      return [...prev, concernId];
    });
    setValidationError('');
  };

  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const handleContinue = () => {
    if (selectedConcerns.length === 0) {
      setValidationError('Please select at least one privacy concern');
      return;
    }
    setSubmitting(true);
    setValidationError('');
    const personaData = {
      primary: 'custom',
      confidence: 1.0,
      customConcerns: selectedConcerns,
      selectedAt: new Date().toISOString()
    };
    setPersonaFromStorage(personaData);
    setShowEmailCapture(true);
    setSubmitting(false);
  };

  const handleEmailCaptureClose = () => {
    setShowEmailCapture(false);
    navigate('/service-catalog');
  };

  const handleSkip = () => navigate('/service-catalog');

  const categoryIconMap = { family: 'Users', financial: 'Shield', work: 'Briefcase', social: 'Camera' };
  const categoryColorMap = { family: 'blue', financial: 'green', work: 'orange', social: 'purple' };
  const colorClasses = {
    blue:   { bg: 'bg-blue-50 dark:bg-blue-900/20',   border: 'border-blue-200 dark:border-blue-800',   accent: 'text-blue-600 dark:text-blue-400',   chip: 'bg-blue-500 text-white border-blue-500',   chipHover: 'hover:border-blue-400' },
    green:  { bg: 'bg-green-50 dark:bg-green-900/20',  border: 'border-green-200 dark:border-green-800',  accent: 'text-green-600 dark:text-green-400',  chip: 'bg-green-500 text-white border-green-500',  chipHover: 'hover:border-green-400' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-900/20',border: 'border-orange-200 dark:border-orange-800',accent: 'text-orange-600 dark:text-orange-400',chip: 'bg-orange-500 text-white border-orange-500',chipHover: 'hover:border-orange-400' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20',border: 'border-purple-200 dark:border-purple-800',accent: 'text-purple-600 dark:text-purple-400',chip: 'bg-purple-500 text-white border-purple-500',chipHover: 'hover:border-purple-400' },
  };
  const categoryKeyMap = { family: 'family-children', financial: 'financial-identity', work: 'work-professional', social: 'social-reputation' };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {showEmailCapture && selectedConcerns.length > 0 && (
        <EmailCaptureModal
          isOpen={showEmailCapture}
          onClose={handleEmailCaptureClose}
          context="concerns"
          offer="Get personalized privacy tips based on your selected concerns"
        />
      )}
      <SEOHead
        title="Privacy Concerns | SocialCaution"
        description="Set your privacy concerns to receive personalized recommendations tailored to your priorities."
        keywords="privacy concerns, privacy priorities, personalized privacy"
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-12 sm:pb-16">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-red-500 rounded-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              What privacy matters to you?
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
            Pick the areas you care about. Your choices personalise recommendations across the dashboard and toolkit.
          </p>
        </div>

        {/* Validation error */}
        {validationError && (
          <div className="mb-5 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{validationError}</p>
          </div>
        )}

        {/* Concern categories */}
        <div className="space-y-4 mb-8">
          {privacyConcernCategories.map((category) => {
            const iconName = categoryIconMap[category.id] || 'Users';
            const IconComponent = getIconComponent(iconName);
            const color = categoryColorMap[category.id] || 'blue';
            const colors = colorClasses[color] || colorClasses.blue;
            const translationKey = categoryKeyMap[category.id] || category.id;

            const categoryConcernIds = category.concerns.map(c => c.id);
            const selectedInCategory = categoryConcernIds.filter(id => selectedConcerns.includes(id));
            const allSelected = selectedInCategory.length === categoryConcernIds.length;
            const someSelected = selectedInCategory.length > 0 && !allSelected;
            const isExpanded = expandedCategories[category.id];

            return (
              <div
                key={category.id}
                className={`border rounded-xl overflow-hidden transition-colors ${colors.border} ${someSelected || allSelected ? colors.bg : 'bg-white dark:bg-slate-800'}`}
              >
                {/* Category header row */}
                <div className="flex items-center justify-between px-4 py-3 gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-9 h-9 ${colors.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <IconComponent className={`w-4 h-4 ${colors.accent}`} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                        {category.label}
                      </h3>
                      {selectedInCategory.length > 0 && (
                        <p className={`text-xs font-medium ${colors.accent}`}>
                          {selectedInCategory.length} selected
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCategoryToggle(category.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                        allSelected
                          ? `${colors.chip} border-current`
                          : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {allSelected ? 'Deselect all' : 'Select all'}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleCategoryExpansion(category.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Concern chips */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100 dark:border-slate-700 pt-3">
                    <div className="flex flex-wrap gap-2">
                      {category.concerns.map((concern) => {
                        const isSelected = selectedConcerns.includes(concern.id);
                        const label = t(
                          `privacyConcernCategories.${translationKey}.concerns.${concern.id}`,
                          { defaultValue: concern.label }
                        );
                        return (
                          <button
                            key={concern.id}
                            type="button"
                            onClick={() => handleConcernToggle(concern.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                              isSelected
                                ? colors.chip
                                : `bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 ${colors.chipHover}`
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sticky action bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={handleContinue}
            disabled={selectedConcerns.length === 0 || submitting}
            className={`w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-base transition-all flex items-center justify-center gap-2 ${
              selectedConcerns.length === 0 || submitting
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Setting up…
              </>
            ) : (
              <>
                {selectedConcerns.length > 0
                  ? `Continue with ${selectedConcerns.length} concern${selectedConcerns.length !== 1 ? 's' : ''}`
                  : 'Select at least one concern'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSkip}
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-4 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            Skip & Browse Services
          </button>
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-5">
          {t('personaSelection.helpText')}
        </p>
      </div>
    </div>
  );
};

export default PersonaSelection;
