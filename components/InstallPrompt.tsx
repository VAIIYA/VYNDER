"use client";

import { useState, useEffect } from "react";
import { XMarkIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Show prompt after a delay (like Badoo does)
      setTimeout(() => {
        // Only show if not on mobile or if it's been some time
        const lastPrompt = localStorage.getItem('pwa-prompt-time');
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        if (!lastPrompt || (now - parseInt(lastPrompt)) > oneDay) {
          setShowPrompt(true);
        }
      }, 30000); // Show after 30 seconds
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      toast.success("VYNDER installed successfully! 🎉");
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
      localStorage.setItem('pwa-prompt-time', Date.now().toString());
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-time', Date.now().toString());
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <div className="bg-background-secondary border border-metamask-dark-gray rounded-2xl p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-metamask-orange to-metamask-blue rounded-xl flex items-center justify-center flex-shrink-0">
            <ArrowDownTrayIcon className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-text-primary font-bold text-lg mb-1">
              Install VYNDER
            </h3>
            <p className="text-text-secondary text-sm mb-3">
              Get the full app experience with offline access, push notifications, and faster loading.
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 bg-gradient-to-r from-metamask-orange to-metamask-blue text-white font-bold py-2 px-4 rounded-xl hover:shadow-lg transition-all active:scale-95"
              >
                Install Now
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-2 text-text-tertiary hover:text-text-secondary transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile-specific features */}
        <div className="mt-3 pt-3 border-t border-metamask-dark-gray">
          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            <span className="w-1 h-1 bg-metamask-green rounded-full"></span>
            <span>No app store needed</span>
            <span className="w-1 h-1 bg-metamask-green rounded-full"></span>
            <span>Works offline</span>
            <span className="w-1 h-1 bg-metamask-green rounded-full"></span>
            <span>Push notifications</span>
          </div>
        </div>
      </div>
    </div>
  );
}