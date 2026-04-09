import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, Settings } from 'lucide-react';
import { useTranslation } from '../../contexts/TranslationContext';
import { useCookieConsent } from '../../contexts/CookieConsentContext';
import { getConsent, setConsent, hasAnswered } from '../../utils/cookieConsent';
import { analytics } from '../../utils/analytics';

export default function CookieConsentBanner() {
  const { t } = useTranslation();
  const { openPreferencesState, closePreferences } = useCookieConsent();
  const [visible, setVisible] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [manageAnalytics, setManageAnalytics] = useState(getConsent() === 'all');

  const shouldShow = !hasAnswered() || openPreferencesState;

  useEffect(() => {
    setVisible(shouldShow);
    if (openPreferencesState) {
      setShowManage(true);
      setManageAnalytics(getConsent() === 'all');
    }
  }, [shouldShow, openPreferencesState]);

  const hide = () => {
    setVisible(false);
    closePreferences();
  };

  const handleAcceptAll = () => {
    setConsent('all');
    analytics.enableGA();
    hide();
  };

  const handleRejectNonEssential = () => {
    setConsent('essential');
    hide();
  };

  const handleSavePreferences = () => {
    const value = manageAnalytics ? 'all' : 'essential';
    setConsent(value);
    if (manageAnalytics) {
      analytics.enableGA();
    }
    setShowManage(false);
    hide();
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-desc"
      className="fixed bottom-0 left-0 right-0 z-[9999] max-h-[50vh] overflow-y-auto py-2.5 px-3 sm:py-3 sm:px-4 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] shadow-[0_-2px_12px_rgba(0,0,0,0.08)] dark:shadow-[0_-2px_12px_rgba(0,0,0,0.25)] bg-white/98 dark:bg-slate-800/98 backdrop-blur-sm border-t border-gray-200 dark:border-slate-700"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-2 sm:gap-3">
          <div className="flex items-start gap-2 sm:gap-2.5">
            <Cookie className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" aria-hidden />
            <div className="min-w-0 flex-1">
              <h2 id="cookie-banner-title" className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white leading-tight">
                {t('cookieBanner.title')}
              </h2>
              <p id="cookie-banner-desc" className="mt-0.5 text-xs text-gray-600 dark:text-gray-300 leading-snug">
                {t('cookieBanner.description')}
              </p>
              <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                {t('cookieBanner.essentialNote')}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs">
                <Link
                  to="/cookie-policy"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {t('cookieBanner.cookiePolicyLink')}
                </Link>
                <span className="text-gray-400 dark:text-gray-500">·</span>
                <Link
                  to="/privacy-policy"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {t('cookieBanner.privacyPolicyLink')}
                </Link>
              </div>
            </div>
          </div>

          {showManage ? (
            <div className="rounded-md bg-gray-50 dark:bg-slate-700/50 p-2.5 sm:p-3 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                  {t('cookieBanner.analyticsLabel')}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={manageAnalytics}
                  onClick={() => setManageAnalytics((v) => !v)}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ring-offset-white dark:ring-offset-slate-800 ${
                    manageAnalytics ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition ${
                      manageAnalytics ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ring-offset-white dark:ring-offset-slate-800"
                >
                  {t('cookieBanner.save')}
                </button>
                {hasAnswered() && (
                  <button
                    type="button"
                    onClick={() => { setShowManage(false); closePreferences(); setVisible(false); }}
                    className="px-3 py-1.5 rounded-md bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-200 text-xs font-medium hover:bg-gray-300 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 ring-offset-white dark:ring-offset-slate-800"
                  >
                    {t('common.actions.close')}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ring-offset-white dark:ring-offset-slate-800"
              >
                {t('cookieBanner.acceptAll')}
              </button>
              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="px-3 py-1.5 rounded-md bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-200 text-xs font-medium hover:bg-gray-300 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 ring-offset-white dark:ring-offset-slate-800"
              >
                {t('cookieBanner.rejectNonEssential')}
              </button>
              <button
                type="button"
                onClick={() => setShowManage(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 text-xs font-medium hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ring-offset-white dark:ring-offset-slate-800"
              >
                <Settings className="w-3.5 h-3.5" />
                {t('cookieBanner.managePreferences')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
