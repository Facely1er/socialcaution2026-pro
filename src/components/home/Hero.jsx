import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useTranslation } from '../../contexts/TranslationContext';

const Hero = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // DO NOT REVERT: No margin-top (mt-14/mt-16) on this section; main's pt-14/pt-16 clears the header. Margin here would create a visible strip.
  return (
    <section className="relative pt-14 sm:pt-16 md:pt-20 pb-8 sm:pb-12 md:pb-16 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden safe-area-inset-top">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="hidden sm:block absolute top-0 left-0 w-72 h-72 bg-purple-200/30 dark:bg-purple-500/15 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="hidden md:block absolute bottom-0 right-0 w-96 h-96 bg-accent/20 dark:bg-accent/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        <div className="hidden sm:block absolute top-1/2 left-1/2 w-64 h-64 bg-blue-200/30 dark:bg-blue-500/15 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Eyebrow label */}
        <motion.div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs sm:text-sm font-semibold mb-5 sm:mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0"></span>
          200+ services rated for privacy risk
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-5 leading-tight px-2 sm:px-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {t('homePage.hero.titlePart1')}{' '}
          <span className="text-red-600 dark:text-red-400">
            {t('homePage.hero.titlePart2')}
          </span>
        </motion.h1>

        {/* Single static subtitle */}
        <motion.p
          className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed px-2 sm:px-6 mb-5 sm:mb-6 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          {t('homePage.hero.subtitle')}
        </motion.p>

        {/* Trust signals */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-7 sm:mb-8 px-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
        >
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
            <span className="font-medium">{t('homePage.hero.noSignupRequired')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
            <span className="font-medium">{t('homePage.hero.freeServices')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
            <span className="font-medium">{t('homePage.hero.fullyPrivate')}</span>
          </div>
        </motion.div>

        {/* Single primary CTA — immediate value, no paywall */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 px-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
        >
          <motion.button
            type="button"
            onClick={() => navigate('/service-catalog')}
            className="w-full sm:w-auto px-8 md:px-10 py-4 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white text-base md:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 min-h-[48px] touch-manipulation"
            aria-label="Browse the service catalog"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Browse 200+ Services →
          </motion.button>
          <motion.button
            type="button"
            onClick={() => navigate('/assessment')}
            className="w-full sm:w-auto px-8 md:px-10 py-4 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-100 text-base md:text-lg font-semibold rounded-xl border border-gray-200 dark:border-slate-600 shadow-sm hover:shadow-md transition-all duration-300 min-h-[48px] touch-manipulation"
            aria-label="Take a free privacy assessment"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Free Privacy Assessment
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
