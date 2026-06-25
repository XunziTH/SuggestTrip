import React, { useState, useEffect } from 'react';
import { db, seedDatabaseIfEmpty, testConnection } from './firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { Attraction, Restaurant, Hotel, Promotion, SwipeItem, UserVoucher, Transaction } from './types';

// Import modular components
import TouristPlaces from './components/TouristPlaces';
import TouristPlanner from './components/TouristPlanner';
import TouristVouchers from './components/TouristVouchers';
import RestaurantDashboard from './components/RestaurantDashboard';
import HotelDashboard from './components/HotelDashboard';
import AdminManager from './components/AdminManager';

const SIMULATED_USER_ID = 'user_phetchaburi_go_01';

export default function App() {
  // Roles: tourist, restaurant_owner, hotel_owner, backoffice (Admin)
  const [role, setRole] = useState<'tourist' | 'restaurant_owner' | 'hotel_owner' | 'backoffice' | null>(null);
  const [viewMode, setViewMode] = useState<'web' | 'mobile'>('web');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Firestore Realtime Collections State
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [swipeItems, setSwipeItems] = useState<SwipeItem[]>([]);
  const [vouchers, setVouchers] = useState<UserVoucher[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // User States
  const [points, setPoints] = useState<number>(250);
  const [touristActiveTab, setTouristActiveTab] = useState<string>('places');
  const [placesFilter, setPlacesFilter] = useState<string>('all');

  // Swipe planner & behavior state
  const [formStep, setFormStep] = useState<number>(0);
  const [tripForm, setTripForm] = useState({
    destination: 'any',
    duration: '2d1n',
    style: 'balanced',
    budget: 'moderate'
  });
  const [customPrompt, setCustomPrompt] = useState('');
  const [tinderDeckActive, setTinderDeckActive] = useState(false);
  const [currentDeckIndex, setCurrentDeckIndex] = useState(0);
  const [likedSpots, setLikedSpots] = useState<SwipeItem[]>([]);
  const [dislikedSpots, setDislikedSpots] = useState<SwipeItem[]>([]);
  const [behavioralLogs, setBehavioralLogs] = useState<string[]>([
    '🤖 ระบบพร้อมประเมินและดักจับรสนิยมการท่องเที่ยวของคุณแบบเรียลไทม์...'
  ]);
  const [generatedRoute, setGeneratedRoute] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedSpots, setSuggestedSpots] = useState<any[]>([]);

  // What-if DSS values for Merchants
  const [restSimDiscount, setRestSimDiscount] = useState<number>(20);
  const [restSimTimeBlock, setRestSimTimeBlock] = useState<string>('14:00 - 16:00 น.');
  const [restSimDayType, setRestSimDayType] = useState<string>('weekday');

  const [hotelSimBaseRate, setHotelSimBaseRate] = useState<number>(3200);
  const [hotelSimTargetOccupancy, setHotelSimTargetOccupancy] = useState<number>(80);
  const [hotelSimSeason, setHotelSimSeason] = useState<string>('low_season');
  const [hotelActiveMarketTab, setHotelActiveMarketTab] = useState<string>('แก่งกระจาน');

  // Merchant new promo campaign form
  const [newPromo, setNewPromo] = useState({
    title: '',
    description: '',
    code: '',
    pointsRequired: 50,
    discount: '',
    providerName: 'ร้านค้าของคุณ'
  });

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // 1. Initial Connection Test & Seeding
  useEffect(() => {
    testConnection();
    seedDatabaseIfEmpty();
  }, []);

  // 2. Real-time Database Snapshot Sync
  useEffect(() => {
    const unsubAttractions = onSnapshot(collection(db, 'attractions'), (snap) => {
      const items: Attraction[] = [];
      snap.forEach(doc => items.push(doc.data() as Attraction));
      setAttractions(items);
    });

    const unsubRestaurants = onSnapshot(collection(db, 'restaurants'), (snap) => {
      const items: Restaurant[] = [];
      snap.forEach(doc => items.push(doc.data() as Restaurant));
      setRestaurants(items);
    });

    const unsubHotels = onSnapshot(collection(db, 'hotels'), (snap) => {
      const items: Hotel[] = [];
      snap.forEach(doc => items.push(doc.data() as Hotel));
      setHotels(items);
    });

    const unsubPromotions = onSnapshot(collection(db, 'promotions'), (snap) => {
      const items: Promotion[] = [];
      snap.forEach(doc => items.push(doc.data() as Promotion));
      setPromotions(items);
    });

    const unsubSwipeItems = onSnapshot(collection(db, 'swipe_items'), (snap) => {
      const items: SwipeItem[] = [];
      snap.forEach(doc => items.push(doc.data() as SwipeItem));
      setSwipeItems(items);
    });

    const unsubVouchers = onSnapshot(collection(db, 'vouchers'), (snap) => {
      const items: UserVoucher[] = [];
      snap.forEach(doc => {
        const v = doc.data() as UserVoucher;
        if (v.userId === SIMULATED_USER_ID) {
          items.push(v);
        }
      });
      setVouchers(items);
    });

    const unsubTransactions = onSnapshot(collection(db, 'transactions'), (snap) => {
      const items: Transaction[] = [];
      snap.forEach(doc => items.push(doc.data() as Transaction));
      // Sort newest transactions first
      setTransactions(items.reverse());
    });

    return () => {
      unsubAttractions();
      unsubRestaurants();
      unsubHotels();
      unsubPromotions();
      unsubSwipeItems();
      unsubVouchers();
      unsubTransactions();
    };
  }, []);

  // Update live prompt string based on Trip Form selection
  useEffect(() => {
    const destName = tripForm.destination === 'any' ? 'สถานที่โดดเด่นรอบเพชรบุรี' : tripForm.destination;
    let durText = tripForm.duration === '2d1n' ? '2 วัน 1 คืน' : tripForm.duration === '1d' ? '1 วันเช้าเย็นกลับ' : '3 วัน 2 คืน';
    let styleText = 'ผสมผสาน';
    if (tripForm.style === 'nature_adventure') styleText = 'สายลุยอุทยานธรรมชาติแก่งกระจาน';
    if (tripForm.style === 'beach_relax') styleText = 'ผ่อนคลายลมอุ่นเลหาดชะอำ';
    if (tripForm.style === 'cafe_culture') styleText = 'เช็คอินคาเฟ่สวนตาลและโบราณเขาวัง';
    
    let budgetText = 'งบปานกลาง';
    if (tripForm.budget === 'budget') budgetText = 'เน้นความคุ้มค่าราคามิตรภาพ';
    if (tripForm.budget === 'premium') budgetText = 'เน้นลักชัวรี่พรีเมียมหรูหรา';

    setCustomPrompt(`ช่วยคำนวณและประมวลทริปพิเศษสู่ "${destName}" ช่วงระยะเวลา "${durText}" สไตล์เน้น "${styleText}" วางแผนงบประมาณ "${budgetText}" คัดสรรดีลของแถมร้านพันธมิตรจังหวัดเพชรบุรีให้ด้วยนะครับ`);
  }, [tripForm]);

  // Handle direct targeting of a location from the curated list
  const handleQuickPlan = (placeName: string) => {
    setTripForm(prev => ({ ...prev, destination: placeName }));
    setTouristActiveTab('planner');
    setFormStep(0);
    setTinderDeckActive(false);
    setGeneratedRoute(null);
    showToast(`🎯 ล็อกตำแหน่งปลายทางหลักไปที่ "${placeName}" ตรวจสอบข้อมูลก่อนปัด Tinder!`, 'info');
  };

  // Redeeming vouchers using loyalty points
  const handleRedeemPromo = async (promo: Promotion) => {
    if (points >= promo.pointsRequired) {
      setPoints(points - promo.pointsRequired);
      try {
        const id = `v-${Date.now()}`;
        const newVoucher: UserVoucher = {
          id,
          title: promo.title,
          code: promo.code,
          providerName: promo.providerName,
          used: false,
          userId: SIMULATED_USER_ID
        };
        await setDoc(doc(db, 'vouchers', id), newVoucher);
        showToast(`🎉 แลกดีลสิทธิ์ "${promo.title}" เรียบร้อย! ดีลบันทึกเข้ากระเป๋าหลังบ้านแล้ว`, 'success');
      } catch (err) {
        showToast('❌ ไม่สามารถแลกดีลสิทธิ์ได้ชั่วคราว', 'error');
      }
    } else {
      showToast(`❌ คะแนนของคุณไม่เพียงพอ ต้องการ ${promo.pointsRequired} แต้ม (ปัจจุบันมี ${points})`, 'error');
    }
  };

  // Simulating using coupon and writing to business transaction logs
  const handleUseVoucher = async (idx: number) => {
    const targetVoucher = vouchers[idx];
    try {
      // Mark as used or delete from Firestore wallet
      await updateDoc(doc(db, 'vouchers', targetVoucher.id), { used: true });
      
      // Earn some extra points for checking-in/spending
      setPoints(points + 100);

      // Create transaction log document
      const txId = `t-${Date.now()}`;
      const newTx: Transaction = {
        id: txId,
        type: targetVoucher.id.includes('h') ? 'hotel' : 'restaurant',
        providerId: targetVoucher.id,
        providerName: targetVoucher.providerName,
        user: 'คุณ ณัฐพล (ผู้ใช้งานแอป)',
        discount: 'แลกจากแอป Go!',
        date: 'วันนี้ ' + new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        profit: targetVoucher.id.includes('h') ? 2400 : 420
      };

      await setDoc(doc(db, 'transactions', txId), newTx);
      showToast(`💰 เปิดใช้งานโค้ด "${targetVoucher.code}" สำเร็จ! ได้รับแต้มรางวัลท่องเที่ยวเช็คอินเพิ่ม +100 พอยท์`, 'success');
    } catch (err) {
      showToast('❌ การสแกนใช้โค้ดเกิดปัญหาขัดข้อง', 'error');
    }
  };

  // Add new promo campaign from merchant views
  const handleAddPromoCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromo.title || !newPromo.code || !newPromo.discount) {
      showToast('⚠️ กรุณากรอกหัวข้อดีล รหัสลับ และเปอร์เซ็นต์ส่วนลดก่อนเผยแพร่', 'error');
      return;
    }

    const providerName = role === 'restaurant_owner' ? 'เจ๊กเม้ง ก๋วยเตี๋ยวน้ำแดง' : 'แก่งกระจาน โบ้ทเฮ้าส์ พาราไดซ์';
    const providerType = role === 'restaurant_owner' ? 'restaurant' : 'hotel';
    const providerId = role === 'restaurant_owner' ? 'r1' : 'h2';
    const promoId = `p-${Date.now()}`;

    const campaign: Promotion = {
      id: promoId,
      providerId,
      providerType,
      providerName,
      title: newPromo.title,
      description: newPromo.description || 'สิทธิประโยชน์สุดพิเศษสำหรับนักท่องเที่ยวผู้ใช้แอป Phetchaburi Go!',
      code: newPromo.code.toUpperCase(),
      pointsRequired: Number(newPromo.pointsRequired) || 50,
      discount: newPromo.discount
    };

    try {
      await setDoc(doc(db, 'promotions', promoId), campaign);
      setNewPromo({ title: '', description: '', code: '', pointsRequired: 50, discount: '', providerName });
      showToast('📢 ประกาศเผยแพร่แคมเปญโปรโมชั่นใหม่ของคุณลงสู่ระบบหลังบ้านเรียบร้อย!', 'success');
    } catch (err) {
      showToast('❌ เกิดปัญหาระบบหลังบ้านในการปล่อยแคมเปญ', 'error');
    }
  };

  // Helper: insert related recommendation spot directly to timeline
  const handleInsertToRoute = (spot: any) => {
    if (!generatedRoute) return;
    const baseHours = ["09:00 น.", "11:30 น.", "14:00 น.", "16:30 น.", "19:00 น.", "วันที่ 2 (09:30 น.)", "วันที่ 2 (12:00 น.)", "วันที่ 2 (15:00 น.)"];
    const currentStepsLength = generatedRoute.steps.length;
    const timeLabel = baseHours[currentStepsLength % baseHours.length];

    const newStep = {
      id: spot.id,
      time: timeLabel,
      title: spot.name,
      desc: `${spot.description} (แทรกเข้ามาตามพฤติกรรมการแวะชาร์จพลังเพิ่มเติม)`,
      badge: spot.tag || spot.category,
      promoAttached: promotions.find(p => p.providerId === spot.id) || null
    };

    const updatedSteps = [...generatedRoute.steps, newStep];
    setGeneratedRoute({
      ...generatedRoute,
      steps: updatedSteps,
      summary: `ทริปอัปเดตแบบเรียลไทม์: แวะพักท่องเที่ยวทั้งหมด ${updatedSteps.length} จุดเด่น`
    });

    setSuggestedSpots(suggestedSpots.filter(s => s.id !== spot.id));
    showToast(`➕ แทรกและเชื่อมโยง "${spot.name}" สู่ตารางทริปเวลา ${timeLabel} เรียบร้อย!`, 'success');
  };

  // Apply What-if DSS recommendation formulas directly into creative forms
  const applyRestSimToForm = () => {
    const isOffPeak = restSimTimeBlock === "14:00 - 16:00 น." || restSimTimeBlock === "10:00 - 11:30 น.";
    const boostMultiplier = isOffPeak ? 2.2 : 1.1;
    const estimatedTrafficBoost = Math.round(restSimDiscount * boostMultiplier);

    setNewPromo({
      title: `ดีลลดกระหน่ำอาหาร ${restSimDiscount}% สกัดโต๊ะว่างช่วงบ่าย`,
      description: `วิเคราะห์สถิติอัจฉริยะประเมินว่าจะช่วยกระตุ้นลูกค้าเข้าร้านได้พุ่งถึง +${estimatedTrafficBoost}% ทันที ในช่วงเวลา ${restSimTimeBlock}`,
      code: `MENG${restSimDiscount}OFF`,
      pointsRequired: Math.max(30, 100 - restSimDiscount),
      discount: `${restSimDiscount}%`,
      providerName: 'เจ๊กเม้ง ก๋วยเตี๋ยวน้ำแดง'
    });
    showToast('📝 ประยุกต์สูตรโมเดลลดราคาลงแบบฟอร์มด้านล่างให้ท่านเรียบร้อย!', 'info');
  };

  const applyHotelSimToForm = () => {
    const difficultyFactor = hotelSimSeason === "low_season" ? 1.5 : 0.8;
    const requiredDiscountPercent = Math.min(45, Math.max(5, Math.round((hotelSimTargetOccupancy - 50) * difficultyFactor)));
    const recommendedRate = Math.round(hotelSimBaseRate * (1 - requiredDiscountPercent / 100));

    setNewPromo({
      title: `Dynamic Room Coupon คืนลมอุ่นราคาพิเศษลดทันที ${requiredDiscountPercent}%`,
      description: `จองพักล่วงหน้ารับประกันเรตเฉลี่ยสุดประหยัดเพียงคืนละ ฿${recommendedRate.toLocaleString()} เท่านั้น!`,
      code: `BOATDYN${requiredDiscountPercent}`,
      pointsRequired: Math.min(180, Math.max(50, requiredDiscountPercent * 3)),
      discount: `ลด ${requiredDiscountPercent}%`,
      providerName: 'แก่งกระจาน โบ้ทเฮ้าส์ พาราไดซ์'
    });
    showToast('📝 ถอดสูตรคํานวณราคา Dynamic ไปประกอบการออกดีลด้านล่างแล้ว!', 'info');
  };

  // Splash Screen Gate Selection
  if (role === null) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans antialiased text-slate-800">
        <div className="max-w-5xl w-full bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/80 text-center space-y-10 shadow-sm">
          
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex p-3.5 bg-slate-900 text-white rounded-2xl shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 tracking-tight">
              ยินดีต้อนรับสู่ <span className="text-indigo-600">Phetchaburi Go!</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
              แพลตฟอร์มท่องเที่ยวแนะนำข้อมูลเชิงลึกเมืองเพชรบุรี จัดแผนเดินทางสไตล์ Tinder Matcher และแดชบอร์ดสนับสนุนการตัดสินใจผู้ประกอบการแบบเรียลไทม์
            </p>
          </div>

          <div className="border-t border-slate-100"></div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">กรุณาเลือกประเภทผู้ใช้งานเพื่อเริ่มต้นระบบ</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <button
                onClick={() => { setRole('tourist'); setTouristActiveTab('places'); }}
                className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-600 p-6 rounded-2xl text-left transition-all duration-200 group flex flex-col justify-between h-full min-h-[190px] space-y-4 cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="text-xl p-2 bg-slate-50 rounded-lg inline-block">🏝️</div>
                  <h4 className="font-bold text-slate-900 text-sm">นักท่องเที่ยว</h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    วางแผนเดินทาง สะสมพอยท์ และแลกสิทธิพิเศษร้านค้าจริง
                  </p>
                </div>
                <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  เข้าสู่บริการท่องเที่ยว →
                </span>
              </button>

              <button
                onClick={() => setRole('restaurant_owner')}
                className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-600 p-6 rounded-2xl text-left transition-all duration-200 group flex flex-col justify-between h-full min-h-[190px] space-y-4 cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="text-xl p-2 bg-slate-50 rounded-lg inline-block">🍳</div>
                  <h4 className="font-bold text-slate-900 text-sm">ร้านอาหาร / คาเฟ่</h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    แดชบอร์ด Peak Hours และเครื่องมือประเมินแคมเปญ What-If
                  </p>
                </div>
                <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  ควบคุมร้านอาหาร →
                </span>
              </button>

              <button
                onClick={() => setRole('hotel_owner')}
                className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-600 p-6 rounded-2xl text-left transition-all duration-200 group flex flex-col justify-between h-full min-h-[190px] space-y-4 cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="text-xl p-2 bg-slate-50 rounded-lg inline-block">🏨</div>
                  <h4 className="font-bold text-slate-900 text-sm">ที่พัก / โรงแรม</h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    ทำนายยอดจองห้องพักล่วงหน้า ปรับราคา Dynamic Pricing
                  </p>
                </div>
                <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  ควบคุมโรงแรม →
                </span>
              </button>

              <button
                onClick={() => setRole('backoffice')}
                className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-600 p-6 rounded-2xl text-left transition-all duration-200 group flex flex-col justify-between h-full min-h-[190px] space-y-4 cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="text-xl p-2 bg-slate-50 rounded-lg inline-block">⚙️</div>
                  <h4 className="font-bold text-slate-900 text-sm">หลังบ้าน (ADMIN)</h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    แก้ไขข้อมูล แถว และตารางของเมืองเพชรบุรีแบบเรียลไทม์
                  </p>
                </div>
                <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  เข้าหลังบ้านแอป →
                </span>
              </button>

            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-medium pt-4">
            Phetchaburi Go! • ระบบบริหารจัดการข้อมูลและวิเคราะห์พฤติกรรมการท่องเที่ยวเชิงพื้นที่
          </div>

        </div>
      </div>
    );
  }

  const renderLayout = (children: React.ReactNode) => {
    if (viewMode === 'mobile') {
      return (
        <div className="bg-slate-900 py-8 min-h-screen flex items-center justify-center transition-all px-4">
          <div className="relative w-full max-w-[400px] h-[840px] bg-white rounded-[40px] shadow-2xl border-[10px] border-slate-800 flex flex-col overflow-hidden">
            
            <div className="absolute top-0 inset-x-0 h-6 bg-white z-50 flex items-center justify-between px-6 shrink-0">
              <span className="text-[10px] font-extrabold text-slate-800">10:43 PM</span>
              <div className="h-3.5 w-16 bg-slate-800 rounded-full absolute left-1/2 -translate-x-1/2 top-1"></div>
              <div className="flex items-center gap-1 text-slate-800">
                <span className="text-[9px]">📶</span>
                <span className="text-[9px]">🔋 100%</span>
              </div>
            </div>

            <div className="flex-grow pt-6 overflow-y-auto scrollbar-none flex flex-col bg-slate-50">
              {children}
            </div>

            <div className="h-3.5 bg-white border-t border-slate-100 flex items-center justify-center py-1 shrink-0">
              <div className="w-24 h-1 bg-slate-300 rounded-full"></div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col antialiased transition-all">
        {children}
      </div>
    );
  };

  return renderLayout(
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-900 text-white rounded-xl shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <div>
              <span className="text-base font-display font-bold text-slate-900 tracking-wide">
                Phetchaburi<span className="text-indigo-600 font-bold">Go!</span>
              </span>
              <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider leading-none">Smart Travel System</p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-auto border border-slate-200/30">
            <button
              onClick={() => setViewMode('web')}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${viewMode === 'web' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              💻 Web View
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${viewMode === 'mobile' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              📱 Mobile View
            </button>
          </div>

          <div className="flex items-center gap-2 justify-between sm:justify-end shrink-0">
            <button
              onClick={() => {
                setRole(null);
                setTinderDeckActive(false);
                setGeneratedRoute(null);
              }}
              className="text-[10px] bg-white hover:bg-slate-50 text-slate-700 font-bold px-3.5 py-1.5 rounded-xl transition-all border border-slate-200"
            >
              🔄 สลับบทบาทผู้ใช้
            </button>

            {role === 'tourist' && (
              <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-700 px-3.5 py-1.5 rounded-xl shadow-sm text-[10px] font-bold">
                <span>⭐ {points} พอยท์</span>
              </div>
            )}
          </div>

        </div>
      </header>

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-950 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-800 max-w-sm animate-bounce flex items-center gap-2.5">
          <span className="text-lg">{toast.type === 'success' ? '🚀' : toast.type === 'info' ? 'ℹ️' : '⚠️'}</span>
          <p className="text-[11px] font-bold leading-normal text-slate-100">{toast.message}</p>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col">
        
        {/* ==================== 1. TOURIST VIEW ==================== */}
        {role === 'tourist' && (
          <div className="space-y-6 flex-grow flex flex-col">
            
            {/* Curated Bento Grid Hero */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[160px] md:auto-rows-[180px] shrink-0">
              <div className="md:col-span-2 md:row-span-2 relative rounded-3xl overflow-hidden bg-slate-950 text-white p-6 flex flex-col justify-end group shadow-sm border border-slate-200/50">
                <div className="absolute inset-0 z-0 opacity-55 group-hover:scale-[1.01] transition-transform duration-700 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80')" }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent z-10"></div>
                
                <div className="relative z-20 space-y-2">
                  <span className="bg-slate-900 border border-slate-800 text-white text-[8px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest w-fit block shadow-sm">
                    Live Travel App
                  </span>
                  <h1 className="text-xl sm:text-2xl font-display font-bold tracking-tight leading-tight">
                    ระบบวิเคราะห์และแนะนำ<br />เที่ยวเพชรบุรีเฉพาะรสนิยม
                  </h1>
                  <p className="text-slate-300 text-[10px] sm:text-xs max-w-sm font-medium">
                    เรียนรู้ความชอบและจัดวางกำหนดการเดินทางแบบเฉพาะบุคคลด้วยระบบปัดขวา พร้อมประมวลส่วนลดคุ้มประหยัดที่สุด
                  </p>
                </div>
              </div>

              <div 
                onClick={() => handleQuickPlan('อุทยานแห่งชาติแก่งกระจาน')}
                className="md:col-span-1 md:row-span-1 relative rounded-3xl overflow-hidden bg-slate-100 group shadow-sm hover:shadow-md border border-slate-200/30 transition-all cursor-pointer"
              >
                <div className="absolute inset-0 z-0 group-hover:scale-102 transition-transform duration-500 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=600&q=80')" }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 to-transparent z-10"></div>
                <div className="absolute bottom-3 left-3 z-20 text-white">
                  <span className="text-[8px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold uppercase">ธรรมชาติมรดกโลก</span>
                  <h3 className="text-xs font-display font-bold mt-1 text-white">อุทยานแก่งกระจาน</h3>
                </div>
              </div>

              <div 
                onClick={() => handleQuickPlan('พระนครคีรี (เขาวัง)')}
                className="md:col-span-1 md:row-span-1 relative rounded-3xl overflow-hidden bg-slate-100 group shadow-sm hover:shadow-md border border-slate-200/30 transition-all cursor-pointer"
              >
                <div className="absolute inset-0 z-0 group-hover:scale-102 transition-transform duration-500 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?auto=format&fit=crop&w=600&q=80')" }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 to-transparent z-10"></div>
                <div className="absolute bottom-3 left-3 z-20 text-white">
                  <span className="text-[8px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold uppercase">สถาปัตยกรรมโบราณ</span>
                  <h3 className="text-xs font-display font-bold mt-1 text-white">พระนครคีรี (เขาวัง)</h3>
                </div>
              </div>

              <div 
                onClick={() => handleQuickPlan('สวีทโตนด คาเฟ่ (Sweet Tanot)')}
                className="md:col-span-2 md:row-span-1 relative rounded-3xl overflow-hidden bg-slate-100 group shadow-sm hover:shadow-md border border-slate-200/30 transition-all cursor-pointer"
              >
                <div className="absolute inset-0 z-0 group-hover:scale-102 transition-transform duration-500 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80')" }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent z-10"></div>
                <div className="absolute bottom-3 left-3 right-3 z-20 text-white flex items-end justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[8px] bg-amber-600 text-white px-2 py-0.5 rounded-full font-bold uppercase">วิถีถิ่นของหวาน</span>
                    <h3 className="text-xs font-display font-bold text-white">สวีทโตนด คาเฟ่สวนโตนดออร์แกนิก</h3>
                  </div>
                  <span className="text-[9px] bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg font-bold text-white group-hover:bg-indigo-600 transition-colors">
                    จัดแผนด่วน ⚡
                  </span>
                </div>
              </div>
            </div>

            {/* Tourist Tabs navigation */}
            <div className="flex border border-slate-200/80 shrink-0 bg-white p-1 rounded-2xl shadow-sm">
              <button
                onClick={() => setTouristActiveTab('places')}
                className={`flex-1 text-center py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${touristActiveTab === 'places' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
              >
                🏝️ สถานที่เด็ดเมืองเพชรบุรี
              </button>
              <button
                onClick={() => setTouristActiveTab('planner')}
                className={`flex-1 text-center py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${touristActiveTab === 'planner' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
              >
                🎯 จัดวางแผน Trip (Swipe)
              </button>
              <button
                onClick={() => setTouristActiveTab('transactions')}
                className={`flex-1 text-center py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${touristActiveTab === 'transactions' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
              >
                🎫 ดีลคูปอง & สะสมพอยท์
              </button>
            </div>

            {/* View renders */}
            {touristActiveTab === 'places' && (
              <TouristPlaces
                attractions={attractions}
                restaurants={restaurants}
                hotels={hotels}
                placesFilter={placesFilter}
                setPlacesFilter={setPlacesFilter}
                onQuickPlan={handleQuickPlan}
                promotions={promotions}
                setTouristActiveTab={setTouristActiveTab}
                showToast={showToast}
              />
            )}

            {touristActiveTab === 'planner' && (
              <TouristPlanner
                swipeItems={swipeItems}
                promotions={promotions}
                tripForm={tripForm}
                setTripForm={setTripForm}
                customPrompt={customPrompt}
                setCustomPrompt={setCustomPrompt}
                formStep={formStep}
                setFormStep={setFormStep}
                generatedRoute={generatedRoute}
                setGeneratedRoute={setGeneratedRoute}
                isGenerating={isGenerating}
                setIsGenerating={setIsGenerating}
                tinderDeckActive={tinderDeckActive}
                setTinderDeckActive={setTinderDeckActive}
                currentDeckIndex={currentDeckIndex}
                setCurrentDeckIndex={setCurrentDeckIndex}
                likedSpots={likedSpots}
                setLikedSpots={setLikedSpots}
                dislikedSpots={dislikedSpots}
                setDislikedSpots={setDislikedSpots}
                behavioralLogs={behavioralLogs}
                setBehavioralLogs={setBehavioralLogs}
                suggestedSpots={suggestedSpots}
                setSuggestedSpots={setSuggestedSpots}
                onInsertToRoute={handleInsertToRoute}
                setTouristActiveTab={setTouristActiveTab}
                showToast={showToast}
                attractions={attractions}
                restaurants={restaurants}
                hotels={hotels}
              />
            )}

            {touristActiveTab === 'transactions' && (
              <TouristVouchers
                promotions={promotions}
                points={points}
                setPoints={setPoints}
                vouchers={vouchers}
                setVouchers={setVouchers}
                onRedeemPromo={handleRedeemPromo}
                onUseVoucher={handleUseVoucher}
                showToast={showToast}
              />
            )}

          </div>
        )}

        {/* ==================== 2. RESTAURANT OWNER VIEW ==================== */}
        {role === 'restaurant_owner' && (
          <RestaurantDashboard
            transactions={transactions}
            restSimDiscount={restSimDiscount}
            setRestSimDiscount={setRestSimDiscount}
            restSimTimeBlock={restSimTimeBlock}
            setRestSimTimeBlock={setRestSimTimeBlock}
            restSimDayType={restSimDayType}
            setRestSimDayType={setRestSimDayType}
            newPromo={newPromo}
            setNewPromo={setNewPromo}
            onAddPromo={handleAddPromoCampaign}
            onApplySimResults={applyRestSimToForm}
            showToast={showToast}
          />
        )}

        {/* ==================== 3. HOTEL OWNER VIEW ==================== */}
        {role === 'hotel_owner' && (
          <HotelDashboard
            transactions={transactions}
            hotelSimBaseRate={hotelSimBaseRate}
            setHotelSimBaseRate={setHotelSimBaseRate}
            hotelSimTargetOccupancy={hotelSimTargetOccupancy}
            setHotelSimTargetOccupancy={setHotelSimTargetOccupancy}
            hotelSimSeason={hotelSimSeason}
            setHotelSimSeason={setHotelSimSeason}
            hotelActiveMarketTab={hotelActiveMarketTab}
            setHotelActiveMarketTab={setHotelActiveMarketTab}
            newPromo={newPromo}
            setNewPromo={setNewPromo}
            onAddPromo={handleAddPromoCampaign}
            onApplySimResults={applyHotelSimToForm}
            showToast={showToast}
          />
        )}

        {/* ==================== 4. BACKOFFICE (ADMIN) VIEW ==================== */}
        {role === 'backoffice' && (
          <AdminManager
            attractions={attractions}
            restaurants={restaurants}
            hotels={hotels}
            promotions={promotions}
            swipeItems={swipeItems}
            onRefresh={() => {}}
            showToast={showToast}
          />
        )}

      </main>

      <footer className="bg-slate-900 text-slate-400 text-[10px] sm:text-xs py-5 border-t border-slate-800 shrink-0 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <p>© 2026 Phetchaburi Go! แพลตฟอร์มการประเมินรสนิยมท่องเที่ยวสไตล์ Tinder และการวิเคราะห์ผู้ประกอบการออฟไลน์จังหวัดเพชรบุรี</p>
          <div className="flex items-center gap-4 shrink-0 font-medium">
            <span className="hover:text-white cursor-pointer">นโยบายความเป็นส่วนตัว</span>
            <span className="hover:text-white cursor-pointer">ติดต่อผู้พัฒนา</span>
          </div>
        </div>
      </footer>
    </>
  );
}
