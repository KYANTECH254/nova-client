'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

type VersionData = {
  version: string;
  build: string;
  description: string;
  features: string[];
  maintenance: boolean;
  mandatoryUpdate: boolean;
};

export default function DashFooter() {
  const [versions, setVersions] = useState<VersionData[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [hideFooter, setHideFooter] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('hideFooter');
    if (dismissed === 'true') {
      setHideFooter(true);
    }

    fetch('/version.json')
      .then(res => res.json())
      .then(setVersions)
      .catch(err => console.error('Failed to load version data:', err));
  }, []);

  const handleHideFooter = () => {
    sessionStorage.setItem('hideFooter', 'true');
    setHideFooter(true);
  };

  const latestVersion = versions[0];

  return (
    <div>
      {/* Modal */}
      {showModal && versions.length > 0 && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="flex flex-col bg-gray-100 border border-gray-300 rounded-xl p-6 shadow-md w-full max-w-md max-h-full overflow-y-auto space-y-6
                          dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100">
            <button
              onClick={() => setShowModal(false)}
              className="self-end text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition"
              aria-label="Close modal"
            >
              <X />
            </button>
            {versions.map((version, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-semibold">{`Version ${version.version}`}</h2>
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-400 mb-2">
                  <strong>Build:</strong> {new Date(version.build).toLocaleString()}
                </p>

                <p className="text-sm mb-4">{version.description}</p>

                <div>
                  <h3 className="text-sm font-semibold mb-1">New Features:</h3>
                  <ul className="list-disc list-inside text-sm text-gray-800 dark:text-gray-300 space-y-1">
                    {version.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>

                {(version.maintenance || version.mandatoryUpdate) && (
                  <div className="mt-4 p-3 rounded bg-yellow-100 text-yellow-900 text-sm dark:bg-yellow-900 dark:text-yellow-100">
                    {version.maintenance && <p>⚠️ Currently under maintenance.</p>}
                    {version.mandatoryUpdate && <p>🚨 Mandatory update.</p>}
                  </div>
                )}

                {idx < versions.length - 1 && (
                  <hr className="my-6 border-t border-gray-300 dark:border-gray-700" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      {latestVersion && !hideFooter && (
        <footer
          className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-200 text-gray-900 px-4 py-2 rounded-full shadow-md flex items-center gap-2 cursor-pointer hover:bg-gray-100 transition
                     dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
        >
          <div onClick={() => setShowModal(true)} className="flex items-center gap-2">
            <p className="text-sm">{`Version ${latestVersion.version}`}</p>
          </div>
          <button
            onClick={handleHideFooter}
            className="text-gray-600 hover:text-gray-900 dark:text-white/70 dark:hover:text-white transition"
            aria-label="Dismiss footer"
          >
            <X size={16} />
          </button>
        </footer>
      )}
    </div>
  );
}
