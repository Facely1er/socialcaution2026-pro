import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Lightbulb, Shield, ArrowRight, Info } from 'lucide-react';
import SEOHead from '../common/SEOHead';
import { useTranslation } from '../../contexts/TranslationContext';

const HowItWorksPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const steps = [
    {
      number: 1,
      icon: Search,
      title: 'Select',
      subtitle: 'Explore Services',
      description: 'Browse our catalog of 200+ services and select the ones you use—Facebook, Gmail, TikTok, and more.',
      time: '1 minute',
      remark: 'No signup required',
      color: 'blue'
    },
    {
      number: 2,
      icon: Eye,
      title: 'Check',
      subtitle: 'See Privacy Risks',
      description: 'View detailed service reports with 6-factor privacy analysis, data collection practices, security track records, and privacy ratings. Calculate your digital footprint from selected services.',
      time: '2 minutes',
      remark: 'Instant insights',
      color: 'purple'
    },
    {
      number: 3,
      icon: Lightbulb,
      title: 'Understand',
      subtitle: 'Get Recommendations',
      description: 'See Privacy Concerns-based recommendations and learn how to protect yourself on each platform.',
      time: '5 minutes',
      remark: 'Actionable advice',
      color: 'orange'
    },
    {
      number: 4,
      icon: Shield,
      title: 'Protect',
      subtitle: 'Take Action',
      description: 'Want more? Take our assessment for a complete privacy strategy tailored to your needs.',
      time: 'Optional',
      remark: 'Optional upgrade',
      color: 'green'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <SEOHead
        title="How It Works - SocialCaution Privacy Platform"
        description="Learn how SocialCaution's concerns-based privacy platform works. Discover personalized privacy insights through Privacy-Preserving Personalization driven by your privacy concerns."
        keywords="how privacy assessment works, privacy concerns personalization, personalized privacy recommendations, privacy by design"
        canonicalUrl={`${window.location.origin}/how-it-works`}
      />

      {/* Header Section – on page background */}
      <section className="pt-8 sm:pt-10 pb-8 sm:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="page-title mb-4 sm:mb-6 flex items-center justify-center gap-3 sm:gap-4">
              <div className="p-1.5 sm:p-2 md:p-2.5 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-md flex-shrink-0 flex items-center justify-center">
                <Info className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
              </div>
              <span className="leading-tight">{t('howItWorks.title')}</span>
            </h1>
            <p className="text-xl sm:text-2xl text-red-600 dark:text-red-400 font-semibold mb-2">
              Simple. Fast. Effective.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-200 font-medium mb-2">
              {t('howItWorks.startNoAccount')}
            </p>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Get privacy insights in minutes, no commitment required
            </p>
          </div>
        </div>
      </section>

      {/* 4-Step Cards Section */}
      <section className="py-12 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const colorClasses = {
                blue: {
                  iconBg: 'bg-blue-500',
                  badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
                  timeBadge: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800'
                },
                purple: {
                  iconBg: 'bg-purple-500',
                  badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
                  timeBadge: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800'
                },
                orange: {
                  iconBg: 'bg-orange-500',
                  badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
                  timeBadge: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800'
                },
                green: {
                  iconBg: 'bg-green-500',
                  badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
                  timeBadge: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800'
                }
              };
              const colors = colorClasses[step.color];

              return (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 flex flex-col relative"
                >
                  {/* Number Badge - Top Right */}
                  <div className="absolute -top-3 -right-3">
                    <div className={`w-10 h-10 ${colors.badge} rounded-full flex items-center justify-center font-bold text-lg shadow-lg`}>
                      {step.number}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 ${colors.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <StepIcon className="w-8 h-8 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-1">
                    {step.title}
                  </h3>

                  {/* Subtitle */}
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-3">
                    {step.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 flex-grow text-center">
                    {step.description}
                  </p>

                  {/* Time Badge */}
                  <div className="flex justify-center mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.timeBadge}`}>
                      {step.time}
                    </span>
                  </div>

                  {/* Remark */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    {step.remark}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <button
              type="button"
              onClick={() => navigate('/service-catalog')}
              className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-xl text-lg mb-3 flex items-center gap-2 mx-auto"
            >
              Start Browsing Services
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Takes less than 2 minutes • No signup • Free plan available
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksPage;
