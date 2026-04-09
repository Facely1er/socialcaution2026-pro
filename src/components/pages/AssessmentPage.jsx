import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, FileCheck, Clock, ChevronDown, ChevronUp, ArrowRight, CheckCircle, Zap } from 'lucide-react';
import AssessmentNav from '../navigation/AssessmentNav';
import EnhancedBreadcrumbs from '../common/EnhancedBreadcrumbs';
import ThemeToggle from '../common/ThemeToggle';
import { useTranslation } from '../../contexts/TranslationContext';

const AssessmentPage = () => {
  const { t } = useTranslation();
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);

  const assessments = [
    {
      id: 'exposure',
      title: t('assessmentPage.assessments.exposure.title'),
      description: t('assessmentPage.assessments.exposure.description'),
      icon: Search,
      color: 'red',
      duration: t('assessmentPage.assessments.exposure.duration'),
      path: '/assessment/exposure',
      features: t('assessmentPage.assessments.exposure.features')
    },
    {
      id: 'rights',
      title: t('assessmentPage.assessments.rights.title'),
      description: t('assessmentPage.assessments.rights.description'),
      icon: FileCheck,
      color: 'orange',
      duration: t('assessmentPage.assessments.rights.duration'),
      path: '/assessment/privacy-rights',
      features: t('assessmentPage.assessments.rights.features')
    }
  ];

  const colorClasses = {
    red:    { bg: 'bg-red-500',    hover: 'hover:bg-red-600',    text: 'text-red-600',    bgLight: 'bg-red-50 dark:bg-red-900/20' },
    orange: { bg: 'bg-orange-500', hover: 'hover:bg-orange-600', text: 'text-orange-600', bgLight: 'bg-orange-50 dark:bg-orange-900/20' },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <AssessmentNav />

          <div className="flex-1">
            {/* Value hook — replaces the blocking disclaimer */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Privacy Assessments
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold">
                  <Zap className="w-3 h-3" />
                  Free · No signup
                </span>
              </div>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-3">
                Two assessments. 15 minutes total. A full picture of your privacy exposure <em>and</em> your rights.
              </p>

              {/* Collapsible disclaimer */}
              <button
                type="button"
                onClick={() => setDisclaimerOpen(v => !v)}
                className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {disclaimerOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {disclaimerOpen ? 'Hide' : 'What this assessment covers'}
              </button>
              {disclaimerOpen && (
                <div className="mt-2 p-4 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{t('assessmentPage.educationalDisclaimer.title')}</p>
                  <p>{t('assessmentPage.educationalDisclaimer.intro')}</p>
                  <ul className="list-disc list-inside space-y-1">
                    {t('assessmentPage.educationalDisclaimer.provides').map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                  <p>{t('assessmentPage.educationalDisclaimer.notProvides')}</p>
                  <ul className="list-disc list-inside space-y-1">
                    {t('assessmentPage.educationalDisclaimer.notProvidesList').map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              )}
            </motion.div>

            {/* Assessment Cards — 2-col, centred */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 max-w-3xl">
              {assessments.map((assessment, index) => {
                const Icon = assessment.icon;
                const colors = colorClasses[assessment.color];
                return (
                  <motion.div
                    key={assessment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="h-full"
                  >
                    <Link to={assessment.path} className="h-full block group">
                      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 h-full hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col">
                        {/* Header */}
                        <div className="flex items-start mb-4">
                          <div className={`p-3 ${colors.bgLight} rounded-lg mr-4 flex-shrink-0`}>
                            <Icon className={`h-7 w-7 ${colors.text} dark:text-${assessment.color}-400`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-orange-500 transition-colors">
                              {assessment.title}
                            </h3>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <Clock className="h-3.5 w-3.5 mr-1.5" />
                              <span className="font-medium">{assessment.duration}</span>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 leading-relaxed flex-1">
                          {assessment.description}
                        </p>

                        {/* Features */}
                        <div className="space-y-2 mb-5">
                          {assessment.features.map((feature, fi) => (
                            <div key={fi} className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                              <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-2 flex-shrink-0" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>

                        {/* CTA */}
                        <div className={`w-full text-center py-3 px-5 rounded-lg ${colors.bg} ${colors.hover} text-white font-semibold text-sm transition-all flex items-center justify-center gap-2`}>
                          <span>{t('assessmentPage.startAssessment')}</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Do-both nudge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-10 max-w-3xl"
            >
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 flex items-start gap-3">
                <Zap className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-indigo-800 dark:text-indigo-200">
                  <strong>Get the full picture.</strong> Doing both assessments unlocks your combined Privacy Score and a personalised action plan in your dashboard.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentPage;
