
import React, { useState, useEffect } from 'react';
import { generateBanner } from '../services/geminiService';
import { Gift, Users, Zap, Star, ShieldCheck } from 'lucide-react';

const BANNER_PROMPTS = [
  "Marketing banner with text '¡INVITA Y GANA COMISIÓN!'. Show 8% Level 1, 3% Level 2, 1% Level 3. Futuristic space background, glowing human icons, neon blue and purple colors.",
  "Marketing banner with text '¡BONO DE RECARGA EXCLUSIVO! TODOS LOS MIÉRCOLES 6% ADICIONAL'. Use a glowing hexagon, calendar icon, neon blue and electric purple style.",
  "Premium financial banner 'BONO DE BIENVENIDA 3%'. Show gold gift boxes, futuristic dark blue background, professional digital art.",
  "Luxury banner 'SISTEMA VIP NEXUS'. Showing crowns and gems from VIP 1 to 7. Golden and platinum aesthetic."
];

export const Banner: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchImages = async () => {
      try {
        // Intentamos generar pero manejamos el error de cuota silenciosamente para activar el fallback
        const results = await Promise.all(BANNER_PROMPTS.map(p => generateBanner(p)));
        if (isMounted) {
          const validImages = results.filter((img): img is string => img !== null);
          setImages(validImages);
          setLoading(false);
        }
      } catch (err) {
        console.warn("Banner API Quota Exceeded or Error - Using high-quality Fallback");
        if (isMounted) setLoading(false);
      }
    };
    fetchImages();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // DISEÑO DE RESPALDO QUE REPLICA LAS IMÁGENES PROPORCIONADAS
  const FallbackSlide = ({ index }: { index: number }) => {
    // FIX: Moved declaration above slides array to avoid usage before declaration error
    const ChevronRight = ({ size, className }: { size: number, className?: string }) => (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
    );

    const slides = [
      {
        title: "¡INVITA Y GANA COMISIÓN!",
        content: (
          <div className="w-full flex flex-col items-center space-y-4">
            <div className="flex flex-col w-full max-w-[200px] space-y-2">
              <div className="flex items-center justify-between bg-white/5 border border-amber-500/30 rounded-full px-4 py-1">
                 <div className="flex items-center space-x-2"><div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-[8px] text-slate-900 font-bold">1</div> <span className="text-[10px] text-slate-300">Nivel 1</span></div>
                 <span className="text-amber-500 font-black">8%</span>
              </div>
              <div className="flex items-center justify-between bg-white/5 border border-blue-500/30 rounded-full px-4 py-1">
                 <div className="flex items-center space-x-2"><div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[8px] text-slate-900 font-bold">2</div> <span className="text-[10px] text-slate-300">Nivel 2</span></div>
                 <span className="text-blue-500 font-black">3%</span>
              </div>
              <div className="flex items-center justify-between bg-white/5 border border-cyan-500/30 rounded-full px-4 py-1">
                 <div className="flex items-center space-x-2"><div className="w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center text-[8px] text-slate-900 font-bold">3</div> <span className="text-[10px] text-slate-300">Nivel 3</span></div>
                 <span className="text-cyan-500 font-black">1%</span>
              </div>
            </div>
            <p className="text-[8px] uppercase tracking-[0.4em] text-slate-500 font-bold">nexusprofit.com</p>
          </div>
        ),
        bg: "from-[#0a0f1e] via-[#1a1333] to-[#0a0f1e]",
        icon: <Users className="text-cyan-400 mb-2 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" size={32} />
      },
      {
        title: "¡BONO DE RECARGA EXCLUSIVO!",
        content: (
          <div className="flex flex-col items-center space-y-2">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
              <div className="relative bg-slate-900/80 border-2 border-cyan-500/50 w-24 h-24 rotate-45 rounded-2xl flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <div className="-rotate-45 flex flex-col items-center">
                  <span className="text-4xl font-black text-white leading-none">6%</span>
                  <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-tighter">Adicional</span>
                </div>
              </div>
            </div>
            <p className="text-amber-500 font-black text-[10px] uppercase tracking-widest mt-4">TODOS LOS MIÉRCOLES</p>
          </div>
        ),
        bg: "from-[#0f172a] via-[#1e1b4b] to-[#0f172a]",
        icon: <Zap className="text-amber-500 mb-2 animate-pulse" size={32} />
      },
      {
        title: "BONO DE BIENVENIDA",
        content: (
          <div className="text-center">
            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-600 italic font-display">3%</div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mt-2">En tu primera inversión</p>
          </div>
        ),
        bg: "from-[#1e1b4b] via-[#0f172a] to-[#020617]",
        icon: <Gift className="text-amber-500 mb-2" size={32} />
      },
      {
        title: "SISTEMA DE RANGOS VIP",
        content: (
          <div className="text-center space-y-3">
            <div className="flex space-x-1 justify-center">
               {[1,2,3,4,5,6,7].map(v => <div key={v} className="w-4 h-1 bg-amber-500 rounded-full shadow-[0_0_5px_rgba(245,158,11,0.5)]"></div>)}
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">VIP 1 <ChevronRight className="inline mx-1" size={10}/> VIP 7</p>
            <p className="text-xs font-bold text-white uppercase italic">Menos comisiones • Más libertad</p>
          </div>
        ),
        bg: "from-[#020617] via-[#0f172a] to-[#020617]",
        icon: <ShieldCheck className="text-amber-500 mb-2" size={32} />
      }
    ];

    const s = slides[index];

    return (
      <div className={`absolute inset-0 bg-gradient-to-br ${s.bg} flex flex-col items-center justify-center p-6 border border-white/5`}>
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent"></div>
        <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-700">
          <div className="text-white/80 uppercase font-black tracking-[0.3em] text-[8px] mb-2">Nexus Profit Platform</div>
          <h2 className="text-xl font-black text-white text-center italic font-display tracking-tight mb-4 px-4 drop-shadow-xl leading-tight uppercase">
            {s.title}
          </h2>
          {s.content}
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full aspect-[16/9] rounded-[2.5rem] overflow-hidden shadow-2xl group border border-white/10 bg-slate-950">
      {[0, 1, 2, 3].map((i) => (
        <div 
          key={i} 
          className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${i === currentIdx ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}
        >
          {images[i] ? (
            <>
              <img
                src={images[i]}
                alt={`Promoción ${i}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
            </>
          ) : (
            <FallbackSlide index={i} />
          )}
        </div>
      ))}
      
      {/* Indicadores de Carrusel */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2 z-20">
        {[0, 1, 2, 3].map((_, i) => (
          <button 
            key={i} 
            onClick={() => setCurrentIdx(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${i === currentIdx ? 'w-12 bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)]' : 'w-2 bg-white/20'}`} 
          />
        ))}
      </div>
    </div>
  );
};
