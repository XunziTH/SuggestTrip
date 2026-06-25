import React from 'react';
import { Attraction, Restaurant, Hotel } from '../types';

interface TouristPlacesProps {
  attractions: Attraction[];
  restaurants: Restaurant[];
  hotels: Hotel[];
  placesFilter: string;
  setPlacesFilter: (f: string) => void;
  onQuickPlan: (name: string) => void;
  promotions: any[];
  setTouristActiveTab: (tab: string) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function TouristPlaces({
  attractions,
  restaurants,
  hotels,
  placesFilter,
  setPlacesFilter,
  onQuickPlan,
  promotions,
  setTouristActiveTab,
  showToast
}: TouristPlacesProps) {
  
  const getCombinedList = () => {
    let list: any[] = [];
    if (placesFilter === 'all' || placesFilter === 'attractions') {
      list = [...list, ...attractions];
    }
    if (placesFilter === 'all' || placesFilter === 'restaurants') {
      list = [...list, ...restaurants];
    }
    if (placesFilter === 'all' || placesFilter === 'hotels') {
      list = [...list, ...hotels];
    }
    return list;
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200/80 max-w-fit shadow-sm">
        {[
          { id: 'all', label: 'ทั้งหมด ⭐' },
          { id: 'attractions', label: '🏖️ แหล่งท่องเที่ยวเด่น' },
          { id: 'restaurants', label: '🍳 ของกินและคาเฟ่ห้ามพลาด' },
          { id: 'hotels', label: '🏨 โรงแรมที่พักพันธมิตร' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setPlacesFilter(tab.id)}
            className={`px-3.5 py-2 text-[10px] font-bold rounded-xl transition-all cursor-pointer ${placesFilter === tab.id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {getCombinedList().map((item) => (
          <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col h-full group">
            
            <div className="relative h-44 overflow-hidden bg-slate-50 shrink-0">
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-slate-800 text-[8px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm border border-slate-100">
                {item.tag?.split('/')[0]}
              </span>
              <span className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur-md text-amber-400 text-[9px] font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
                ⭐ {item.rating}
              </span>
            </div>

            <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display font-bold text-slate-900 text-sm leading-tight">{item.name}</h3>
                  <span className="text-[9px] font-medium text-slate-400 shrink-0 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-md">📍 {item.location}</span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 leading-relaxed line-clamp-2">{item.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100/80 flex items-center justify-between gap-1.5">
                <button
                  onClick={() => onQuickPlan(item.name)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] px-4 py-2.5 rounded-xl transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  🎯 จัดทริปไปที่นี่
                </button>

                {promotions.some(p => p.providerId === item.id) ? (
                  <button
                    onClick={() => {
                      setTouristActiveTab('transactions');
                      showToast(`🎫 ค้นพบดีลพิเศษสำหรับ "${item.name}" แล้ว! เลื่อนดูได้จากตารางคูปองหลัก`, 'info');
                    }}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/50 text-[9px] font-bold px-3 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    มีดีล 🎁
                  </button>
                ) : (
                  <span className="bg-slate-50 text-slate-400 text-[8px] px-2.5 py-2.5 rounded-lg font-bold border border-slate-100">
                    แนะนำชม 🌟
                  </span>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
