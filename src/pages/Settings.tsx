import { Terminal, Shield, Cpu, Lock, Bell, Zap, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Settings() {
  const sections = [
    { title: 'Security_&_Auth', icon: Lock, desc: 'Configure neural encryption layers and biometric bypass keys.' },
    { title: 'Kernel_Config', icon: Cpu, desc: 'Adjust vector processing priority and thread allocation.' },
    { title: 'Notification_Pulse', icon: Bell, desc: 'Manage operational alert thresholds and dissonance flags.' },
    { title: 'Data_Vault_Sync', icon: Database, desc: 'Verify PostgreSQL bridge integrity and backup manifests.' },
  ];

  return (
    <div className="h-full flex flex-col bg-black p-12 space-y-12 select-none overflow-y-auto custom-scrollbar">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Terminal className="w-4 h-4 text-primary animate-pulse" />
          <h2 className="text-[11px] font-mono text-zinc-600 uppercase tracking-[0.4em]">System_Parameters_v4</h2>
        </div>
        <p className="text-[10px] font-mono text-zinc-800 uppercase tracking-widest leading-loose max-w-2xl">
          Fine-tuning the forensic kernel. Caution: Any modifications to thermal limits may cause neural dissonance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map((section, i) => (
          <div key={i} className="bg-zinc-950 border border-zinc-900 p-8 flex flex-col group hover:border-primary/20 transition-all cursor-pointer">
             <div className="flex items-center space-x-4 mb-6">
                <section.icon className="w-5 h-5 text-zinc-700 group-hover:text-primary transition-colors" />
                <h3 className="text-sm font-black text-zinc-400 group-hover:text-primary transition-colors uppercase tracking-tight">{section.title}</h3>
             </div>
             <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-tighter leading-relaxed mb-8">
                {section.desc}
             </p>
             <Button variant="ghost" className="h-8 ml-auto text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-none px-4">
                Access_Module
             </Button>
          </div>
        ))}
      </div>

      <div className="border-t border-zinc-900 pt-12 flex items-center justify-between opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
         <div className="flex items-center space-x-8">
            <Zap className="w-8 h-8 text-primary" />
            <div className="space-y-1">
               <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">AIVENTRA OS v4.2.0-STABLE</h3>
               <p className="text-[8px] font-mono text-zinc-700 uppercase tracking-[0.2em]">All systems operational. No dissonance detected.</p>
            </div>
         </div>
         <Button variant="destructive" className="h-10 text-[9px] font-black uppercase tracking-widest rounded-none px-8">
            Factory_Reset_Kernel
         </Button>
      </div>
    </div>
  );
}
