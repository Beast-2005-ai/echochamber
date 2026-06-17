// src/components/MutationCard.tsx
import React from 'react';
import { MapPin, Activity, Clock, CheckCircle2 } from 'lucide-react';
import type { FeedItem } from '../types';

interface Props {
  item: FeedItem;
}

export default function MutationCard({ item }: Props) {
  const getTimeStr = (ts: number) => new Date(ts * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  return (
    <div className={`bg-white/80 backdrop-blur-md rounded-[32px] p-4 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] border transition-all ${item.is_mutation ? 'border-orange-500/50 ring-4 ring-orange-500/10' : 'border-white/60'}`}>
      
      {/* Time Details */}
      <div className="flex flex-col min-w-[100px] text-gray-500 space-y-1.5 justify-center pl-2">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
          <Clock className="w-4 h-4 text-gray-400" />
          {getTimeStr(item.timestamp)}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <MapPin className="w-3 h-3 text-gray-400" />
          Reddit RSS
        </div>
      </div>

      {/* Context */}
      <div className="flex-1 flex items-center gap-4 min-w-0 border-l border-gray-200 pl-6">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${item.is_mutation ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
          {item.is_mutation ? <Activity className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-gray-900 truncate text-base" title={item.title}>
              {item.title}
            </h3>
            {item.is_mutation && (
              <span className="bg-gray-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide shrink-0 animate-pulse">
                MUTATED
              </span>
            )}
          </div>
          {item.origin_title ? (
            <p className="text-gray-400 text-sm truncate" title={item.origin_title}>
              {item.is_mutation ? 'Origin: ' : 'Matched context: '} {item.origin_title}
            </p>
          ) : (
            <p className="text-gray-400 text-sm truncate">Unique entry added to vector space</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pr-2 shrink-0">
        <div className="text-right">
          <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Vector Dist</div>
          <div className={`font-mono font-medium ${item.is_mutation ? 'text-orange-500' : 'text-gray-400'}`}>
            {item.distance_score > 0 ? item.distance_score.toFixed(4) : '---'}
          </div>
        </div>
      </div>

    </div>
  );
}