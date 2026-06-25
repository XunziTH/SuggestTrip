import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Attraction, Restaurant, Hotel, Promotion, SwipeItem } from '../types';

interface AdminManagerProps {
  attractions: Attraction[];
  restaurants: Restaurant[];
  hotels: Hotel[];
  promotions: Promotion[];
  swipeItems: SwipeItem[];
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function AdminManager({
  attractions,
  restaurants,
  hotels,
  promotions,
  swipeItems,
  onRefresh,
  showToast
}: AdminManagerProps) {
  const [activeCollection, setActiveCollection] = useState<'attractions' | 'restaurants' | 'hotels' | 'promotions' | 'swipe_items'>('attractions');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states for adding/editing columns & rows
  const [formData, setFormData] = useState<any>({});

  const handleSelectCollection = (col: any) => {
    setActiveCollection(col);
    setEditingId(null);
    setFormData({});
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({ ...item });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบแถวข้อมูลนี้ในระบบหลังบ้าน?')) return;
    try {
      await deleteDoc(doc(db, activeCollection, id));
      showToast('🗑️ ลบแถวข้อมูลออกจากฐานข้อมูลเรียบร้อยแล้ว!', 'success');
      onRefresh();
    } catch (err) {
      showToast('❌ เกิดข้อผิดพลาดในการลบข้อมูล', 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.name) {
      if (activeCollection === 'promotions' && !formData.title) {
        showToast('⚠️ กรุณากรอกรหัสและชื่อเรื่องให้ครบถ้วน', 'error');
        return;
      }
      if (activeCollection !== 'promotions') {
        showToast('⚠️ กรุณาระบุรหัส ID และชื่อให้ครบถ้วน', 'error');
        return;
      }
    }

    try {
      const finalId = editingId || formData.id.trim();
      const updatedData = { ...formData, id: finalId };
      
      // Clean undefined fields
      Object.keys(updatedData).forEach(key => {
        if (updatedData[key] === undefined) {
          delete updatedData[key];
        }
      });

      await setDoc(doc(db, activeCollection, finalId), updatedData);
      showToast(`💾 บันทึกข้อมูลคอลัมน์และแถว "${formData.name || formData.title}" สำเร็จ!`, 'success');
      setEditingId(null);
      setFormData({});
      onRefresh();
    } catch (err) {
      showToast('❌ ไม่สามารถบันทึกข้อมูลลงฐานข้อมูลได้', 'error');
    }
  };

  const currentList = () => {
    switch (activeCollection) {
      case 'attractions': return attractions;
      case 'restaurants': return restaurants;
      case 'hotels': return hotels;
      case 'promotions': return promotions;
      case 'swipe_items': return swipeItems;
      default: return [];
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
      
      <div className="border-b border-slate-100 pb-4">
        <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-slate-200/50">
          Database Management Panel
        </span>
        <h2 className="text-xl font-display font-bold text-slate-900 mt-2">
          ระบบหลังบ้านจัดการข้อมูลแถวและคอลัมน์ (Firestore Backoffice)
        </h2>
        <p className="text-xs text-slate-400">ควบคุมข้อมูลตารางท่องเที่ยวเพชรบุรีและอัปเดตแบบเรียลไทม์</p>
      </div>

      {/* Collection Switches */}
      <div className="flex flex-wrap gap-2">
        {(['attractions', 'restaurants', 'hotels', 'promotions', 'swipe_items'] as const).map(col => (
          <button
            key={col}
            onClick={() => handleSelectCollection(col)}
            className={`px-3 py-2 text-xs font-black rounded-xl border transition-all ${activeCollection === col ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-500 border-slate-200'}`}
          >
            {col === 'attractions' && '🏝️ Attractions'}
            {col === 'restaurants' && '🍳 Restaurants'}
            {col === 'hotels' && '🏨 Hotels'}
            {col === 'promotions' && '🎁 Promotions'}
            {col === 'swipe_items' && '🔥 Tinder Deck'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Row Form Editor (Left 4 cols) */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-200/60 rounded-2xl p-5 space-y-4">
          <h3 className="font-display font-bold text-sm text-slate-800 flex items-center gap-1.5">
            <span>📝</span> {editingId ? `แก้ไขแถวคอลัมน์ ID: ${editingId}` : `เพิ่มแถวข้อมูลใหม่ (${activeCollection})`}
          </h3>

          <form onSubmit={handleSave} className="space-y-3.5 text-xs">
            
            <div className="space-y-1">
              <label className="font-bold text-slate-500">ID แถวข้อมูล (ห้ามซ้ำ)</label>
              <input
                type="text"
                disabled={!!editingId}
                placeholder="เช่น my_spot_01"
                value={formData.id || ''}
                onChange={e => setFormData({ ...formData, id: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-semibold text-slate-800 disabled:bg-slate-200"
              />
            </div>

            {activeCollection !== 'promotions' ? (
              <>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">ชื่อสถานที่ (Name)</label>
                  <input
                    type="text"
                    placeholder="ระบุชื่อภาษาไทย..."
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-semibold text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">หมวดหมู่ (Category)</label>
                    <input
                      type="text"
                      placeholder="beach / culture / nature / food"
                      value={formData.category || ''}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-semibold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">เรตติ้ง (Rating)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      placeholder="4.8"
                      value={formData.rating !== undefined ? formData.rating : ''}
                      onChange={e => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-semibold text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500">URL รูปภาพหลัก (Image)</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.image || ''}
                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-semibold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500">คำอธิบายรายละเอียด (Description)</label>
                  <textarea
                    placeholder="คำอธิบายสิทธิพิเศษและการท่องเที่ยว..."
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-semibold text-slate-800 h-16"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">ป้ายสไตล์การเที่ยว (Tag)</label>
                    <input
                      type="text"
                      placeholder="เช่น ทะเล / ครอบครัว"
                      value={formData.tag || ''}
                      onChange={e => setFormData({ ...formData, tag: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-semibold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">ย่านพิกัด (Location / District)</label>
                    <input
                      type="text"
                      placeholder="เช่น อ.ชะอำ"
                      value={formData.location || ''}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-semibold text-slate-800"
                    />
                  </div>
                </div>

                {(activeCollection === 'restaurants' || activeCollection === 'hotels') && (
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">ระดับราคา (Price Symbol)</label>
                    <input
                      type="text"
                      placeholder="เช่น ฿฿ - ฿฿฿"
                      value={formData.price || ''}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-semibold text-slate-800"
                    />
                  </div>
                )}

                {activeCollection === 'swipe_items' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500">อัตราแมตช์ (Match Rate %)</label>
                      <input
                        type="number"
                        placeholder="95"
                        value={formData.matchRate !== undefined ? formData.matchRate : ''}
                        onChange={e => setFormData({ ...formData, matchRate: parseInt(e.target.value) || 0 })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-semibold text-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500">ข้อความพฤติกรรม AI</label>
                      <input
                        type="text"
                        placeholder="เช่น ❤️ ชอบมาก / ❌ ข้าม..."
                        value={formData.behaviorLog || ''}
                        onChange={e => setFormData({ ...formData, behaviorLog: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-semibold text-slate-800"
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">ชื่อหัวข้อสิทธิประโยชน์ (Title)</label>
                  <input
                    type="text"
                    placeholder="เช่น ส่วนลดค่าอาหาร 15% ทันที"
                    value={formData.title || ''}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-semibold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500">คำอธิบายรายละเอียดสิทธิประโยชน์ (Description)</label>
                  <textarea
                    placeholder="เมื่อทานครบ 350 บาทขึ้นไป..."
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-semibold text-slate-800 h-16"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">โค้ดส่วนลด (Promo Code)</label>
                    <input
                      type="text"
                      placeholder="JEKMENG15"
                      value={formData.code || ''}
                      onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-black text-slate-800 uppercase"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">คะแนนพอยท์ที่ใช้ (Points)</label>
                    <input
                      type="number"
                      placeholder="50"
                      value={formData.pointsRequired !== undefined ? formData.pointsRequired : ''}
                      onChange={e => setFormData({ ...formData, pointsRequired: parseInt(e.target.value) || 0 })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-semibold text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">ชื่อร้านผู้มอบดีล (Provider Name)</label>
                    <input
                      type="text"
                      placeholder="เจ๊กเม้ง ก๋วยเตี๋ยวน้ำแดง"
                      value={formData.providerName || ''}
                      onChange={e => setFormData({ ...formData, providerName: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-semibold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">มูลค่าส่วนลด (Discount Label)</label>
                    <input
                      type="text"
                      placeholder="15%"
                      value={formData.discount || ''}
                      onChange={e => setFormData({ ...formData, discount: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-semibold text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">รหัสผู้ให้บริการ (Provider ID)</label>
                    <input
                      type="text"
                      placeholder="r1"
                      value={formData.providerId || ''}
                      onChange={e => setFormData({ ...formData, providerId: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-semibold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500">ประเภทดีล (Provider Type)</label>
                    <input
                      type="text"
                      placeholder="restaurant / hotel"
                      value={formData.providerType || ''}
                      onChange={e => setFormData({ ...formData, providerType: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-semibold text-slate-800"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="pt-2 flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
              >
                💾 บันทึกแถวข้อมูล
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => { setEditingId(null); setFormData({}); }}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 px-4 rounded-xl transition-all"
                >
                  ยกเลิก
                </button>
              )}
            </div>

          </form>
        </div>

        {/* Database Grid Table (Right 7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <h4 className="font-display font-bold text-sm text-slate-800">
              แถวข้อมูลในฐานข้อมูลปัจจุบัน ({currentList().length} รายการ)
            </h4>
            <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded border border-slate-200/40">
              Firestore Stream
            </span>
          </div>

          <div className="border border-slate-200/60 rounded-2xl overflow-hidden max-h-[460px] overflow-y-auto bg-white">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/60 font-bold text-slate-500">
                  <th className="p-3">รหัส ID / รูป</th>
                  <th className="p-3">ข้อมูลแถว</th>
                  <th className="p-3">พิกัด/หมวดหมู่</th>
                  <th className="p-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentList().map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 flex items-center gap-2.5">
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt="" 
                          className="w-10 h-10 rounded-lg object-cover border shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <span className="font-mono font-bold text-[10px] text-slate-400 truncate max-w-[80px]">
                        {item.id}
                      </span>
                    </td>
                    <td className="p-3">
                      <p className="font-display font-bold text-slate-800 leading-tight">
                        {item.name || item.title}
                      </p>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                    </td>
                    <td className="p-3">
                      <span className="bg-slate-100 text-slate-500 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                        {item.category}
                      </span>
                      {item.location && (
                        <p className="text-[10px] text-slate-400 mt-1">📍 {item.location}</p>
                      )}
                    </td>
                    <td className="p-3 text-right space-x-1.5 shrink-0 whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(item)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-slate-100 hover:bg-slate-200 text-rose-700 font-bold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
