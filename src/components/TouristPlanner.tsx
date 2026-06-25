import React, { useState, useEffect } from 'react';
import { SwipeItem, Promotion } from '../types';

interface TouristPlannerProps {
  swipeItems: SwipeItem[];
  promotions: Promotion[];
  tripForm: {
    destination: string;
    duration: string;
    style: string;
    budget: string;
  };
  setTripForm: React.Dispatch<React.SetStateAction<{
    destination: string;
    duration: string;
    style: string;
    budget: string;
  }>>;
  customPrompt: string;
  setCustomPrompt: (p: string) => void;
  formStep: number;
  setFormStep: (s: number) => void;
  generatedRoute: any;
  setGeneratedRoute: (r: any) => void;
  isGenerating: boolean;
  setIsGenerating: (g: boolean) => void;
  tinderDeckActive: boolean;
  setTinderDeckActive: (a: boolean) => void;
  currentDeckIndex: number;
  setCurrentDeckIndex: (i: number) => void;
  likedSpots: SwipeItem[];
  setLikedSpots: React.Dispatch<React.SetStateAction<SwipeItem[]>>;
  dislikedSpots: SwipeItem[];
  setDislikedSpots: React.Dispatch<React.SetStateAction<SwipeItem[]>>;
  behavioralLogs: string[];
  setBehavioralLogs: React.Dispatch<React.SetStateAction<string[]>>;
  suggestedSpots: any[];
  setSuggestedSpots: React.Dispatch<React.SetStateAction<any[]>>;
  onInsertToRoute: (spot: any) => void;
  setTouristActiveTab: (tab: string) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  attractions: any[];
  restaurants: any[];
  hotels: any[];
}

export default function TouristPlanner({
  swipeItems,
  promotions,
  tripForm,
  setTripForm,
  customPrompt,
  setCustomPrompt,
  formStep,
  setFormStep,
  generatedRoute,
  setGeneratedRoute,
  isGenerating,
  setIsGenerating,
  tinderDeckActive,
  setTinderDeckActive,
  currentDeckIndex,
  setCurrentDeckIndex,
  likedSpots,
  setLikedSpots,
  dislikedSpots,
  setDislikedSpots,
  behavioralLogs,
  setBehavioralLogs,
  suggestedSpots,
  setSuggestedSpots,
  onInsertToRoute,
  setTouristActiveTab,
  showToast,
  attractions,
  restaurants,
  hotels
}: TouristPlannerProps) {

  const handleStartTinderScan = () => {
    if (swipeItems.length === 0) {
      showToast("⚠️ ไม่พบข้อมูลสำหรับใช้แมตช์ในระบบหลังบ้าน กรุณาตรวจสอบหรือเปลี่ยนหน้าบทบาทผู้ดูแลระบบเพื่อรีเฟรชข้อมูล", "error");
      return;
    }
    setIsGenerating(true);
    setTinderDeckActive(false);
    setGeneratedRoute(null);

    setTimeout(() => {
      setIsGenerating(false);
      setTinderDeckActive(true);
      setCurrentDeckIndex(0);
      setLikedSpots([]);
      setDislikedSpots([]);
      setBehavioralLogs([
        "🤖 [ระบบ AI]: เริ่มคัดกรองข้อมูลประชากรนักท่องเที่ยว...",
        `📝 [ความต้องการที่ได้รับ]: "${customPrompt}"`,
        "⚙️ [การประเมิน]: สร้างชุดตัวเลือกให้แมตช์กับโปรไฟล์แล้ว กรุณาปัดเพื่อยืนยันพฤติกรรม"
      ]);
      showToast("🔮 ยินดีต้อนรับสู่ Tinder Trip Matcher! ปัดขวาหรือซ้ายเลือกที่ถูกใจได้เลยครับ", "success");
    }, 1000);
  };

  const handleSwipeChoice = (spot: SwipeItem, isLiked: boolean) => {
    if (isLiked) {
      const updatedLiked = [...likedSpots, spot];
      setLikedSpots(updatedLiked);
      
      let log = "";
      if (spot.category === 'beach') log = `📈 [AI บันทึก]: คุณชอบ "${spot.name}" ตรวจพบรสนิยมผ่อนคลายริมฝั่งน้ำชายทะเล เพิ่มน้ำหนักแผนชะอำ +25%`;
      if (spot.category === 'nature') log = `🌲 [AI บันทึก]: คุณชื่นชอบธรรมชาติป่าแก่งกระจาน บันทึกแนวคิดสไตล์แอดเวนเจอร์แคมป์ปิ้ง`;
      if (spot.category === 'cafe') log = `☕ [AI บันทึก]: ชอบกินกาแฟและของหวานออร์แกนิก จัดสรรร้านคั่วคาแฟ่ดีกรีเยี่ยมให้ทันที`;
      if (spot.category === 'culture') log = `🛕 [AI บันทึก]: ยืนยันรสนิยมสายประวัติศาสตร์วัฒนธรรม ปล่อยแผนโบราณสถานเป้าหมายหลัก`;
      
      setBehavioralLogs([log, ...behavioralLogs]);
      showToast(`❤️ ชอบและเพิ่ม "${spot.name}" ลงในแผนแล้ว`, "success");
    } else {
      setDislikedSpots([...dislikedSpots, spot]);
      
      let log = "";
      if (spot.category === 'beach') log = `📉 [AI เรียนรู้]: คุณเลี่ยงหาดชะอำ พยายามหันเข้าสู่พื้นที่ร่มไม้สีเขียวสวนตาลออร์แกนิก`;
      if (spot.category === 'nature') log = `📉 [AI เรียนรู้]: ปัดข้ามสายลุยป่าเขาลมแรง ลดสัดส่วนจุดเหน็ดเหนื่อยกลางแดด`;
      if (spot.category === 'cafe') log = `📉 [AI เรียนรู้]: ปัดข้ามจุดชิมของหวาน จัดสรรอาหารจานหลักแนวซีฟู้ดต้มยำจัดจ้านแทน`;
      if (spot.category === 'culture') log = `📉 [AI เรียนรู้]: เลี่ยงจุดศึกษาประวัติศาสตร์เก่า ปลดล็อกดีไซน์การพักผ่อนแบบโมเดิร์นทันสมัย`;
      
      setBehavioralLogs([log, ...behavioralLogs]);
      showToast(`❌ ปัดข้าม "${spot.name}" เรียบร้อย`, "info");
    }

    if (currentDeckIndex < swipeItems.length - 1) {
      setCurrentDeckIndex(currentDeckIndex + 1);
    } else {
      compilePersonalizedTrip(isLiked ? [...likedSpots, spot] : likedSpots);
    }
  };

  const compilePersonalizedTrip = (acceptedSpots: SwipeItem[]) => {
    setTinderDeckActive(false);
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      
      if (acceptedSpots.length === 0) {
        showToast("⚠️ ไม่พบสถานที่ที่คุณกดชอบ! กรุณาลองเลือกใหม่อีกครั้ง", "error");
        setTinderDeckActive(true);
        setCurrentDeckIndex(0);
        return;
      }

      const promoJeKmeng = promotions.find(p => p.providerId === 'r1');
      const promoBoatHouse = promotions.find(p => p.providerId === 'h2');
      const promoChomWhan = promotions.find(p => p.providerId === 'r2');

      const dynamicSteps: any[] = [];
      const baseHours = ["09:00 น.", "11:30 น.", "14:00 น.", "16:30 น.", "19:00 น.", "วันที่ 2 (09:30 น.)", "วันที่ 2 (12:00 น.)"];

      acceptedSpots.forEach((spot, idx) => {
        const timeLabel = baseHours[idx % baseHours.length];
        let attachedPromo: any = null;
        if (spot.id === 'deck-5') attachedPromo = promoJeKmeng;
        if (spot.category === 'beach' && idx === 1) attachedPromo = promoChomWhan;
        if (spot.id === 'deck-2') attachedPromo = promoBoatHouse;

        dynamicSteps.push({
          id: spot.id || `custom-${idx}`,
          time: timeLabel,
          title: spot.name,
          desc: `${spot.description} (จัดทริปอิงตามการปัดขวาชอบของระบบแมตช์)`,
          badge: spot.tag,
          promoAttached: attachedPromo
        });
      });

      setGeneratedRoute({
        title: `เส้นทางการเดินทางท่องเที่ยว Phetchaburi Go! ส่วนบุคคล`,
        steps: dynamicSteps,
        summary: `แผนทริปอัจฉริยะ: แวะพักท่องเที่ยว ${acceptedSpots.length} จุดเด่นที่ชอบ`
      });

      // Related recommendations: find spots from main database that are not in the route
      const alreadyInRouteNames = acceptedSpots.map(s => s.name);
      const allDB = [...attractions, ...restaurants, ...hotels];
      const filtered = allDB.filter(s => !alreadyInRouteNames.includes(s.name));
      setSuggestedSpots(filtered.slice(0, 3));

      showToast("✨ ออกแบบตารางทริปและดึงระบบแนะนำสินค้าส่วนบุคคลที่เกี่ยวข้องเสร็จสมบูรณ์!", "success");
    }, 1100);
  };

  const currentDeck = swipeItems[currentDeckIndex] || swipeItems[0];

  return (
    <div className="space-y-6">
      {!generatedRoute && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Trip settings form */}
          <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-2.5">
              <h3 className="font-display font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                <span>⚙️</span> วางแผนตารางการเดินทาง
              </h3>
              <p className="text-[10px] text-slate-400">ระบุรายละเอียดความต้องการเพื่อเริ่มต้นปัดเลือกพิกัดท่องเที่ยว</p>
            </div>

            <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/30">
              {["📍 เที่ยว", "🕒 วัน", "🌲 สไตล์", "💰 งบ"].map((label, sIdx) => (
                <button
                  key={sIdx}
                  type="button"
                  onClick={() => setFormStep(sIdx)}
                  className={`py-1.5 text-[8px] font-bold rounded-lg transition-all cursor-pointer ${formStep === sIdx ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="min-h-[200px]">
              {formStep === 0 && (
                <div className="space-y-3 animate-fadeIn text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">ปลายทางเป้าหมาย (Destination)</label>
                    <input
                      type="text"
                      value={tripForm.destination}
                      onChange={e => setTripForm({ ...tripForm, destination: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-slate-800"
                    />
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl text-slate-600 text-[9px] leading-relaxed border border-slate-200/55">
                    💡 <b>คำแนะนำ:</b> สามารถกดเลือกปลายทางด่วนได้จากหน้า <b>"สถานที่เด็ด"</b> เพื่อนำมาใส่พิกัดที่นี่ได้เลยครับ!
                  </div>
                </div>
              )}

              {formStep === 1 && (
                <div className="space-y-2 animate-fadeIn text-xs">
                  <label className="font-bold text-slate-500 block">ระยะเวลากำหนดการท่องเที่ยว</label>
                  {['1d', '2d1n', '3d2n'].map(id => (
                    <button
                      key={id}
                      onClick={() => setTripForm({ ...tripForm, duration: id })}
                      className={`w-full py-2.5 px-3 rounded-xl border text-left text-[10px] font-bold flex justify-between items-center transition-all cursor-pointer ${tripForm.duration === id ? 'border-slate-900 bg-slate-50 text-slate-900' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'}`}
                    >
                      <span>{id === '1d' ? 'ทริปสั้น 1 วัน (เช้ากลับเย็น)' : id === '2d1n' ? 'ทริป 2 วัน 1 คืน' : 'ทริปพักใจยาว 3 วัน 2 คืน'}</span>
                      {tripForm.duration === id && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}

              {formStep === 2 && (
                <div className="space-y-2 animate-fadeIn text-xs">
                  <label className="font-bold text-slate-500 block">รสนิยมสไตล์การเที่ยวที่คุณอยากเน้น</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'nature_adventure', label: '🌲 ธรรมชาติป่าไม้' },
                      { id: 'beach_relax', label: '🏖️ ชิลริมทะเล' },
                      { id: 'cafe_culture', label: '☕ คาเฟ่ & วัฒนธรรม' },
                      { id: 'balanced', label: '🌟 แผนผสมยอดฮิต' }
                    ].map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setTripForm({ ...tripForm, style: s.id })}
                        className={`py-3 px-2 text-[9px] font-bold rounded-xl border transition-all cursor-pointer ${tripForm.style === s.id ? 'border-slate-900 bg-slate-50 text-slate-900' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {formStep === 3 && (
                <div className="space-y-3 animate-fadeIn text-xs">
                  <label className="font-bold text-slate-500 block">ระดับงบประมาณที่เหมาะสม</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['budget', 'moderate', 'premium'].map(b => (
                      <button
                        key={b}
                        onClick={() => setTripForm({ ...tripForm, budget: b })}
                        className={`py-2 text-[9px] font-bold rounded-lg border transition-all cursor-pointer ${tripForm.budget === b ? 'border-slate-900 bg-slate-50 text-slate-900' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'}`}
                      >
                        {b === 'budget' ? 'ประหยัด' : b === 'moderate' ? 'ปานกลาง' : 'หรูหรา'}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-indigo-600 uppercase">Prompt สำหรับ AI Matcher</label>
                    <textarea
                      value={customPrompt}
                      onChange={e => setCustomPrompt(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-[9px] font-semibold text-slate-700 h-16 leading-tight focus:outline-none focus:border-slate-800"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              {formStep > 0 && (
                <button
                  type="button"
                  onClick={() => setFormStep(formStep - 1)}
                  className="flex-1 bg-white hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl text-[10px] font-bold transition-all border border-slate-200 cursor-pointer"
                >
                  ⬅️ ย้อนกลับ
                </button>
              )}
              {formStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setFormStep(formStep + 1)}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
                >
                  ถัดไป ➡️
                </button>
              ) : (
                <button
                  onClick={handleStartTinderScan}
                  disabled={isGenerating}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-[10px] shadow-sm flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  {isGenerating ? "🔄 โหลด..." : "🔮 เริ่มจับคู่ (Tinder)"}
                </button>
              )}
            </div>
          </div>

          {/* Tinder Swiper Deck on the right */}
          <div className="lg:col-span-8 space-y-4">
            {tinderDeckActive && currentDeck ? (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-900 text-white text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Tinder Mode Active
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">ใบที่ {currentDeckIndex + 1} จาก {swipeItems.length}</span>
                    </div>
                    <h4 className="font-display font-bold text-slate-800 text-xs sm:text-sm mt-1">ปัดเลือกสถานที่สำหรับทริปเฉพาะคุณ</h4>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 text-slate-900 px-3 py-1.5 rounded-xl font-bold text-[10px] shrink-0 self-start">
                    ⚡ แมตช์ดีล: {currentDeck.matchRate}%
                  </div>
                </div>

                <div className="max-w-md mx-auto bg-slate-50 rounded-[24px] overflow-hidden border border-slate-200/60 shadow-lg relative">
                  
                  <div className="h-64 relative overflow-hidden bg-slate-200">
                    <img 
                      src={currentDeck.image} 
                      alt="" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                    
                    <div className="absolute bottom-4 inset-x-4 text-white space-y-1">
                      <span className="bg-slate-900 text-white text-[8px] font-bold px-2 py-0.5 rounded-md uppercase">
                        {currentDeck.tag}
                      </span>
                      <h3 className="font-display font-bold text-base sm:text-lg leading-tight">{currentDeck.name}</h3>
                      <p className="text-[10px] text-slate-300">📍 {currentDeck.typeText}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-white space-y-3">
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {currentDeck.description}
                    </p>
                    
                    <div className="text-[8px] font-mono text-slate-500 bg-slate-50 border border-slate-200/50 p-2 rounded-lg">
                      <span className="text-slate-900 uppercase font-bold">AI เรียนรู้รสนิยม:</span> {currentDeck.behaviorLog}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 border-t border-slate-100">
                    <button
                      onClick={() => handleSwipeChoice(currentDeck, false)}
                      className="bg-white hover:bg-slate-100 text-slate-600 font-bold text-[11px] py-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer"
                    >
                      ❌ ข้าม
                    </button>
                    <button
                      onClick={() => handleSwipeChoice(currentDeck, true)}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      ❤️ ถูกใจ
                    </button>
                  </div>

                </div>

              </div>
            ) : (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-3 min-h-[350px]">
                <div className="text-4xl">🛶</div>
                <h4 className="font-display font-bold text-slate-800 text-sm">พร้อมประกอบทริปสแกนแมตช์หรือยังครับ?</h4>
                <p className="text-[10px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                  ระบุฟอร์มความต้องการซ้ายมือ หรือจัดตำแหน่งปลายทางด่วน จากนั้นคลิก <b>"เริ่มจับคู่ความพอใจ"</b> เพื่อปัดเลือกดีลพิเศษทันที
                </p>
              </div>
            )}

            {tinderDeckActive && (
              <div className="bg-slate-950 text-slate-100 rounded-2xl p-4 font-mono text-[9px] space-y-2 border border-slate-800 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-slate-100 animate-pulse"></span>
                    🤖 AI Behavior Log Analyzer (ถอดพฤติกรรมการปัด)
                  </span>
                  <span>รสนิยม: {likedSpots.length} ชอบ / {dislikedSpots.length} ข้าม</span>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto text-slate-300">
                  {behavioralLogs.map((log, lIdx) => (
                    <p key={lIdx} className="leading-relaxed">{log}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Generated Route Display */}
      {generatedRoute && (
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 animate-fadeIn items-start">
          
          <div className="lg:col-span-7 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="text-[8px] bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded-full border border-slate-200/40">
                  {generatedRoute.summary}
                </span>
                <h2 className="text-base font-display font-bold text-slate-900 mt-2">
                  🗺️ กำหนดการเดินทางท่องเที่ยวเฉพาะคุณ (Itinerary Timeline)
                </h2>
              </div>
              
              <button
                onClick={() => {
                  setTinderDeckActive(true);
                  setCurrentDeckIndex(0);
                  setLikedSpots([]);
                  setDislikedSpots([]);
                  setGeneratedRoute(null);
                  showToast("เริ่มทำแบบประเมินและปัดจับคู่สถานที่ใหม่อีกรอบ!", "info");
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] px-3.5 py-2 rounded-xl shrink-0 cursor-pointer transition-colors"
              >
                🔄 ปัดเลือกสร้างทริปใหม่
              </button>
            </div>

            <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-dashed before:bg-slate-200">
              {generatedRoute.steps.map((step: any, idx: number) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-6 top-1 w-4.5 h-4.5 rounded-full bg-white border-4 border-slate-900 group-hover:scale-110 transition-transform"></div>
                  
                  <div className="space-y-1.5 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-800 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200/50">{step.time}</span>
                      <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded uppercase">{step.badge}</span>
                    </div>
                    <h4 className="font-display font-bold text-slate-900 text-sm">{step.title}</h4>
                    <p className="text-[10px] sm:text-xs text-slate-500 leading-relaxed max-w-xl">{step.desc}</p>
                    
                    {step.promoAttached && (
                      <div className="mt-2 bg-slate-50 border border-slate-200 rounded-xl p-3 max-w-md flex items-center justify-between gap-3 shadow-xs">
                        <div className="space-y-0.5">
                          <h5 className="text-[10px] font-bold text-slate-900 flex items-center gap-1">
                            <span>🎁</span> {step.promoAttached.title}
                          </h5>
                          <p className="text-[9px] text-slate-400">รหัสส่วนลดพิเศษ: <span className="font-mono font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">{step.promoAttached.code}</span></p>
                        </div>
                        <button
                          onClick={() => {
                            setTouristActiveTab('transactions');
                            showToast(`ค้นพบดีลของร้านพันธมิตรแล้ว แลกในกระเป๋าของคุณได้เลยครับ`, 'success');
                          }}
                          className="bg-slate-900 hover:bg-slate-800 text-white text-[9px] font-bold px-2.5 py-1.5 rounded-lg shrink-0 cursor-pointer transition-colors"
                        >
                          แลกใช้ดีล
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Related suggestions */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-3">
              <div className="border-b border-slate-100 pb-2">
                <span className="text-[8px] bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded-full uppercase border border-slate-200/40">Related Suggestions</span>
                <h3 className="text-xs font-display font-bold text-slate-900 mt-1">💡 ที่เที่ยวแนะนำแวะเพิ่ม</h3>
                <p className="text-[9px] text-slate-400 mt-0.5">สอดคล้องกับรสนิยมความชอบปัดขวาของคุณ</p>
              </div>

              {suggestedSpots.length === 0 ? (
                <p className="text-[10px] text-slate-400 text-center py-4">แวะพักครบครันหมดแล้วครับ!</p>
              ) : (
                <div className="space-y-3">
                  {suggestedSpots.map((spot, idx) => (
                    <div key={idx} className="border border-slate-100 rounded-2xl p-2 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all flex flex-col space-y-2">
                      <div className="h-24 w-full rounded-xl overflow-hidden relative">
                        <img 
                          src={spot.image} 
                          alt="" 
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-md text-white text-[7px] px-1.5 py-0.5 rounded font-bold">
                          ⭐ {spot.rating}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-display font-bold text-[10px] text-slate-800 truncate">{spot.name}</h4>
                        <p className="text-[8px] text-slate-400 line-clamp-2 leading-tight">{spot.description}</p>
                      </div>
                      <button
                        onClick={() => onInsertToRoute(spot)}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-[9px] py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        ➕ แทรกเข้าแผนทริป
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
