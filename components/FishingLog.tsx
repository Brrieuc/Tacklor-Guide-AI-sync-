import React from 'react';

interface FishingLogProps {
  strategy: string;
  loading: boolean;
}

const FishingLog: React.FC<FishingLogProps> = ({ strategy, loading }) => {
  if (!strategy && !loading) return null;

  return (
    <div className="mt-12 animate-fade-in-up w-full max-w-3xl mx-auto">
      <div className="relative rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.15)] border border-gray-700/50 backdrop-blur-xl bg-gray-900/80">
        
        {/* Header with modern neon accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500"></div>

        <div className="p-8 md:p-10">
          <div className="flex items-center mb-8 pb-4 border-b border-gray-700/50">
             <div className="bg-gradient-to-br from-emerald-500 to-cyan-600 p-2 rounded-lg mr-4 shadow-lg shadow-emerald-900/50">
                <span className="text-2xl">🤖</span>
             </div>
             <div>
                <h2 className="text-2xl font-bold text-white tracking-wide">
                  Les conseils de Tacklor
                </h2>
                <p className="text-sm text-emerald-400/80 font-medium">Analyse tactique personnalisée</p>
             </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="relative">
                 <div className="w-16 h-16 border-4 border-gray-700 rounded-full"></div>
                 <div className="absolute top-0 left-0 w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                 <div className="absolute top-0 left-0 w-16 h-16 border-4 border-cyan-400 border-b-transparent border-l-transparent border-r-transparent rounded-full animate-spin [animation-duration:1.5s]"></div>
              </div>
              <p className="text-gray-400 animate-pulse font-light tracking-wider text-center">
                Analyse des paramètres...<br/>
                <span className="text-xs text-gray-500 mt-1 block">Tacklor Guide calcule la meilleure approche.</span>
              </p>
            </div>
          ) : (
            <div className="text-gray-300 leading-loose font-mono text-sm whitespace-pre-wrap">
              {strategy}
            </div>
          )}
        </div>
        
        {/* Subtle footer accent */}
        <div className="bg-gray-800/50 px-8 py-3 border-t border-gray-700/50 flex justify-between items-center text-xs text-gray-500 font-mono">
           <span>Généré par IA Tacklor</span>
           <span>v2.4.0</span>
        </div>
      </div>
    </div>
  );
};

export default FishingLog;