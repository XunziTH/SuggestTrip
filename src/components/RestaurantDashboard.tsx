import React, { useState } from 'react';
import { Transaction } from '../types';

interface RestaurantDashboardProps {
  transactions: Transaction[];
  restSimDiscount: number;
  setRestSimDiscount: (d: number) => void;
  restSimTimeBlock: string;
  setRestSimTimeBlock: (t: string) => void;
  restSimDayType: string;
  setRestSimDayType: (d: string) => void;
  newPromo: any;
  setNewPromo: (p: any) => void;
  onAddPromo: (e: React.FormEvent) => void;
  onApplySimResults: () => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function RestaurantDashboard({
  transactions,
  restSimDiscount,
  setRestSimDiscount,
  restSimTimeBlock,
  setRestSimTimeBlock,
  restSimDayType,
  setRestSimDayType,
  newPromo,
  setNewPromo,
  onAddPromo,
  onApplySimResults,
  showToast
}: RestaurantDashboardProps) {

  const calculateRestSimResults = () => {
    const isOffPeak = restSimTimeBlock === "14:00 - 16:00 น." || restSimTimeBlock === "10:00 - 11:30 น.";
    const boostMultiplier = isOffPeak ? 2.2 : 1.1;
    const estimatedTrafficBoost = Math.round(restSimDiscount * boostMultiplier);
    const addedRevenue = Math.round((estimatedTrafficBoost / 100) * 8500);
    
    let marginRisk = "ต่ำ (ปลอดภัยมาก)";
    let marginRiskColor = "text-slate-600 bg-slate-50 border-slate-200";
    if (restSimDiscount > 30) {
      marginRisk = "สูง (กำไรค่อนข้างบาง)";
      marginRiskColor = "text-rose-700 bg-rose-50 border-rose-200";
    } else if (restSimDiscount >= 20) {
      marginRisk = "ปานกลาง (พอได้มาร์จิ้น)";
      marginRiskColor = "text-amber-700 bg-amber-50 border-amber-200";
    }

    return { estimatedTrafficBoost, addedRevenue, marginRisk, marginRiskColor };
  };

  const simResult = calculateRestSimResults();

  return (
    <div className="space-y-6">
      
      {/* Merchant Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <span className="text-[9px] bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded-full uppercase tracking-widest border border-slate-200/40">
            แผงควบคุมร้านอาหารพันธมิตร
          </span>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900 mt-2">
            เจ๊กเม้ง ก๋วยเตี๋ยวน้ำแดง 🍳
          </h1>
          <p className="text-xs text-slate-500">วิเคราะห์ข้อมูลความหนาแน่นของผู้ใช้สิทธิ์ เพื่อวางกลยุทธ์เวลาปล่อยดีลการตลาดในจังหวัดเพชรบุรี</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm text-center min-w-[90px]">
            <p className="text-[8px] text-slate-400 font-bold uppercase">ยอดขายผ่านแอป</p>
            <p className="text-sm font-bold text-slate-900">฿32,400</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm text-center min-w-[90px]">
            <p className="text-[8px] text-slate-400 font-bold uppercase">ผู้สแกนสิทธิ์วันนี้</p>
            <p className="text-sm font-bold text-slate-900">48 คน</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Peak Hours charts */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-display font-bold text-slate-800 text-xs sm:text-sm">ช่วงเวลาหนาแน่นของร้านค้า (Peak Hours Tracker)</h3>
              <p className="text-[10px] text-slate-400 font-medium">ประเมินพฤติกรรมการแวะชิมของกลุ่มผู้ใช้แอปตามประเภทวันเพื่อลดความแออัดของโต๊ะ</p>
            </div>
            
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setRestSimDayType("weekday")}
                className={`px-3 py-1.5 text-[9px] font-bold rounded-lg transition-all cursor-pointer ${restSimDayType === "weekday" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
              >
                วันธรรมดา 📅
              </button>
              <button
                onClick={() => setRestSimDayType("weekend")}
                className={`px-3 py-1.5 text-[9px] font-bold rounded-lg transition-all cursor-pointer ${restSimDayType === "weekend" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
              >
                เสาร์-อาทิตย์ 🎉
              </button>
            </div>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-3 border-b border-slate-100 px-1">
            {[
              { hour: '10:00 น.', regular: restSimDayType === "weekday" ? 15 : 40, promo: restSimDayType === "weekday" ? 5 : 20, bg: 'bg-slate-400' },
              { hour: '12:00 น.', regular: restSimDayType === "weekday" ? 95 : 100, promo: restSimDayType === "weekday" ? 45 : 65, bg: 'bg-slate-900' },
              { hour: '14:00 น.', regular: restSimDayType === "weekday" ? 45 : 80, promo: restSimDayType === "weekday" ? 30 : 55, bg: 'bg-slate-400' },
              { hour: '16:00 น.', regular: restSimDayType === "weekday" ? 20 : 50, promo: restSimDayType === "weekday" ? 15 : 40, bg: 'bg-slate-300' },
              { hour: '18:00 น.', regular: restSimDayType === "weekday" ? 80 : 90, promo: restSimDayType === "weekday" ? 50 : 70, bg: 'bg-slate-900' }
            ].map((data, i) => (
              <div key={i} className="flex flex-col items-center flex-grow space-y-1">
                <div className="w-full flex items-end justify-center gap-1.5 h-32 relative">
                  <div 
                    className="w-3 bg-slate-100 border border-slate-200/50 rounded-t-lg transition-all duration-500"
                    style={{ height: `${data.regular}%` }}
                  ></div>
                  <div 
                    className={`w-3 ${data.bg} rounded-t-lg transition-all duration-500`}
                    style={{ height: `${data.promo}%` }}
                  ></div>
                </div>
                <span className="text-[8px] font-bold text-slate-400">{data.hour}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-semibold text-slate-500">
                <span className="h-2.5 w-2.5 bg-slate-150 border rounded-md inline-block"></span> Walk-in ทั่วไป
              </span>
              <span className="flex items-center gap-1 font-semibold text-slate-800">
                <span className="h-2.5 w-2.5 bg-slate-900 rounded-md inline-block"></span> คูปองในแอป Phetchaburi Go!
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60 text-slate-800 text-[9px] max-w-sm flex items-start gap-1.5 leading-relaxed">
              <span>💡</span>
              <p>
                {restSimDayType === "weekday" 
                  ? "วันธรรมดาช่วงบ่ายสองโมง (14:00) ร้านมีกำลังการผลิตเหลืออยู่มาก แนะนำให้อัดดีล % ส่วนลดพิเศษในช่วงบ่ายนี้เพื่อดึงดูดกลุ่มนักเดินทางที่ชอบความเงียบสงบ"
                  : "วันหยุดเสาร์อาทิตย์ยอดแน่นทั้งวัน การออกดีลอาหารเพิ่มควรเน้นไปที่การลดราคาของหวาน เพื่อกระตุ้นยอดขายมื้อบ่ายที่โต๊ะหมุนเวียนได้เร็วขึ้น"}
              </p>
            </div>
          </div>
        </div>

        {/* DSS Simulator */}
        <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <span className="text-base">🔮</span>
              <div>
                <h3 className="font-display font-bold text-white text-xs">เครื่องมือจำลองแผนการตลาด (What-If DSS)</h3>
                <p className="text-[9px] text-slate-400">ลากสไลด์พยากรณ์พฤติกรรมลูกค้าและมาร์จิ้นก่อนอัปเดตจริง</p>
              </div>
            </div>

            <div className="space-y-4 mt-4 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-[11px]">
                  <span className="text-slate-400">1. กำหนดเปอร์เซ็นต์ส่วนลด:</span>
                  <span className="text-slate-100 font-bold">{restSimDiscount}% OFF</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={restSimDiscount}
                  onChange={e => setRestSimDiscount(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-slate-400 font-bold text-[11px]">2. ช่วงเวลาปล่อยแคมเปญ:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {["10:00 - 11:30 น.", "12:00 - 13:30 น.", "14:00 - 16:00 น.", "18:00 - 20:00 น."].map((time) => (
                    <button
                      key={time}
                      onClick={() => setRestSimTimeBlock(time)}
                      className={`py-1 rounded px-1 text-[8px] font-bold border transition-all cursor-pointer ${restSimTimeBlock === time ? 'border-white bg-white/10 text-white font-bold' : 'border-slate-800 bg-slate-950 text-slate-500'}`}
                    >
                      {time === "12:00 - 13:30 น." ? "🕛 เที่ยงวัน (Peak)" : time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">คาดการณ์พฤติกรรมและผลกำไร:</p>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                    <p className="text-[8px] text-slate-400">อัตราลูกค้าเพิ่มขึ้น</p>
                    <p className="text-xs font-bold text-white">+{simResult.estimatedTrafficBoost}%</p>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                    <p className="text-[8px] text-slate-400">ยอดขายคาดว่าจะโต</p>
                    <p className="text-xs font-bold text-white">฿{simResult.addedRevenue.toLocaleString()}</p>
                  </div>
                </div>
                <div className={`text-[8px] p-2 rounded-lg border font-bold flex items-center justify-between ${simResult.marginRiskColor}`}>
                  <span>⚠️ ระดับความเสี่ยงกำไรเฉลี่ย:</span>
                  <span>{simResult.marginRisk}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onApplySimResults}
            className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
          >
            ⚡ นำสูตรจำลองนี้ไปเขียนโปรโมชั่นจริง
          </button>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Create Campaign form */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="p-1.5 bg-slate-100 rounded-lg text-slate-800 text-sm">📢</span>
            <div>
              <h3 className="font-display font-bold text-slate-800 text-xs sm:text-sm">สร้างโปรโมชั่นร้านก๋วยเตี๋ยว</h3>
              <p className="text-[9px] text-slate-400 font-medium">บันทึกข้อมูลแถวลง Firestore เพื่อโชว์ในฝั่งท่องเที่ยวทันที</p>
            </div>
          </div>

          <form onSubmit={onAddPromo} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-500">หัวข้อโปรโมชั่น</label>
              <input
                type="text"
                value={newPromo.title}
                onChange={e => setNewPromo({ ...newPromo, title: e.target.value })}
                placeholder="เช่น ก๋วยเตี๋ยวน้ำแดงส่วนลด 15% บ่ายสอง"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-semibold text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-500">รายละเอียดข้อกำหนด</label>
              <textarea
                value={newPromo.description}
                onChange={e => setNewPromo({ ...newPromo, description: e.target.value })}
                placeholder="เช่น คูปองสิทธิ์ลดเฉพาะเวลาช่วงบ่ายเท่านั้น..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-semibold text-slate-800 h-12"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-bold text-slate-500">รหัสคูปอง</label>
                <input
                  type="text"
                  value={newPromo.code}
                  onChange={e => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                  placeholder="MENGHAPPY"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-bold text-slate-800 uppercase"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">ส่วนลด (OFF)</label>
                <input
                  type="text"
                  value={newPromo.discount}
                  onChange={e => setNewPromo({ ...newPromo, discount: e.target.value })}
                  placeholder="15%"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-semibold text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer"
            >
              🚀 ปล่อยแคมเปญเข้าระบบแอปหลังบ้าน
            </button>
          </form>
        </div>

        {/* Transactions log */}
        <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
          <h4 className="font-display font-bold text-slate-800 text-sm">ประวัติการใช้บริการด้วยแอป (ธุรกรรมล่าสุดจากฐานข้อมูล)</h4>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {transactions.filter(t => t.type === 'restaurant').map((t) => (
              <div key={t.id} className="flex justify-between items-center text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/60 hover:bg-slate-100/50 transition-colors">
                <div>
                  <p className="font-bold text-slate-800">{t.user}</p>
                  <p className="text-[9px] text-slate-400">{t.date} | {t.providerName}</p>
                </div>
                <div className="text-right">
                  <span className="bg-slate-100 text-slate-800 text-[8px] font-bold px-2 py-0.5 rounded-md border border-slate-200/50">
                    ใช้คูปอง {t.discount}
                  </span>
                  <p className="text-[9px] text-slate-400 mt-1">ยอดใช้จริงมื้อนี้: ฿{t.profit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
