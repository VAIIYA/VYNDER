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
    <div className="fixed bottom-24 left-4 right-4 z-50 md:left-auto md:right-8 md:w-96 animate-in slide-in-from-right-10">
      <div className="vaiiya-card p-6 shadow-2xl border-2 border-vaiiya-orange/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-vaiiya-orange/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

        <div className="flex items-start gap-4 relative z-10">
          <div className="w-14 h-14 bg-vaiiya-orange text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-vaiiya-orange/20">
            <ArrowDownTrayIcon className="w-7 h-7" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-serif font-bold text-vaiiya-purple mb-1">
              Perfect your experience
            </h3>
            <p className="text-vaiiya-gray/60 font-medium text-sm mb-4 leading-relaxed">
              Install the VYNDER app for instant access and a truly seamless matching journey.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleInstall}
                className="btn-vaiiya-primary flex-1 py-3 text-sm"
              >
                Add to Home
              </button>
              <button
                onClick={handleDismiss}
                className="p-3 text-vaiiya-gray/30 hover:text-vaiiya-orange transition-colors"
                aria-label="Dismiss"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-6 pt-4 border-t border-[#E9EDF6] flex justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <span className="text-[10px] font-bold text-vaiiya-gray/40 uppercase tracking-widest">Premium UI</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <span className="text-[10px] font-bold text-vaiiya-gray/40 uppercase tracking-widest">Realtime</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <span className="text-[10px] font-bold text-vaiiya-gray/40 uppercase tracking-widest">Secure</span>
          </div>
        </div>
      </div>
    </div>
  );
}