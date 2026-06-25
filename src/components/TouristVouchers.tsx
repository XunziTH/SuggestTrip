import React from 'react';
import { Promotion, UserVoucher } from '../types';

interface TouristVouchersProps {
  promotions: Promotion[];
  points: number;
  setPoints: React.Dispatch<React.SetStateAction<number>>;
  vouchers: UserVoucher[];
  setVouchers: React.Dispatch<React.SetStateAction<UserVoucher[]>>;
  onRedeemPromo: (promo: Promotion) => void;
  onUseVoucher: (idx: number) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function TouristVouchers({
  promotions,
  points,
  setPoints,
  vouchers,
  setVouchers,
  onRedeemPromo,
  onUseVoucher,
  showToast
}: TouristVouchersProps) {
  return (
    <div className="space-y-6">
      
      {/* Loyalty Header */}
      <div className="bg-slate-900 rounded-3xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1 text-center sm:text-left">
          <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest">
            Phetchaburi Go! Privilege Club
          </span>
          <h3 className="text-base sm:text-lg font-display font-bold">คะแนนสะสมการท่องเที่ยวเมืองเพชรของคุณ: {points} พอยท์ ⭐</h3>
          <p className="text-[10px] text-slate-300">สะสมเพิ่มทันทีเมื่อสแกนเช็คอินหรือเยี่ยมชมร้านค้าพันธมิตรจริง</p>
        </div>

        <button
          onClick={() => {
            setPoints(points + 100);
            showToast("🎉 สแกนเช็คอินการเดินทางท่องเที่ยวสำเร็จ! ได้รับเพิ่ม +100 แต้มสะสมอัจฉริยะ", "success");
          }}
          className="bg-white hover:bg-slate-50 text-slate-900 font-bold px-3.5 py-2.5 rounded-xl text-[10px] shadow-sm shrink-0 cursor-pointer transition-colors"
        >
          🤳 เช็คอินพิกัดรับแต้ม (+100)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Available promotions lists */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h4 className="font-display font-bold text-slate-900 text-sm">คูปองส่วนลดเด็ดร้านค้าพันธมิตร</h4>
            <p className="text-[10px] text-slate-400 font-medium">ใช้แต้มสะสมแลกรับดีลส่วนลดราคาประหยัดจริงจากผู้ประกอบการเมืองเพชรบุรี</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {promotions.map((p) => (
              <div key={p.id} className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:bg-white hover:shadow-sm transition-all">
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="bg-slate-200 text-slate-800 text-[8px] font-bold px-2 py-0.5 rounded-md uppercase border border-slate-300/40">
                      ส่วนลด {p.discount}
                    </span>
                    <span className="text-[9px] font-bold text-slate-700 truncate max-w-[120px]">{p.providerName}</span>
                  </div>
                  <h5 className="font-display font-bold text-slate-900 text-xs">{p.title}</h5>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{p.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <div className="text-xs">
                    <p className="text-[8px] text-slate-400">พอยท์ที่ใช้แลก</p>
                    <p className="font-mono font-bold text-slate-900">{p.pointsRequired} ⭐</p>
                  </div>
                  <button
                    onClick={() => onRedeemPromo(p)}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[9px] px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                  >
                    แลกดีลส่วนลด
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User wallet bags */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div className="border-b border-slate-100 pb-2">
            <h4 className="font-display font-bold text-slate-900 text-sm">กระเป๋าคูปองของฉัน ({vouchers.length} ใบ)</h4>
            <p className="text-[10px] text-slate-400">คูปองที่คุณแลกสำเร็จแล้ว สามารถใช้ได้โดยตรง</p>
          </div>

          {vouchers.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs flex flex-col items-center justify-center space-y-1">
              <span className="text-2xl">🎒</span>
              <span>กระเป๋าว่างเปล่า แลกรับดีลด้านซ้ายได้เลยครับ</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {vouchers.map((v, i) => (
                <div key={v.id || i} className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 animate-fadeIn">
                  <div className="space-y-1 text-xs">
                    <p className="text-[8px] text-slate-500 font-bold uppercase leading-none">{v.providerName}</p>
                    <h5 className="font-display font-bold text-slate-900 leading-tight">{v.title}</h5>
                    <p className="text-[9px] text-slate-500 font-mono mt-1">
                      CODE: <span className="bg-white px-2 py-0.5 border rounded-lg text-slate-800 font-bold">{v.code}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => onUseVoucher(i)}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[9px] px-3 py-2 rounded-xl transition-all shrink-0 cursor-pointer"
                  >
                    สแกนใช้
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
