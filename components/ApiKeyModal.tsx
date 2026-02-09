import React, { useState, useEffect } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [key, setKey] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('user_gemini_key');
      setKey(stored || '');
    }
  }, [isOpen]);

  const handleSave = () => {
    if (key.trim()) {
      localStorage.setItem('user_gemini_key', key.trim());
    } else {
      localStorage.removeItem('user_gemini_key');
    }
    onClose();
  };

  const handleClear = () => {
    setKey('');
    localStorage.removeItem('user_gemini_key');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="bg-gray-800/50 p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white font-sport tracking-wide flex items-center">
            <span className="bg-emerald-900/50 p-2 rounded-lg mr-3 text-xl">🔑</span>
            Configuration API
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-300 leading-relaxed">
            Pour garantir un accès illimité et rapide, vous pouvez utiliser votre propre clé API Google Gemini.
            <br/>
            <span className="text-xs text-gray-500 mt-1 block">
              Sans clé, l'application utilise une clé partagée soumise à des quotas stricts.
            </span>
          </p>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Votre Clé API Gemini
            </label>
            <div className="relative">
              <input 
                type={isVisible ? "text" : "password"}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-gray-800 border border-gray-600 text-white text-sm rounded-lg p-3 pr-10 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none font-mono"
              />
              <button 
                onClick={() => setIsVisible(!isVisible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {isVisible ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
             <p className="text-xs text-blue-200 flex items-start">
               <span className="mr-2 text-base">ℹ️</span>
               La clé est stockée uniquement dans le stockage local de votre navigateur. Elle n'est jamais envoyée vers nos serveurs.
             </p>
          </div>

          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noreferrer"
            className="block text-center text-xs text-emerald-400 hover:text-emerald-300 underline mt-2"
          >
            Obtenir une clé API gratuite sur Google AI Studio
          </a>
        </div>

        {/* Footer */}
        <div className="bg-gray-800/50 p-4 border-t border-gray-700 flex justify-end space-x-3">
          {key && (
            <button 
              onClick={handleClear}
              className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/30 transition-colors"
            >
              Supprimer
            </button>
          )}
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Annuler
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-lg transition-transform active:scale-95"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;