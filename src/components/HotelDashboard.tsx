import React, { useState } from 'react';
import { Transaction } from '../types';

interface HotelDashboardProps {
  transactions: Transaction[];
  hotelSimBaseRate: number;
  setHotelSimBaseRate: (r: number) => void;
  hotelSimTargetOccupancy: number;
  setHotelSimTargetOccupancy: (o: number) => void;
  hotelSimSeason: string;
  setHotelSimSeason: (s: string) => void;
  hotelActiveMarketTab: string;
  setHotelActiveMarketTab: (t: string) => void;
  newPromo: any;
  setNewPromo: (p: any) => void;
  onAddPromo: (e: React.FormEvent) => void;
  onApplySimResults: () => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function HotelDashboard({
  transactions,
  hotelSimBaseRate,
  setHotelSimBaseRate,
  hotelSimTargetOccupancy,
  setHotelSimTargetOccupancy,
  hotelSimSeason,
  setHotelSimSeason,
  hotelActiveMarketTab,
  setHotelActiveMarketTab,
  newPromo,
  setNewPromo,
  onAddPromo,
  onApplySimResults,
  showToast
}: HotelDashboardProps) {

  const calculateHotelSimResults = () => {
    const difficultyFactor = hotelSimSeason === "low_season" ? 1.5 : 0.8;
    const requiredDiscountPercent = Math.min(45, Math.max(5, Math.round((hotelSimTargetOccupancy - 50) * difficultyFactor)));
    const recommendedRate = Math.round(hotelSimBaseRate * (1 - requiredDiscountPercent / 100));
    
    const baseRevenue = (40 / 100) * hotelSimBaseRate * 15;
    const projectedRevenue = (hotelSimTargetOccupancy / 100) * recommendedRate * 15;
    const revDifference = Math.round(projectedRevenue - baseRevenue);
    
    let confidenceRating = "ยอดเยี่ยม (มีดีมานด์ชายหาดและป่าเขารองรับสูง)";
    let confidenceColor = "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (hotelSimTargetOccupancy > 90 && hotelSimSeason === "low_season") {
      confidenceRating = "ปานกลาง-ต่ำ (การจองห้องเต็ม 90% ในฤดูฝนทำได้ยาก แนะนำลดเป้าเป็น 75-80%)";
      confidenceColor = "text-amber-600 bg-amber-50 border-amber-200";
    }

    return { requiredDiscountPercent, recommendedRate, revDifference, confidenceRating, confidenceColor };
  };

  const simResult = calculateHotelSimResults();

  return (
    <div className="space-y-6">
      
      {/* Hotel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <span className="text-[9px] bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded-full uppercase tracking-widest border border-slate-200/40">
            แผงบริหารที่พักโรงแรม
          </span>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-900 mt-2">
            แก่งกระจาน โบ้ทเฮ้าส์ พาราไดซ์ 🏨
          </h1>
          <p className="text-xs text-slate-500">วิเคราะห์อัตราจองห้องพักล่วงหน้า (Occupancy Forecast) เพื่อวางกลยุทธ์ปรับราคาห้องพักตามซีซั่น</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm text-center min-w-[90px]">
            <p className="text-[8px] text-slate-400 font-bold uppercase">รายได้เดือนนี้</p>
            <p className="text-sm font-bold text-slate-900">฿142,000</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-sm text-center min-w-[90px]">
            <p className="text-[8px] text-slate-400 font-bold uppercase">อัตราพักเฉลี่ย</p>
            <p className="text-sm font-bold text-slate-900">82% ของจำนวนตึก</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Occupancy Forecast */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-display font-bold text-slate-800 text-xs sm:text-sm">ทำนายอัตราครองห้องพักล่วงหน้า (6 สัปดาห์ถัดไป)</h3>
              <p className="text-[10px] text-slate-400 font-medium">วิเคราะห์ทิศทางการจองเพื่อเตรียมอัดงบตลาดในช่วงห้องว่างบางตา</p>
            </div>
            
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setHotelSimSeason("low_season")}
                className={`px-3 py-1.5 text-[9px] font-bold rounded-lg transition-all cursor-pointer ${hotelSimSeason === "low_season" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
              >
                หน้าฝน (Low Season) ☔
              </button>
              <button
                onClick={() => setHotelSimSeason("high_season")}
                className={`px-3 py-1.5 text-[9px] font-bold rounded-lg transition-all cursor-pointer ${hotelSimSeason === "high_season" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
              >
                ปีใหม่/หน้าหนาว (High) ❄️
              </button>
            </div>
          </div>

          <div className="h-44 flex items-end justify-between gap-3.5 pt-3 border-b border-slate-100 px-1">
            {[
              { week: 'สัปดาห์นี้', rate: hotelSimSeason === "low_season" ? 65 : 95, isLow: false },
              { week: 'สัปดาห์ถัดไป', rate: hotelSimSeason === "low_season" ? 48 : 88, isLow: hotelSimSeason === "low_season" },
              { week: 'สัปดาห์ที่ 3', rate: hotelSimSeason === "low_season" ? 38 : 75, isLow: hotelSimSeason === "low_season" },
              { week: 'สัปดาห์ที่ 4', rate: hotelSimSeason === "low_season" ? 32 : 82, isLow: hotelSimSeason === "low_season" },
              { week: 'สัปดาห์ที่ 5', rate: hotelSimSeason === "low_season" ? 62 : 98, isLow: false }
            ].map((data, i) => (
              <div key={i} className="flex flex-col items-center flex-grow space-y-1">
                <div className="w-full flex items-end justify-center h-32 relative">
                  <div 
                    className={`w-full max-w-[28px] rounded-t-lg text-[8px] font-black text-white flex items-center justify-center transition-all duration-500 shadow-sm ${data.isLow ? 'bg-amber-400 animate-pulse' : 'bg-slate-900'}`}
                    style={{ height: `${data.rate}%` }}
                  >
                    {data.rate}%
                  </div>
                </div>
                <span className="text-[8px] font-bold text-slate-400">{data.week}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-semibold text-slate-500">
                <span className="h-2.5 w-2.5 bg-slate-900 rounded-md inline-block"></span> พักเกณฑ์ดีปกติ
              </span>
              <span className="flex items-center gap-1 font-semibold text-amber-500">
                <span className="h-2.5 w-2.5 bg-amber-400 rounded-md inline-block"></span> การจองล่วงหน้าตกต่ำพิเศษ
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60 text-slate-800 text-[9px] max-w-sm leading-relaxed">
              💡 **คำแนะนำผู้เชี่ยวชาญ:** {hotelSimSeason === "low_season" 
                ? "สัปดาห์ที่ 3 และ 4 อัตราห้องพักตกลงมาก แนะนำให้ออกแพ็กเกจพิเศษแถมกิจกรรมพายเรือและส่วนลด % เพื่อรักษาฐานอัตราห้องจองเต็มด่วน"
                : "สัปดาห์ปลายเดือนพุ่งทะยาน 98% ไม่จำเป็นต้องตัดราคาห้อง แนะนำให้ออกแคมเปญแถมของสมนาคุณ/ของที่ระลึกเมืองเพชรฟรีเพื่อรักษาอัตรากำไรสูงสุด"}
            </div>
          </div>
        </div>

        {/* Pricing Optimizer */}
        <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <span className="text-base">🏨</span>
              <div>
                <h3 className="font-display font-bold text-white text-xs">ระบบ Dynamic Pricing Optimizer</h3>
                <p className="text-[9px] text-slate-400">คำนวณราคาขายห้องให้คุ้มทุนที่สุดขึ้นตรงตามซีซั่นและดีมานด์เป้าหมาย</p>
              </div>
            </div>

            <div className="space-y-4 mt-4 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-[11px]">
                  <span className="text-slate-400">1. ราคาห้องปกติ (Base Rate):</span>
                  <span className="text-slate-100 font-bold">฿{hotelSimBaseRate.toLocaleString()} / คืน</span>
                </div>
                <input
                  type="range"
                  min="1500"
                  max="8000"
                  step="250"
                  value={hotelSimBaseRate}
                  onChange={e => setHotelSimBaseRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold text-[11px]">
                  <span className="text-slate-400">2. ตั้งเป้าหมายอัตราพักเฉลี่ย:</span>
                  <span className="text-slate-100 font-bold">{hotelSimTargetOccupancy}% ของอาคาร</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="100"
                  step="5"
                  value={hotelSimTargetOccupancy}
                  onChange={e => setHotelSimTargetOccupancy(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">คำแนะนำอัตรา Dynamic Pricing:</p>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                    <p className="text-[8px] text-slate-400">ส่วนลดที่เหมาะสม</p>
                    <p className="text-xs font-bold text-amber-400">ลด {simResult.requiredDiscountPercent}%</p>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                    <p className="text-[8px] text-slate-400">ราคาแนะนำขายจริง</p>
                    <p className="text-xs font-bold text-white">฿{simResult.recommendedRate.toLocaleString()}</p>
                  </div>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800/50 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 text-[8px]">ผลต่างรายได้คาดการณ์:</span>
                  <span className={`font-bold ${simResult.revDifference >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {simResult.revDifference >= 0 ? `+฿${simResult.revDifference.toLocaleString()}` : `-฿${Math.abs(simResult.revDifference).toLocaleString()}`}
                  </span>
                </div>
                <div className={`text-[8px] p-2.5 rounded-xl border font-bold ${simResult.confidenceColor}`}>
                  <span>🔥 ความเป็นไปได้ของเป้าหมาย:</span>
                  <p className="mt-0.5 leading-normal">{simResult.confidenceRating}</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onApplySimResults}
            className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-2.5 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
          >
            ⚡ นำส่วนลด Dynamic นี้ไปใช้ทำดีลด้านล่าง
          </button>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* District compare */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <div>
              <h3 className="font-display font-bold text-slate-800 text-xs sm:text-sm">เปรียบเทียบดีมานด์การจองห้องพักแยกตามย่าน</h3>
              <p className="text-[10px] text-slate-400 font-medium">กดสลับแท็บเพื่อวิเคราะห์ค่าเฉลี่ยตลาดทั่วไปในแต่ละเขตย่านเมืองเพชรบุรี</p>
            </div>
            <span className="text-[8px] bg-slate-900 text-white font-bold px-2 py-0.5 rounded shadow-sm">
              Data Feed
            </span>
          </div>

          <div className="flex gap-2">
            {["แก่งกระจาน", "ชะอำ", "ตัวเมืองเพชรบุรี"].map((area) => (
              <button
                key={area}
                onClick={() => setHotelActiveMarketTab(area)}
                className={`px-3 py-1.5 rounded-xl text-[9px] font-bold transition-all border cursor-pointer ${hotelActiveMarketTab === area ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
              >
                {area === "แก่งกระจาน" ? "🌲 ย่านแก่งกระจาน" : area === "ชะอำ" ? "🏖️ ย่านชายหาดชะอำ" : "🕌 ย่านตัวเมืองประวัติศาสตร์"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60">
              <p className="font-bold text-slate-400 text-[8px] uppercase">ราคาห้องเฉลี่ยในพื้นที่</p>
              <p className="text-sm font-bold text-slate-800 mt-1">
                {hotelActiveMarketTab === "แก่งกระจาน" ? "฿1,800 - ฿3,500" : hotelActiveMarketTab === "ชะอำ" ? "฿2,200 - ฿6,000" : "฿800 - ฿1,800"}
              </p>
              <p className="text-[9px] text-slate-400 mt-1">
                {hotelActiveMarketTab === "แก่งกระจาน" ? "บ้านแพเรือนแพริมเขื่อนลมอุ่น" : hotelActiveMarketTab === "ชะอำ" ? "โรงแรมคอนโดวิวสวยเลียบหาด" : "เกสท์เฮ้าส์วิถีชุมชนทำตาลเก่า"}
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60">
              <p className="font-bold text-slate-400 text-[8px] uppercase">ความต้องการคนเที่ยว</p>
              <p className="text-sm font-bold text-slate-900 mt-1">
                {hotelActiveMarketTab === "แก่งกระจาน" ? "สูงมาก (95%)" : hotelActiveMarketTab === "ชะอำ" ? "ปานกลาง (82%)" : "ปานกลาง-ต่ำ (55%)"}
              </p>
              <p className="text-[9px] text-slate-400 mt-1">
                {hotelActiveMarketTab === "แก่งกระจาน" ? "รักความชุ่มชื้นป่าไม้และผจญภัย" : hotelActiveMarketTab === "ชะอำ" ? "ครอบครัวพาลูกหลานมาเล่นน้ำหาด" : "มาไหว้พระชมโบราณวังเก่าเขาวัง"}
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60">
              <p className="font-bold text-slate-400 text-[8px] uppercase">ระดับความแข่งขันท้องถิ่น</p>
              <p className="text-sm font-bold text-rose-700 mt-1">
                {hotelActiveMarketTab === "แก่งกระจาน" ? "ปานกลาง (42 ค่าย)" : hotelActiveMarketTab === "ชะอำ" ? "สูงลิ่ว (120+ ค่าย)" : "ต่ำมาก (18 ค่าย)"}
              </p>
              <p className="text-[9px] text-slate-400 mt-1">
                {hotelActiveMarketTab === "แก่งกระจาน" ? "เน้นแถมอาหารมื้อค่ำจะคุ้มค่าดี" : hotelActiveMarketTab === "ชะอำ" ? "คอนโดห้องพักตัดราคาแรง" : "บูทีคโฮเต็ลมีโอกาสโตได้สูงสุด"}
              </p>
            </div>
          </div>
        </div>

        {/* Create Hotel Promo */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="p-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 text-sm">📢</span>
            <div>
              <h3 className="font-display font-bold text-slate-800 text-xs sm:text-sm">สร้างโปรโมชั่นดีลโรงแรม</h3>
              <p className="text-[9px] text-slate-400 font-medium">บันทึกแถวส่วนลดที่พักลงระบบ Firestore</p>
            </div>
          </div>

          <form onSubmit={onAddPromo} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-500">หัวข้อคูปองห้องพัก</label>
              <input
                type="text"
                value={newPromo.title}
                onChange={e => setNewPromo({ ...newPromo, title: e.target.value })}
                placeholder="เช่น ส่วนลด 25% คืนวันธรรมดาชิล"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-semibold text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-500">รายละเอียดเงื่อนไขเข้าพัก</label>
              <textarea
                value={newPromo.description}
                onChange={e => setNewPromo({ ...newPromo, description: e.target.value })}
                placeholder="เช่น จองล่วงหน้าสำหรับเข้าพัก จันทร์-พฤหัสบดี เท่านั้น..."
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
                  placeholder="BOATWEEKDAY"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-bold text-slate-800 uppercase"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-500">ส่วนลด (OFF)</label>
                <input
                  type="text"
                  value={newPromo.discount}
                  onChange={e => setNewPromo({ ...newPromo, discount: e.target.value })}
                  placeholder="ลด 20%"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-semibold text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer"
            >
              🚀 ปล่อยดีลเข้าสู่ระบบแอปหลังบ้าน
            </button>
          </form>
        </div>

      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
        <h4 className="font-display font-bold text-slate-800 text-sm">ประวัติการสแกนโค้ดสิทธิ์ห้องพักโรงแรม (ข้อมูลล่าสุดจาก Firestore)</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
          {transactions.filter(t => t.type === 'hotel').map((t) => (
            <div key={t.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200/60">
              <div>
                <p className="font-bold text-slate-800">{t.user}</p>
                <p className="text-[9px] text-slate-400">{t.date} | {t.providerName}</p>
              </div>
              <span className="bg-slate-100 text-slate-800 text-[9px] font-bold px-2.5 py-1 rounded-lg border border-slate-200/50">
                ใช้ส่วนลด {t.discount}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
