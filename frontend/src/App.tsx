import React, { useState, useEffect, useRef } from 'react';
import { Radar } from 'lucide-react';
import type { FeedItem } from './types';
import Header from './components/Header';
import MutationCard from './components/MutationCard';
import SystemStatus from './components/SystemStatus';
import { AnimatedList, AnimatedListItem } from './components/AnimatedList';

export default function App() {
  const [visibleFeed, setVisibleFeed] = useState<FeedItem[]>([]);
  const [isLive, setIsLive] = useState(false);

  // Buffer references to manage the stream without causing infinite re-renders
  const seenIds = useRef<Set<string>>(new Set());
  const pendingQueue = useRef<FeedItem[]>([]);

  // 1. Fetching Logic: Grabs data from API and puts it in the hidden waiting line
  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/feed');
        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            // Reverse the array so we process the oldest unseen items first
            const incomingItems = [...data.data].reverse();
            
            incomingItems.forEach((item) => {
              const uniqueId = `${item.timestamp}-${item.title}`;
              // If we haven't seen this article yet, add it to our waiting line
              if (!seenIds.current.has(uniqueId)) {
                seenIds.current.add(uniqueId);
                pendingQueue.current.push(item);
              }
            });
          }
          setIsLive(true);
        } else {
          setIsLive(false);
        }
      } catch (error) {
        setIsLive(false);
      }
    };
    
    fetchFeed();
    const interval = setInterval(fetchFeed, 3000); 
    return () => clearInterval(interval);
  }, []);

  // 2. The Trickle Engine: Drops one item onto the screen every 800ms
  useEffect(() => {
    const trickleInterval = setInterval(() => {
      if (pendingQueue.current.length > 0) {
        // Take the first item out of the waiting line
        const nextItem = pendingQueue.current.shift(); 
        
        if (nextItem) {
          setVisibleFeed((prevVisible) => {
            // Add the new item to the top, and cut off the bottom so we only keep 6
            const newFeed = [nextItem, ...prevVisible];
            return newFeed.slice(0, 6); 
          });
        }
      }
    }, 800); // Drop a new card every 800 milliseconds

    return () => clearInterval(trickleInterval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dcece3] via-[#f2efe9] to-[#f4e2d2] text-gray-800 font-sans p-4 md:p-8 selection:bg-orange-200">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Feed */}
        <div className="lg:col-span-8 space-y-6">
          <Header />
          
          <div className="text-xs font-bold text-gray-400 tracking-widest uppercase ml-4">
            Live Vector Ingestion Stream
          </div>

          <div className="min-h-[600px] overflow-hidden">
            {visibleFeed.length === 0 ? (
              <div className="bg-white/60 backdrop-blur-md rounded-[32px] p-12 flex flex-col items-center justify-center text-center border border-white/50 shadow-sm min-h-[300px]">
                <Radar className="w-12 h-12 text-orange-400 animate-spin-slow mb-4 opacity-80" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">Awaiting Real Data...</h3>
                <p className="text-gray-500 max-w-sm">
                  The dashboard is connected. Start your Scraper and ML Analyzer to see the stream.
                </p>
              </div>
            ) : (
              <AnimatedList>
                {visibleFeed.map((item) => (
                  // Key is crucial here: it tells Framer Motion exactly which item is moving down
                  <AnimatedListItem key={`${item.timestamp}-${item.title}`}>
                    <MutationCard item={item} />
                  </AnimatedListItem>
                ))}
              </AnimatedList>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Status Panel */}
        <div className="lg:col-span-4">
          <SystemStatus alerts={visibleFeed} isLive={isLive} />
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .animate-spin-slow { animation: spin 4s linear infinite; }
      `}} />
    </div>
  );
}