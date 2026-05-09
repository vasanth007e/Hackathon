import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  Search, 
  Cpu, 
  Map as MapIcon, 
  Clock, 
  AlertCircle, 
  Zap, 
  FileText, 
  Settings,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Layers,
  Activity,
  Network,
  Terminal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface Case {
  id: string;
  name: string;
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { logout, user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [recentCases, setRecentCases] = useState<Case[]>([]);

  useEffect(() => {
    if (token) {
      fetch('/api/cases', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRecentCases(data.slice(0, 5));
      })
      .catch(console.error);
    }
  }, [token, location.pathname]);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Investigations', icon: FileText, path: '/investigations' },
    { name: 'Knowledge Graph', icon: Network, path: '/graph' },
    { name: 'Temporal Log', icon: Clock, path: '/timeline' },
    { name: 'GPS Recon', icon: MapIcon, path: '/gps/active' },
    { name: 'Contradictions', icon: AlertCircle, path: '/contradictions' },
    { name: 'Simulation', icon: Zap, path: '/simulation/active' },
    { name: 'Witness Logs', icon: FileText, path: '/witness' },
    { name: 'Reports', icon: Layers, path: '/reports' },
  ];

  return (
    <div className="flex h-screen w-screen bg-black overflow-hidden text-zinc-300 font-sans selection:bg-primary/30 antialiased">
      {/* SCANLINE OVERLAY */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)50%,rgba(0,0,0,0.25)50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      
      {/* PERSISTENT SIDEBAR */}
      <aside 
        className={cn(
          "border-r border-zinc-900 bg-zinc-950 flex flex-col transition-all duration-300 z-50 shrink-0",
          isSidebarCollapsed ? "w-16" : "w-60"
        )}
      >
        <div className="h-12 border-b border-zinc-900 flex items-center px-4 shrink-0 bg-black">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="p-1 bg-primary/10 rounded-sm border border-primary/20 shrink-0">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            {!isSidebarCollapsed && (
              <span className="font-black tracking-tighter uppercase text-xs flex items-center text-white">
                AIVENTRA <span className="text-primary ml-1.5 font-bold px-1 py-0.5 bg-primary/10 rounded-sm text-[8px]">V4.2</span>
              </span>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <div key={item.name} className="relative">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Link
                        to={item.path}
                        className={cn(
                          "flex items-center space-x-3 px-3 py-2 rounded-sm transition-all group relative",
                          isActive 
                            ? "bg-primary/5 text-primary" 
                            : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
                        )}
                      >
                        <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-primary" : "group-hover:text-primary transition-colors")} />
                        {!isSidebarCollapsed && (
                          <span className="text-[10px] font-mono uppercase tracking-[0.1em] truncate font-medium">{item.name}</span>
                        )}
                      </Link>
                    }
                  />
                  {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-3 bg-primary rounded-l-full" />}
                  {isSidebarCollapsed && <TooltipContent side="right" className="bg-black border-zinc-800 text-primary text-[10px] uppercase font-mono">{item.name}</TooltipContent>}
                </Tooltip>
            </div>
          );
          })}
          
          <div className="my-4 mx-2 h-[1px] bg-zinc-900/50 relative">
             {!isSidebarCollapsed && <span className="absolute -top-2 left-2 bg-zinc-950 px-2 text-[7px] font-mono text-zinc-700 uppercase tracking-[0.2em]">Live_Nodes</span>}
          </div>
          
          <div className="px-1 space-y-0.5">
            {recentCases.map(c => (
              <button 
                key={c.id}
                onClick={() => navigate(`/investigation/${c.id}`)}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-1.5 rounded-sm hover:bg-zinc-900 text-zinc-600 text-[9px] font-mono group transition-colors",
                  location.pathname.includes(c.id) && "text-primary/80 bg-primary/5"
                )}
              >
                 <Terminal className={cn("w-3 h-3 shrink-0 opacity-40 group-hover:opacity-100 group-hover:text-primary", location.pathname.includes(c.id) && "text-primary opacity-100")} />
                 {!isSidebarCollapsed && <span className="truncate uppercase">{c.name}</span>}
              </button>
            ))}
          </div>
        </nav>

        <div className="p-3 border-t border-zinc-900 space-y-2 shrink-0 bg-black/40">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-7 h-7 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <span className="text-[9px] font-black text-primary">{user?.name?.charAt(0) || 'A'}</span>
            </div>
            {!isSidebarCollapsed && (
              <div className="overflow-hidden">
                <p className="text-[9px] font-black text-zinc-200 truncate uppercase mt-0.5">{user?.name || 'Agent'}</p>
                <div className="flex items-center text-[7px] font-mono text-zinc-600 uppercase tracking-widest">
                   <div className="w-1 h-1 rounded-full bg-primary/60 mr-1.5 animate-pulse" />
                   LINK_OK
                </div>
              </div>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={logout}
            className="w-full justify-start text-zinc-700 hover:text-primary h-7 p-1 group hover:bg-transparent"
          >
            <LogOut className="w-3 h-3 mr-2 group-hover:translate-x-0.5 transition-transform" />
            {!isSidebarCollapsed && <span className="text-[8px] font-mono uppercase tracking-widest">DISCONNECT</span>}
          </Button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-black">
        {/* TACTICAL HEADER */}
        <header className="h-12 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between px-6 shrink-0 z-40">
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="text-zinc-600 hover:text-primary transition-colors p-1"
            >
              <Cpu className="w-3 h-3" />
            </button>
            <div className="flex items-center space-x-2 text-[8px] font-mono text-zinc-700 uppercase tracking-[0.2em]">
              <span className="hover:text-zinc-500 cursor-pointer transition-colors" onClick={() => navigate('/dashboard')}>BASE</span>
              <ChevronRight className="w-2.5 h-2.5 text-zinc-800" />
              <span className={cn(location.pathname === '/dashboard' ? 'text-primary' : 'text-zinc-500')}>TRIAGE</span>
              {location.pathname.includes('/investigation') && (
                <>
                  <ChevronRight className="w-2.5 h-2.5 text-zinc-900" />
                  <span className="text-primary font-bold">RECON</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-8">
             <div className="flex items-center space-x-5">
                <div className="flex flex-col items-end">
                   <span className="text-[7px] font-mono text-zinc-800 uppercase tracking-widest">Latency</span>
                   <span className="text-[8px] font-mono text-primary/80 font-bold">0.02MS</span>
                </div>
                <div className="h-5 w-px bg-zinc-900" />
                <div className="flex flex-col items-end">
                   <span className="text-[7px] font-mono text-zinc-800 uppercase tracking-widest">Session</span>
                   <span className="text-[8px] font-mono text-zinc-500 font-bold tracking-tighter">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
             </div>

             <div className="relative group hidden md:block">
                <div className="flex items-center space-x-3 px-3 py-1.5 bg-zinc-900/30 overflow-hidden border border-zinc-900 rounded-sm text-[8px] font-mono uppercase tracking-widest text-zinc-600 group-hover:border-primary/20 transition-all cursor-help hover:bg-zinc-900 px-4">
                   <Search className="w-2.5 h-2.5 text-primary/40" />
                   <span>QUERY_DB</span>
                   <span className="ml-4 opacity-20 text-[7px] border border-zinc-800 px-1 rounded-sm">CTRL+K</span>
                </div>
             </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="flex-1 overflow-hidden relative bg-[radial-gradient(circle_at_center,rgba(229,255,0,0.01)_0%,transparent_100%)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="h-full w-full overflow-hidden"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* SYSTEM STATUS FOOTER */}
        <footer className="h-6 border-t border-zinc-950 bg-black px-4 flex items-center justify-between text-[7px] font-mono uppercase tracking-[0.3em] text-zinc-800 shrink-0 z-40 select-none">
           <div className="flex items-center space-x-6">
              <span className="flex items-center"><Activity className="w-2.5 h-2.5 mr-2 text-primary/20" /> ENGINE: STABLE</span>
              <span className="flex items-center"><Settings className="w-2.5 h-2.5 mr-2 text-zinc-900" /> KERNEL: V4.2.0</span>
           </div>
           <div className="flex items-center space-x-6">
              <span className="hidden sm:inline">SHA256_ACTIVE</span>
              <span className="text-primary/60 flex items-center">
                 <div className="w-1 h-1 rounded-full bg-primary/40 mr-2 animate-pulse" />
                 RECON_ACTIVE
              </span>
           </div>
        </footer>
      </main>
    </div>
  );
}
