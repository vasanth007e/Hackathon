import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Zap, Sparkles, AlertCircle, CheckCircle2, ChevronRight, Activity, Brain, Terminal, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface Scenario {
  id: string;
  title: string;
  probability: number;
  description: string;
  reasoning: string[];
  status: 'probable' | 'alternate' | 'unlikely';
}

export default function ScenarioSimulation() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState<any>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  useEffect(() => {
    fetchScenarios();
  }, [id]);

  const fetchScenarios = async () => {
    try {
      const response = await fetch(`/api/cases/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setCaseData(data);
        const mappedScenarios = (data.scenarios || []).map((s: any, idx: number) => ({
          id: s.id,
          title: s.name,
          probability: s.probability,
          status: s.probability > 0.6 ? 'probable' : s.probability > 0.3 ? 'alternate' : 'unlikely',
          description: s.description,
          reasoning: s.contradictions || []
        }));
        setScenarios(mappedScenarios);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-black text-primary font-mono select-none">
       <Brain className="w-12 h-12 mb-6 animate-pulse" />
       <p className="text-[10px] uppercase tracking-[0.5em] font-black italic">Running_Scenario_Simulations_v9...</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-black overflow-hidden relative select-none">
      <main className="flex-1 overflow-y-auto p-12 max-w-7xl mx-auto w-full space-y-16 custom-scrollbar pb-32">
        <div className="flex flex-col space-y-4">
           <div className="flex items-center space-x-3">
              <Terminal className="w-4 h-4 text-primary animate-pulse" />
              <h2 className="text-[11px] font-mono text-zinc-600 uppercase tracking-[0.4em]">Predictive_Outcome_Matrix</h2>
           </div>
           <p className="text-[10px] font-mono text-zinc-800 uppercase tracking-widest leading-loose max-w-2xl">
              Analyzing fragmented evidence particles to reconstruct alternate histories. Confidence scores based on neural vector alignment.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <AnimatePresence>
              {scenarios.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className={cn(
                    "bg-zinc-950 border border-zinc-900 p-6 flex flex-col h-full group hover:border-primary/20 transition-all relative overflow-hidden",
                    s.status === 'probable' ? 'border-primary/30 shadow-[0_0_30px_rgba(212,255,0,0.05)]' : ''
                  )}>
                    {s.status === 'probable' && (
                      <div className="absolute top-0 right-0 p-1 opacity-20">
                         <Zap className="w-4 h-4 text-primary animate-pulse" />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mb-8">
                       <span className="text-[9px] font-mono text-zinc-800 uppercase tracking-[0.5em]">Scenario_{s.id}</span>
                       <div className="flex items-baseline space-x-2">
                          <span className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest">Conf:</span>
                          <span className="text-xl font-black text-primary tracking-tighter">{(s.probability * 100).toFixed(0)}%</span>
                       </div>
                    </div>

                    <h3 className="text-sm font-black text-zinc-400 group-hover:text-primary transition-colors uppercase tracking-tight mb-4">{s.title}</h3>
                    <p className="text-[11px] font-mono text-zinc-600 leading-relaxed mb-8 italic lowercase">
                       {s.description}
                    </p>

                    <div className="space-y-4 mb-10">
                       <div className="flex items-center space-x-2 border-b border-zinc-900 pb-2">
                          <Brain className="w-3.5 h-3.5 text-primary/40" />
                          <span className="text-[8px] font-mono text-zinc-700 uppercase tracking-[0.2em]">Reasoning_Chain_Trace</span>
                       </div>
                       <div className="space-y-2">
                          {s.reasoning.map((r, ri) => (
                            <div key={ri} className="flex items-start space-x-3 group/item">
                               <div className="w-1 h-px bg-primary/20 group-hover/item:w-3 group-hover/item:bg-primary transition-all mt-2" />
                               <p className="text-[9px] font-mono text-zinc-700 group-hover/item:text-zinc-500 transition-colors uppercase tracking-tight leading-4">{r}</p>
                            </div>
                          ))}
                       </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-zinc-900 flex items-center justify-between">
                       <div className="flex items-center space-x-1 grayscale opacity-50 group-hover:opacity-100 transition-opacity">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span className="text-[9px] font-mono text-zinc-800 uppercase tracking-widest">Validated</span>
                       </div>
                       <Button variant="ghost" className="h-8 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-none px-4">
                          Deep_Trace
                       </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
           </AnimatePresence>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 p-10 relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
           <div className="absolute bottom-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
              <ShieldAlert className="w-24 h-24 text-primary" />
           </div>
           
           <div className="flex items-start space-x-10 relative z-10">
              <div className="p-5 border border-primary/20 bg-primary/5 animation-pulse">
                 <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <div className="flex-1 space-y-6">
                 <div className="space-y-2">
                    <h3 className="text-xl font-black text-zinc-100 uppercase tracking-tighter italic">AI_Reconstruction_Executive_Summary</h3>
                    <p className="text-[9px] font-mono text-zinc-700 uppercase tracking-[0.4em]">Comparative_Cross_Reality_Synthesis</p>
                 </div>
                 <p className="text-[12px] text-zinc-500 font-mono leading-relaxed max-w-4xl opacity-80 uppercase tracking-tighter">
                    {scenarios.find(s => s.status === 'probable')?.description || "Analysis in progress. Forensic engine is currently synthesizing multi-point telemetry to reconstruct most likely event sequence. Upload additional evidence to refine probability matrix."}
                 </p>
                 <div className="flex items-center space-x-10 pt-6">
                    <div className="flex items-center space-x-3 group/stat cursor-help">
                       <Activity className="w-4 h-4 text-primary/40 group-hover/stat:text-primary transition-colors" />
                       <div className="flex flex-col">
                          <span className="text-[8px] font-mono text-zinc-800 uppercase tracking-widest">Confidence_Factor</span>
                          <span className="text-[10px] font-black text-zinc-400 group-hover/stat:text-primary transition-colors">STABLE [92%]</span>
                       </div>
                    </div>
                    <div className="flex items-center space-x-3 group/stat cursor-help">
                       <AlertCircle className="w-4 h-4 text-red-900 group-hover/stat:text-red-500 transition-colors" />
                       <div className="flex flex-col">
                          <span className="text-[8px] font-mono text-zinc-800 uppercase tracking-widest">Dissonance_Level</span>
                          <span className="text-[10px] font-black text-zinc-400 group-hover/stat:text-red-500 transition-colors">ELEVATED [4 DET]</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
