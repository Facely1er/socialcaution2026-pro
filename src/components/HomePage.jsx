import React from 'react';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, Globe, Database, Shield } from 'lucide-react';
import { analytics } from '../utils/analytics.js';
import SEOHead from './common/SEOHead';
import StructuredData from './seo/StructuredData';
import { useTranslation } from '../contexts/TranslationContext';
import Hero from './home/Hero';
import AlertsCarousel from './home/AlertsCarousel';
import WhatYouCanDoSection from './home/WhatYouCanDoSection';
import TrustIndicators from './home/TrustIndicators';
import { motion } from 'framer-motion';
import { useCautionStore } from '../state/cautionStore';
import { toHomepageAlerts } from '../features/alerts/alertsAdapter';

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  
  // Get Radar alerts from store
  const storeAlerts = useCautionStore((state) => state.alerts) || [];
  
  // Debug logging in dev mode
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[HomePage] Store alerts count:', storeAlerts.length);
      if (storeAlerts.length > 0) {
        console.log('[HomePage] Sample alert:', {
          id: storeAlerts[0].id,
          title: storeAlerts[0].title,
          source: storeAlerts[0].source,
          category: storeAlerts[0].category,
          createdAt: storeAlerts[0].createdAt
        });
      }
    }
  }, [storeAlerts.length]);
  
  // Convert Radar alerts to carousel items (with 24-hour filter and 7-day fallback)
  const { alerts: carouselItems, lastUpdate } = toHomepageAlerts(storeAlerts);
  
  // Debug carousel items
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[HomePage] Carousel items:', carouselItems.length);
      if (carouselItems.length > 0) {
        console.log('[HomePage] Sample carousel item:', carouselItems[0]);
      }
    }
  }, [carouselItems.length]);

  // Scroll to app-downloads section when Footer "Download" link is used (#app-downloads)
  useEffect(() => {
    if (location.hash === '#app-downloads') {
      const el = document.getElementById('app-downloads');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [location.hash]);

  // Trigger RSS service if no alerts (similar to PrivacyRadar)
  useEffect(() => {
    if (storeAlerts.length === 0) {
      // Import dynamically to avoid circular dependencies
      import('../services/rssAlertService').then(({ rssAlertService }) => {
        // Also import resilient fetcher to reset it if needed (for dev mode)
        import('../utils/resilientRSSFetcher').then(({ resilientRSSFetcher }) => {
          // Reset resilient fetcher to allow retry
          if (import.meta.env.DEV) {
            resilientRSSFetcher.reset();
          }
          
          rssAlertService.processNow().then(() => {
            // Wait a bit for async processing to complete
            setTimeout(() => {
              const updatedStore = useCautionStore.getState();
              if (updatedStore.alerts.length === 0 && import.meta.env.DEV) {
                console.log('[HomePage] Store still empty after fetch. Check console for RSS service logs.');
              } else if (import.meta.env.DEV) {
                console.log(`[HomePage] ✅ Loaded ${updatedStore.alerts.length} alerts into store`);
              }
            }, 2000); // Give it 2 seconds for async processing
          }).catch(error => {
            if (import.meta.env.DEV) {
              console.warn('[HomePage] Error fetching alerts:', error);
            }
          });
        });
      });
    }
  }, [storeAlerts.length]);

  // Verify store functionality in dev mode
  useEffect(() => {
    if (import.meta.env.DEV) {
      import('../utils/storeVerification').then(({ logStoreStatus, verifyStoreFunctionality }) => {
        // Log status on mount
        logStoreStatus();
        
        // Verify functionality
        const verification = verifyStoreFunctionality();
        if (!verification.isFunctional && import.meta.env.DEV) {
          console.warn('[HomePage] Store verification failed:', verification.issues);
        }
      });
    }
  }, []);
  

  // DO NOT REVERT: Hero gradient on root so no strip above hero; do not change back to bg-gray-50.
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <SEOHead
        title="SocialCaution – Privacy Exposure Insights for Digital Services"
        description="Browse 200+ services and see exactly how they collect, share, and protect your data. Get privacy ratings, security track records, and policy updates. No signup required."
        keywords="privacy risks, service privacy, data collection, security ratings, privacy monitoring, service catalog, free privacy tool"
        canonicalUrl={typeof window !== 'undefined' ? window.location.origin : ''}
      />
      <StructuredData />

      {/* Hero Section - Digital Footprint Analyzer Focused */}
      <Hero />

      {/* What You Can Do - first section below Hero */}
      <WhatYouCanDoSection />

      {/* Privacy & Security Alerts Carousel (Privacy Radar) - after What You Can Do */}
      <AlertsCarousel
        items={carouselItems}
        lastUpdate={lastUpdate}
        introLine={t('homePage.alerts.intro')}
      />

      {/* Trust Indicators */}
      <TrustIndicators />

      {/* Technical Privacy Security */}
      <section className="py-8 sm:py-10 md:py-12 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 px-2">
              {t('features.technical.title')}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-2">
              {t('features.technical.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Eye, title: t('features.technical.anonymousAnalytics.title'), description: t('features.technical.anonymousAnalytics.description') },
              { icon: Globe, title: t('features.technical.internationalCompliance.title'), description: t('features.technical.internationalCompliance.description') },
              { icon: Shield, title: t('features.technical.securityHeaders.title'), description: t('features.technical.securityHeaders.description') },
              { icon: Database, title: t('features.technical.localFirstStorage.title'), description: t('features.technical.localFirstStorage.description') }
            ].map((feature, index) => {
              const FeatureIcon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-slate-700 rounded-xl p-6 text-center hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <FeatureIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        className="py-10 sm:py-14 md:py-16 bg-gradient-to-r from-accent via-accent-dark to-accent text-white relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/15 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/15 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Ready to see your privacy risks?
          </motion.h2>
          <motion.p
            className="text-base sm:text-lg mb-7 sm:mb-8 opacity-90 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            viewport={{ once: true }}
          >
            No account. No credit card. Start in seconds.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <motion.button
              type="button"
              onClick={() => {
                try {
                  if (analytics && typeof analytics.trackEvent === 'function') {
                    analytics.trackEvent('cta_click', { action: 'browse_catalog', placement: 'homepage_bottom_cta' });
                  }
                } catch (e) { /* noop */ }
                navigate('/service-catalog');
              }}
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-white/90 text-accent font-semibold text-base rounded-xl border-2 border-white shadow-lg hover:shadow-xl transition-all duration-300 min-h-[48px] touch-manipulation"
              aria-label="Browse service catalog"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Browse Services →
            </motion.button>
            <motion.button
              type="button"
              onClick={() => navigate('/pricing')}
              className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-white/10 text-white font-semibold text-base rounded-xl border-2 border-white/60 hover:border-white transition-all duration-300 min-h-[48px] touch-manipulation"
              aria-label="View pricing plans"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              View Plans
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Feature Modal - handled in FeaturesSection */}
    </div>
  );
};

export default HomePage;