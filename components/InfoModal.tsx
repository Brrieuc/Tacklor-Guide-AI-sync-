import React from 'react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gray-800/50 p-6 border-b border-gray-700 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-white font-sport tracking-wide flex items-center group cursor-help">
            <span className="bg-cyan-900/50 p-2 rounded-lg mr-3 text-xl transition-transform duration-500 group-hover:rotate-[360deg] group-hover:scale-110">📘</span>
            Guide d'utilisation
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            &times;
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto scrollbar-hide text-sm text-gray-300 leading-relaxed">
          
          {/* Section 1: Comment ça marche */}
          <section className="space-y-2">
            <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-xs border-b border-gray-700 pb-1 mb-2">
              Comment ça marche ?
            </h3>
            <p>
              Tacklor Guide est une interface intelligente. Vous ne saisissez pas de texte : 
              <span className="text-white font-semibold"> vous paramétrez l'outil via les sélecteurs visuels</span> (météo, lieu, marée, cible, etc.).
            </p>
            <p>
              L'algorithme analyse cette combinaison unique de facteurs pour générer une stratégie sur-mesure.
            </p>
            <div className="mt-2 bg-emerald-900/20 p-2 rounded border border-emerald-500/20">
              <p className="text-xs text-emerald-200">
                💡 <span className="font-semibold">Note :</span> La fonction "Utiliser ma position" pré-remplit automatiquement les paramètres météo et environnementaux. Cependant, la nature est changeante : <span className="underline decoration-emerald-500/50">vous êtes invité à modifier ces valeurs</span> en fonction de vos observations réelles sur le terrain.
              </p>
            </div>
          </section>

          {/* Section 2: Les Modes */}
          <section className="space-y-3">
            <h3 className="text-purple-400 font-bold uppercase tracking-wider text-xs border-b border-gray-700 pb-1 mb-2">
              Les Modes de Réponse
            </h3>
            
            <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-700/50 hover:bg-gray-800/60 transition-colors">
              <span className="text-emerald-400 font-bold text-xs block mb-1">MODE SIMPLE</span>
              <p className="text-xs text-gray-400">
                Idéal pour débuter ou une sortie détente. L'outil vulgarise les concepts, explique le "pourquoi" et propose des montages accessibles et polyvalents.
              </p>
            </div>

            <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-700/50 hover:bg-gray-800/60 transition-colors">
              <span className="text-gray-200 font-bold text-xs block mb-1">MODE EXPERT</span>
              <p className="text-xs text-gray-400">
                Pour les pêcheurs confirmés. L'outil utilise un jargon technique précis (biologie, hydrodynamisme), analyse les vecteurs de déplacement et suggère du matériel pointu.
              </p>
            </div>
          </section>

          {/* Section 3: Philosophie */}
          <section className="space-y-2 bg-blue-900/10 p-4 rounded-xl border border-blue-500/20">
            <h3 className="text-cyan-400 font-bold uppercase tracking-wider text-xs mb-2">
              Philosophie & Sources
            </h3>
            <p className="text-xs italic text-gray-400">
              Ce système repose sur un corpus exclusif de plus de <span className="text-gray-200">300 pages de réglementation</span> et <span className="text-gray-200">500 pages d'archives techniques</span>, d'articles et de retours d'expérience compilés par son éditeur et producteur, <strong className="text-white">Brieuc Pecqueraux</strong>.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              ⚠️ La sécurité et la légalité sont prioritaires dans les réponses fournies, dans la limite de l'actualisation de la base de données.
            </p>
          </section>

          {/* Section 4: Contact */}
          <section className="space-y-2 bg-gray-800/40 p-4 rounded-xl border border-gray-600/30">
             <h3 className="text-amber-400 font-bold uppercase tracking-wider text-xs mb-2">
               Contact & Support
             </h3>
             <p className="text-xs text-gray-400">
                Pour toute demande, requête, recommandation ou signalement d'un problème :
             </p>
             <ul className="text-xs space-y-2 mt-2">
                <li className="flex items-center">
                    <span className="mr-2">📧</span>
                    <a href="mailto:brieuc.pecqueraux@gmail.com" className="text-emerald-400 hover:text-emerald-300 underline transition-colors">
                        brieuc.pecqueraux@gmail.com
                    </a>
                </li>
                <li className="flex items-center group w-fit cursor-help" title="Laissez un message après le biiiiiip...">
                    <span className="mr-2">📱</span>
                    <span className="text-gray-200 font-mono tracking-wide">+33 7 67 44 92 04</span>
                    <span className="ml-2 text-gray-500 italic text-[10px] transition-all duration-300 group-hover:text-amber-500 group-hover:translate-x-1">
                        (même si je ne réponds jamais)
                    </span>
                </li>
             </ul>
          </section>
          
          {/* Easter Egg Footer */}
          <div className="text-center pt-2 opacity-30 hover:opacity-100 transition-opacity duration-500 cursor-help" title="après c'est vrai que certains y sont passés mais pas pour les mêmes raisons miam ! (toujours dans le respect des réglementation et de l'animal, ne prélevez que ce dont vous avez besoin et êtes autorisé à prélever)">
             <p className="text-[10px] italic">🐟 Aucun poisson n'a été maltraité pour créer cet outil.</p>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-gray-800/50 p-4 border-t border-gray-700 flex justify-end shrink-0">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 shadow-lg transition-transform active:scale-95"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;