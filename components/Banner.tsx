
import React, { useState, useEffect } from 'react';
import { generateBanner } from '../services/geminiService';
import { Gift, Users, Zap, Star, ShieldCheck, Crown, Gem } from 'lucide-react';

const BANNER_PROMPTS = [
  "Marketing banner with text '¡ASCENSIÓN VIP AUTOMÁTICA!'. Show bonus: VIP 1: 1USDT, VIP 2: 2.5USDT, VIP 3: 5USDT. Golden crowns, professional lighting.",
  "Marketing banner with text 'PREMIOS ELITE VIP'. Show bonus: VIP 4: 13USDT, VIP 5: 30USDT, VIP 6: 75USDT, VIP 7: 135USDT. Luxury design, diamond icons.",
  "Marketing banner with text '¡INVITA Y GANA COMISIÓN!'. Show 8% Level 1, 3% Level 2, 1% Level 3. Futuristic space background, neon blue and purple colors.",
  "Premium financial banner 'SISTEMA DE PAGOS LOS LUNES'. Text about team commissions delivery at 12:00 PM. Professional digital art, clock icon."
];

export const Banner: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchImagesSequentially = async () => {
      const results: string[] = [];
      let quotaExceeded = false;
      for (const prompt of BANNER_PROMPTS) {
        if (!isMounted || quotaExceeded) break;
        try {
          const img = await generateBanner(prompt);
          if (img) {
            results.push(img);
            if (isMounted) setImages([...results]);
            await new Promise(resolve => setTimeout(resolve, 3000));
          } else {
            quotaExceeded = true;
          }
        } catch (err) {
          quotaExceeded = true;
        }
      }
      if (isMounted) setLoading(false);
    };
    fetchImagesSequentially();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % 4);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const FallbackSlide = ({ index }: { index: number }) => {
    const slides = [
      {
        title: "¡BONOS POR ASCENSIÓN VIP!",
        content: (
          <div className="grid grid-cols-2 gap-2 max-w-[280px]">
             <div className="bg-white/5 p-2 rounded-xl border border-amber-500/30 text-[9px]">VIP 1: <span className="text-amber-500 font-bold">1 USDT</span></div>
             <div className="bg-white/5 p-2 rounded-xl border border-amber-500/30 text-[9px]">VIP 2: <span className="text-amber-500 font-bold">2.5 USDT</span></div>
             <div className="bg-white/5 p-2 rounded-xl border border-amber-500/30 text-[9px]">VIP 3: <span className="text-amber-500 font-bold">5 USDT</span></div>
             <div className="bg-white/5 p-2 rounded-xl border border-amber-500/30 text-[9px]">VIP 4: <span className="text-amber-500 font-bold">13 USDT</span></div>
          </div>
        ),
        bg: "from-[#0a0f1e] via-[#1a1333] to-[#0a0f1e]",
        icon: <Crown className="text-amber-500 mb-2" size={32} />
      },
      {
        title: "¡GRANDES PREMIOS VIP!",
        content: (
          <div className="grid grid-cols-2 gap-2 max-w-[280px]">
             <div className="bg-white/5 p-2 rounded-xl border border-blue-500/30 text-[9px]">VIP 5: <span className="text-blue-400 font-bold">30 USDT</span></div>
             <div className="bg-white/5 p-2 rounded-xl border border-blue-500/30 text-[9px]">VIP 6: <span className="text-blue-400 font-bold">75 USDT</span></div>
             <div className="bg-white/5 p-2 rounded-xl border border-blue-500/30 text-[9px] col-span-2 text-center">VIP 7: <span className="text-blue-400 font-bold">135 USDT</span></div>
          </div>
        ),
        bg: "from-[#0f172a] via-[#1e1b4b] to-[#0f172a]",
        icon: <Gem className="text-blue-400 mb-2" size={32} />
      },
      {
        title: "PAGOS SEMANALES RED",
        content: (
          <div className="text-center">
            <p className="text-[10px] text-slate-300 italic">Las comisiones de tu equipo se acreditan</p>
            <p className="text-amber-500 font-black text-xs mt-2 uppercase">Lunes a las 12:00 PM</p>
          </div>
        ),
        bg: "from-[#1e1b4b] via-[#0f172a] to-[#020617]",
        icon: <Zap className="text-amber-500 mb-2" size={32} />
      },
      {
        title: "¡INVITA Y GANA COMISIÓN!",
        content: (
          <div className="flex justify-center space-x-2">
             <div className="bg-blue-500/20 px-3 py-1 rounded-full text-[10px] text-blue-400 font-bold border border-blue-500/30">L1: 8%</div>
             <div className="bg-purple-500/20 px-3 py-1 rounded-full text-[10px] text-purple-400 font-bold border border-purple-500/30">L2: 3%</div>
             <div className="bg-pink-500/20 px-3 py-1 rounded-full text-[10px] text-pink-400 font-bold border border-pink-500/30">L3: 1%</div>
          </div>
        ),
        bg: "from-[#020617] via-[#0f172a] to-[#020617]",
        icon: <Users className="text-cyan-400 mb-2" size={32} />
      }
    ];
    const s = slides[index];
    return (
      <div className={`absolute inset-0 bg-gradient-to-br ${s.bg} flex flex-col items-center justify-center p-6 border border-white/5`}>
        <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-700">
          {s.icon}
          <h2 className="text-xl font-black text-white text-center italic font-display tracking-tight mb-4 px-4 leading-tight uppercase">
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
        <div key={i} className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${i === currentIdx ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}>
          {images[i] ? (
            <><img src={images[i]} alt={`Promoción ${i}`} className="w-full h-full object-cover"/><div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent"/></>
          ) : (
            <FallbackSlide index={i} />
          )}
        </div>
      ))}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2 z-20">
        {[0, 1, 2, 3].map((_, i) => (
          <button key={i} onClick={() => setCurrentIdx(i)} className={`h-1.5 rounded-full transition-all duration-500 ${i === currentIdx ? 'w-12 bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)]' : 'w-2 bg-white/20'}`}/>
        ))}
      </div>
    </div>
  );
};
