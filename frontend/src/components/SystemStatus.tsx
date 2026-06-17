// src/components/SystemStatus.tsx
import React from 'react';
import { ShieldAlert, Cpu, Network, Check, Activity } from 'lucide-react';

interface MutationAlert {
  distance_score: number;
}

interface Props {
  alerts: MutationAlert[];
  isLive: boolean;
}

export default function SystemStatus({ alerts, isLive }: Props) {
  const avgVariance = alerts.length > 0 
    ? (alerts.reduce((acc, curr) => acc + curr.distance_score, 0) / alerts.length).toFixed(2) 
    : "0.00";

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[40px] p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-white/60 sticky top-8">
      
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-medium flex items-center gap-2">
          System Status
          {/* Removed the fake dropdown arrow */}
        </h2>
        {/* Removed the fake expand button */}
      </div>

      {/* Radar & Stats */}
      <div className="flex gap-6 relative">
        {/* Radar */}
        <div className="flex-1 rounded-[32px] bg-gradient-to-b from-[#e8f0eb] to-[#d6e5dc] relative overflow-hidden h-[300px] border border-white/50 shadow-inner flex items-center justify-center">
          <div className="absolute inset-0 opacity-20">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-gray-800 stroke-[0.5]">
              <circle cx="50" cy="50" r="10" />
              <circle cx="50" cy="50" r="25" />
              <circle cx="50" cy="50" r="40" />
              <path d="M 50 0 L 50 100 M 0 50 L 100 50" strokeDasharray="2 2" />
            </svg>
          </div>
          
          <div className="relative w-full h-full">
            <div className={`absolute top-[30%] left-[20%] w-3 h-3 bg-white rounded-full shadow-md ${isLive ? 'animate-pulse' : ''}`}></div>
            <div className="absolute top-[60%] left-[40%] w-2 h-2 bg-white/60 rounded-full"></div>
            <div className={`absolute top-[40%] right-[30%] w-4 h-4 bg-[#ea580c] rounded-full shadow-[0_0_15px_rgba(234,88,12,0.4)] flex items-center justify-center ${alerts.length > 0 ? 'animate-bounce' : ''}`}>
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
            <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
              <path d="M 25% 32% Q 40% 50% 65% 42%" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
            </svg>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full p-1 shadow-lg">
            <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center text-white">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="w-24 flex flex-col justify-between py-2 text-right">
          <div>
            <div className="flex justify-end mb-1"><Network className="w-4 h-4 text-gray-400" /></div>
            <div className="text-[10px] text-gray-400 uppercase font-medium tracking-wide">Total Items</div>
            <div className="text-xl font-medium">{alerts.length * 2} <span className="text-xs text-gray-400">nodes</span></div>
          </div>
          <div>
            <div className="flex justify-end mb-1"><ShieldAlert className="w-4 h-4 text-gray-400" /></div>
            <div className="text-[10px] text-gray-400 uppercase font-medium tracking-wide">Avg Variance</div>
            <div className="text-xl font-medium">{avgVariance} <span className="text-xs text-gray-400">dist</span></div>
          </div>
          <div>
            <div className="flex justify-end mb-1"><Check className="w-4 h-4 text-gray-400" /></div>
            <div className="text-[10px] text-gray-400 uppercase font-medium tracking-wide">API Status</div>
            <div className={`text-xl font-medium ${isLive ? 'text-green-600' : 'text-red-500'}`}>
              {isLive ? '100%' : 'Offline'}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Profile/Status Bar */}
      <div className="mt-8 pt-6 border-t border-gray-200/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-sm text-gray-900">Pipeline Active</div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-green-500' : 'bg-red-500'}`}></span>
              Redis Connected
            </div>
          </div>
        </div>
        
        <div className="flex gap-4 text-center">
          <div>
            <div className="text-sm font-medium">L2</div>
            <div className="text-[10px] text-gray-400 uppercase">FAISS</div>
          </div>
          <div className="w-px bg-gray-200"></div>
          <div>
            <div className="text-sm font-medium">384</div>
            <div className="text-[10px] text-gray-400 uppercase">Dims</div>
          </div>
        </div>
      </div>
    </div>
  );
}