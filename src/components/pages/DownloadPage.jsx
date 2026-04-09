import { useState, useEffect } from 'react';
import { Download, Smartphone, ExternalLink, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEOHead from '../common/SEOHead';
import EnhancedBreadcrumbs from '../common/EnhancedBreadcrumbs';
import {
  APP_STORE_IOS,
  APP_STORE_ANDROID,
  APP_STORE_BADGE_IMAGE,
  GOOGLE_PLAY_BADGE_IMAGE,
  BADGE_WIDTH,
  BADGE_HEIGHT,
} from '../../config/appStores';
import { isPWAInstalled, isIOS, isAndroid } from '../../utils/responsive';
import { useTranslation } from '../../contexts/TranslationContext';

const DownloadPage = () => {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [pwaInstalled, setPwaInstalled] = useState(false);
  const [pwaInstallDone, setPwaInstallDone] = useState(false);
  const [appStoreBadgeError, setAppStoreBadgeError] = useState(false);
  const [googlePlayBadgeError, setGooglePlayBadgeError] = useState(false);

  const onIOS = isIOS();
  const onAndroid = isAndroid();

  useEffect(() => {
    setPwaInstalled(isPWAInstalled());

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setPwaInstallDone(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <>
      <SEOHead
        title={t('downloadPage.seo.title')}
        description={t('downloadPage.seo.description')}
        keywords={t('downloadPage.seo.keywords')}
      />
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <section className="pt-8 sm:pt-12 pb-16 bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-50 dark:from-slate-900 dark:via-purple-950/20 dark:to-slate-900">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <EnhancedBreadcrumbs
              className="mb-6"
              customBreadcrumbs={[
                { name: t('downloadPage.breadcrumb'), href: '/download', current: true }
              ]}
            />

            {/* Header – PWA-focused */}
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Smartphone className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                  {t('downloadPage.title')}
                </h1>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
                {t('downloadPage.subtitle')}
              </p>
            </div>

            {/* PWA Install Section – primary content */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-8 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 text-center">
                {t('downloadPage.pwa.title')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
                {t('downloadPage.pwa.subtitle')}
              </p>

              {pwaInstalled || pwaInstallDone ? (
                <div className="flex flex-col items-center gap-3 py-2">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                  <p className="text-green-700 dark:text-green-400 font-semibold text-center">
                    {t('downloadPage.pwa.alreadyInstalled')}
                  </p>
                </div>
              ) : deferredPrompt ? (
                <div className="flex flex-col items-center gap-4">
                  <button
                    onClick={handleInstallPWA}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all active:scale-95 touch-manipulation"
                  >
                    <Download className="w-5 h-5" />
                    {t('downloadPage.pwa.installButton')}
                  </button>
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                    {t('downloadPage.pwa.browserConfirm')}
                  </p>
                </div>
              ) : onIOS ? (
                <ol className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs font-bold">1</span>
                    <span>{t('downloadPage.pwa.ios.step1')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs font-bold">2</span>
                    <span>{t('downloadPage.pwa.ios.step2')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs font-bold">3</span>
                    <span>{t('downloadPage.pwa.ios.step3')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs font-bold">4</span>
                    <span>{t('downloadPage.pwa.ios.step4')}</span>
                  </li>
                </ol>
              ) : (
                <ol className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs font-bold">1</span>
                    <span>{t('downloadPage.pwa.desktop.step1')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs font-bold">2</span>
                    <span>{t('downloadPage.pwa.desktop.step2')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs font-bold">3</span>
                    <span>{t('downloadPage.pwa.desktop.step3')}</span>
                  </li>
                </ol>
              )}
            </div>

            {/* Also available in app stores – secondary, compact */}
            <div className="text-center mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {t('downloadPage.alsoAvailable')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <a
                  href={APP_STORE_IOS}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  style={{ width: BADGE_WIDTH, height: BADGE_HEIGHT }}
                  aria-label={t('downloadPage.aria.appStore')}
                >
                  {!appStoreBadgeError ? (
                    <img
                      src={APP_STORE_BADGE_IMAGE}
                      alt={t('downloadPage.aria.appStore')}
                      className="block max-w-full max-h-full object-contain"
                      style={{ width: BADGE_WIDTH, height: BADGE_HEIGHT, objectFit: 'contain' }}
                      width={BADGE_WIDTH}
                      height={BADGE_HEIGHT}
                      onError={() => setAppStoreBadgeError(true)}
                    />
                  ) : (
                    <span className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-semibold text-xs">
                      <Download className="w-4 h-4" />
                      App Store
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  )}
                </a>
                <a
                  href={APP_STORE_ANDROID}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  style={{ width: BADGE_WIDTH, height: BADGE_HEIGHT }}
                  aria-label={t('downloadPage.aria.googlePlay')}
                >
                  {!googlePlayBadgeError ? (
                    <img
                      src={GOOGLE_PLAY_BADGE_IMAGE}
                      alt={t('downloadPage.aria.googlePlay')}
                      className="block max-w-full max-h-full object-contain"
                      style={{ width: BADGE_WIDTH, height: BADGE_HEIGHT, objectFit: 'contain' }}
                      width={BADGE_WIDTH}
                      height={BADGE_HEIGHT}
                      onError={() => setGooglePlayBadgeError(true)}
                    />
                  ) : (
                    <span className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-xs">
                      <Download className="w-4 h-4" />
                      Google Play
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  )}
                </a>
              </div>
            </div>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              <Link to="/" className="text-purple-600 dark:text-purple-400 hover:underline">
                {t('downloadPage.continueToWebsite')}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </>
  );
};

export default DownloadPage;
