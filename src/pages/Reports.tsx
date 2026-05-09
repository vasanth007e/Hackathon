import { Terminal, FileDown, ShieldCheck, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Reports() {
  return (
    <div className="h-full flex flex-col bg-black p-12 space-y-12 select-none overflow-y-auto custom-scrollbar">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Terminal className="w-4 h-4 text-primary animate-pulse" />
          <h2 className="text-[11px] font-mono text-zinc-600 uppercase tracking-[0.4em]">Forensic_Report_Manifest</h2>
        </div>
        <p className="text-[10px] font-mono text-zinc-800 uppercase tracking-widest leading-loose max-w-2xl">
          Exporting investigative findings into secure, court-ready neural containers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { title: 'Full Investigation Dossier', type: 'ENCRYPTED_PDF', size: '14.2MB', date: '2026-05-30' },
          { title: 'Kinetic Reconstruction Export', type: 'LIDAR_BIN', size: '256.0MB', date: '2026-05-29' },
          { title: 'Neural Reasoning Trace', type: 'JSON_MANIFEST', size: '1.1MB', date: '2026-05-29' },
          { title: 'Chain of Custody Log', type: 'BLOCKCHAIN_REF', size: '0.4MB', date: '2026-05-28' },
        ].map((report, i) => (
          <div key={i} className="bg-zinc-950 border border-zinc-900 p-8 flex items-center justify-between group hover:border-primary/20 transition-all">
             <div className="flex items-center space-x-6">
                <div className="w-12 h-12 bg-black flex items-center justify-center border border-zinc-900 group-hover:border-primary/30 transition-all">
                   <FileDown className="w-5 h-5 text-zinc-700 group-hover:text-primary transition-colors" />
                </div>
                <div className="space-y-1">
                   <h3 className="text-sm font-black text-zinc-400 group-hover:text-primary transition-colors uppercase tracking-tight">{report.title}</h3>
                   <div className="flex items-center space-x-4 opacity-40">
                      <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">{report.type}</span>
                      <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">{report.size}</span>
                   </div>
                </div>
             </div>
             <Button variant="ghost" className="h-10 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-none px-6">
                Download_Ref
             </Button>
          </div>
        ))}
      </div>

      <div className="bg-zinc-950 border border-zinc-900 p-10 flex items-center justify-between">
         <div className="flex items-center space-x-8">
            <ShieldCheck className="w-10 h-10 text-emerald-900" />
            <div className="space-y-1">
               <h3 className="text-sm font-black text-emerald-800 uppercase tracking-widest">Integrity_Shield_Active</h3>
               <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-tighter">All reports are cryptographically signed by the kernel master key.</p>
            </div>
         </div>
         <div className="flex items-center space-x-3">
            <div className="text-right">
               <p className="text-[8px] font-mono text-zinc-800 uppercase">Master Hash</p>
               <p className="text-[9px] font-mono text-zinc-600">0x9F2E...4A1C</p>
            </div>
            <Activity className="w-5 h-5 text-emerald-950" />
         </div>
      </div>
    </div>
  );
}
