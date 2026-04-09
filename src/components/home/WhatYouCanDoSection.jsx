import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Target, LayoutDashboard, ArrowRight } from 'lucide-react';

/**
 * How It Works — 3-step customer journey.
 * Replaces the old 6-card "What You Can Do" section to reduce choice overload.
 */
const WhatYouCanDoSection = ({ className = '' }) => {
  const navigate = useNavigate();

  const steps = [
    {
      step: '01',
      icon: Shield,
      title: 'Browse Services',
      description: 'Search 200+ apps and platforms to see exactly how they collect, share, and protect your data — with a clear privacy risk score for each.',
      linkText: 'Open Service Catalog',
      action: () => navigate('/service-catalog'),
      iconBg: 'bg-red-500',
      accent: 'text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300',
    },
    {
      step: '02',
      icon: Target,
      title: 'Take a Privacy Assessment',
      description: 'Answer a short set of questions about your digital habits. In minutes you get a personalised exposure score and a recommended action plan.',
      linkText: 'Start Assessment',
      action: () => navigate('/assessment'),
      iconBg: 'bg-green-500',
      accent: 'text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300',
    },
    {
      step: '03',
      icon: LayoutDashboard,
      title: 'Act on Your Dashboard',
      description: 'Your personalised dashboard turns results into clear next steps: alerts for the services you use, tools to reduce exposure, and progress tracking.',
      linkText: 'View Dashboard',
      action: () => navigate('/dashboard'),
      iconBg: 'bg-blue-500',
      accent: 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300',
    },
  ];

  return (
    <section className={`py-10 sm:py-14 md:py-16 bg-white dark:bg-slate-900 ${className}`.trim()}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-red-600 dark:text-red-400 mb-2">
            How it works
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Three steps to take control
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
            No account needed. Start anywhere and pick up where you left off.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="relative bg-gray-50 dark:bg-slate-800 rounded-2xl p-6 sm:p-7 border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-shadow duration-300 flex flex-col"
              >
                {/* Step number — top-right badge */}
                <span className="absolute top-5 right-5 text-3xl font-extrabold text-gray-100 dark:text-slate-700 leading-none select-none">
                  {step.step}
                </span>

                {/* Icon */}
                <div className={`w-12 h-12 ${step.iconBg} rounded-xl flex items-center justify-center mb-5 flex-shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed flex-grow mb-5">
                  {step.description}
                </p>

                {/* CTA link */}
                <button
                  type="button"
                  onClick={step.action}
                  className={`text-sm font-semibold ${step.accent} flex items-center gap-1 transition-colors mt-auto`}
                >
                  {step.linkText}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhatYouCanDoSection;
