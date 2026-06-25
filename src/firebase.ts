import { initializeApp } from 'firebase/app';
import { getFirestore, doc, writeBatch, collection, getDocs, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Attraction, Restaurant, Hotel, Promotion, SwipeItem, Transaction } from './types';

const app = initializeApp(firebaseConfig);

// CRITICAL: Must use the firestoreDatabaseId from the configuration
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Test connection function as recommended in guidelines
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase connection validated successfully.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

// Default initial data for seeding (mapped to spreadsheet columns & rows)
export const DEFAULT_ATTRACTIONS: Attraction[] = [
  {
    id: 'a1',
    name: 'พระนครคีรี (เขาวัง)',
    category: 'culture',
    image: 'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?auto=format&fit=crop&w=800&q=80',
    description: 'โบราณสถานคู่บ้านคู่เมืองเพชรบุรี ตั้งตระหง่านอยู่บนยอดเขา 3 ยอด เดินทางขึ้นด้วยรถรางไฟฟ้าสัมผัสประวัติศาสตร์และทัศนัยภาพรอบตัวเมือง',
    tag: 'วัฒนธรรม / วิวเมือง',
    rating: 4.8,
    location: 'อ.เมืองเพชรบุรี'
  },
  {
    id: 'a2',
    name: 'อุทยานแห่งชาติแก่งกระจาน',
    category: 'nature',
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=80',
    description: 'ผืนป่ามรดกโลกทางธรรมชาติอันอุดมสมบูรณ์ สัมผัสทะเลหมอกพะเนินทุ่ง เดินข้ามสะพานแขวน และล่องแก่งแม่น้ำที่สดชื่น',
    tag: 'ธรรมชาติ / ทะเลหมอก / มรดกโลก',
    rating: 4.9,
    location: 'อ.แก่งกระจาน'
  },
  {
    id: 'a3',
    name: 'ชายหาดชะอำ',
    category: 'beach',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    description: 'ชายหาดยอดฮิตตลอดกาล เดินเล่นบนหาดทรายขาวละเอียด ขี่ม้าชมวิวเลียบหาดคลายร้อน และทานซีฟู้ดสดๆ ริมทะเล',
    tag: 'ทะเล / ครอบครัว / ปิกนิก',
    rating: 4.7,
    location: 'อ.ชะอำ'
  },
  {
    id: 'a4',
    name: 'ถ้ำเขาหลวง',
    category: 'culture',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    description: 'ถ้ำขนาดใหญ่ที่มีความงดงามตระการตา ไฮไลต์เด็ดคือลำแสงอาทิตย์ส่องตรงจากเพดานถ้ำลงมากราบพระพุทธรูปโบราณด้านล่าง',
    tag: 'สิ่งศักดิ์สิทธิ์ / ถ่ายภาพ',
    rating: 4.8,
    location: 'อ.เมืองเพชรบุรี'
  },
  {
    id: 'a5',
    name: 'โครงการพระราชดำริแหลมผักเบี้ย',
    category: 'nature',
    image: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=80',
    description: 'เส้นทางศึกษาธรรมชาติป่าชายเลน เดินสูดอากาศบริสุทธิ์บนสะพานไม้ยาวผ่านแนวต้นโกงกาง ชมฝูงนกป่าชายเลนหาดูยาก',
    tag: 'อนุรักษ์ธรรมชาติ / ชมนก',
    rating: 4.6,
    location: 'อ.บ้านแหลม'
  },
  { id: 'a6', name: 'หาดเจ้าสำราญ', category: 'beach', image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80', description: 'หาดทรายเงียบสงบ เหมาะแก่การพักผ่อนแบบส่วนตัว', tag: 'ทะเล / ส่วนตัว', rating: 4.5, location: 'อ.เมืองเพชรบุรี' },
  { id: 'a7', name: 'วัดมหาธาตุวรวิหาร', category: 'culture', image: 'https://images.unsplash.com/photo-1590494426543-30b1c0fcbfce?auto=format&fit=crop&w=800&q=80', description: 'วัดคู่บ้านคู่เมือง โดดเด่นด้วยพระปรางค์ 5 ยอด', tag: 'วัด / ประวัติศาสตร์', rating: 4.8, location: 'อ.เมืองเพชรบุรี' },
  { id: 'a8', name: 'หาดปึกเตียน', category: 'beach', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', description: 'หาดทรายสวยงาม มีรูปปั้นผีเสื้อสมุทรตั้งตระหง่านกลางทะเล', tag: 'ทะเล / ถ่ายรูป', rating: 4.4, location: 'อ.ท่ายาง' },
  { id: 'a9', name: 'น้ำตกป่าละอู', category: 'nature', image: 'https://images.unsplash.com/photo-1543884846-95faec3e20e8?auto=format&fit=crop&w=800&q=80', description: 'น้ำตกสวยงามกลางป่าลึก มีผีเสื้อนานาพันธุ์', tag: 'ธรรมชาติ / น้ำตก', rating: 4.7, location: 'อ.แก่งกระจาน' },
  { id: 'a10', name: 'พระรามราชนิเวศน์ (วังบ้านปืน)', category: 'culture', image: 'https://images.unsplash.com/photo-1588691516086-44470bc6f827?auto=format&fit=crop&w=800&q=80', description: 'พระราชวังยุโรปคลาสสิกที่สร้างในสมัยรัชกาลที่ 5', tag: 'สถาปัตยกรรม / ประวัติศาสตร์', rating: 4.9, location: 'อ.เมืองเพชรบุรี' },
  { id: 'a11', name: 'จุดชมวิวเขาพะเนินทุ่ง', category: 'nature', image: 'https://images.unsplash.com/photo-1542224566-6e85f2e10715?auto=format&fit=crop&w=800&q=80', description: 'ชมทะเลหมอกสุดอลังการและอากาศเย็นสบายตลอดปี', tag: 'ธรรมชาติ / ทะเลหมอก', rating: 4.9, location: 'อ.แก่งกระจาน' },
  { id: 'a12', name: 'วัดข่อย', category: 'culture', image: 'https://images.unsplash.com/photo-1600868128383-70ba629734e5?auto=format&fit=crop&w=800&q=80', description: 'มีพระมหาธาตุเจดีย์พุทธเมตตาที่งดงามด้วยศิลปะปูนปั้นเมืองเพชร', tag: 'วัด / ศิลปะปูนปั้น', rating: 4.7, location: 'อ.เมืองเพชรบุรี' },
  { id: 'a13', name: 'ถ้ำเขาย้อย', category: 'culture', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80', description: 'ประดิษฐานพระพุทธรูปไสยาสน์ขนาดใหญ่', tag: 'ถ้ำ / สิ่งศักดิ์สิทธิ์', rating: 4.5, location: 'อ.เขาย้อย' },
  { id: 'a14', name: 'ซาฟารีปาร์ค หัวหิน-ชะอำ', category: 'nature', image: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=800&q=80', description: 'สวนสัตว์เปิดที่ให้คุณใกล้ชิดกับสัตว์นานาชนิด', tag: 'ครอบครัว / สวนสัตว์', rating: 4.6, location: 'อ.ชะอำ' },
  { id: 'a15', name: 'ตลาดน้ำทุ่งบัวชม', category: 'culture', image: 'https://images.unsplash.com/photo-1550993540-1bc6e3bb6fc5?auto=format&fit=crop&w=800&q=80', description: 'ตลาดน้ำย้อนยุค ของกินหลากหลาย', tag: 'ตลาดน้ำ / ช้อปปิ้ง', rating: 4.3, location: 'อ.เขาย้อย' },
  { id: 'a16', name: 'ถ้ำเขาหลวง', category: 'culture', image: 'https://images.unsplash.com/photo-1590494426543-30b1c0fcbfce?auto=format&fit=crop&w=800&q=80', description: 'ถ้ำที่สวยที่สุดในเพชรบุรี มีหินงอกหินย้อยและแสงส่องทะลุปล่องถ้ำ', tag: 'ถ้ำ / ประวัติศาสตร์', rating: 4.8, location: 'อ.เมืองเพชรบุรี' },
  { id: 'a17', name: 'โครงการชั่งหัวมัน ตามพระราชดำริ', category: 'nature', image: 'https://images.unsplash.com/photo-1543884846-95faec3e20e8?auto=format&fit=crop&w=800&q=80', description: 'ศูนย์เรียนรู้การเกษตรอันเนื่องมาจากพระราชดำริ บรรยากาศร่มรื่น', tag: 'เกษตร / ครอบครัว', rating: 4.7, location: 'อ.ท่ายาง' },
  { id: 'a18', name: 'วัดกำแพงแลง', category: 'culture', image: 'https://images.unsplash.com/photo-1600868128383-70ba629734e5?auto=format&fit=crop&w=800&q=80', description: 'โบราณสถานขอมแห่งเดียวในเพชรบุรี เก่าแก่กว่า 800 ปี', tag: 'วัด / ประวัติศาสตร์', rating: 4.5, location: 'อ.เมืองเพชรบุรี' },
  { id: 'a19', name: 'แหลมผักเบี้ย', category: 'nature', image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80', description: 'โครงการศึกษาวิจัยและพัฒนาสิ่งแวดล้อมแหลมผักเบี้ย เส้นทางศึกษาธรรมชาติป่าชายเลน', tag: 'ธรรมชาติ / ป่าชายเลน', rating: 4.6, location: 'อ.บ้านแหลม' },
  { id: 'a20', name: 'วัดใหญ่สุวรรณาราม', category: 'culture', image: 'https://images.unsplash.com/photo-1590494426543-30b1c0fcbfce?auto=format&fit=crop&w=800&q=80', description: 'วัดเก่าแก่สมัยอยุธยา มีจิตรกรรมฝาผนังอายุกว่า 300 ปี', tag: 'วัด / ศิลปะ', rating: 4.8, location: 'อ.เมืองเพชรบุรี' },
  { id: 'a21', name: 'วนอุทยานเขานางพันธุรัต', category: 'nature', image: 'https://images.unsplash.com/photo-1542224566-6e85f2e10715?auto=format&fit=crop&w=800&q=80', description: 'ภูเขาหินปูนรูปร่างแปลกตา มีเส้นทางเดินศึกษาธรรมชาติ', tag: 'ธรรมชาติ / เดินป่า', rating: 4.5, location: 'อ.ชะอำ' },
  { id: 'a22', name: 'หาดชะอำ', category: 'beach', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', description: 'หาดยอดฮิตตลอดกาลของเมืองเพชร ของกินเยอะ กิจกรรมแน่น', tag: 'ทะเล / ครอบครัว', rating: 4.4, location: 'อ.ชะอำ' },
  { id: 'a23', name: 'วัดเขาตะเครา', category: 'culture', image: 'https://images.unsplash.com/photo-1588691516086-44470bc6f827?auto=format&fit=crop&w=800&q=80', description: 'ประดิษฐานหลวงพ่อทอง ศักดิ์สิทธิ์และเป็นที่เคารพสักการะ', tag: 'วัด / สิ่งศักดิ์สิทธิ์', rating: 4.7, location: 'อ.บ้านแหลม' },
  { id: 'a24', name: 'ฟาร์มแกะ Swiss Sheep Farm', category: 'nature', image: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=800&q=80', description: 'ฟาร์มแกะสไตล์สวิส ถ่ายรูปสวย ให้อาหารสัตว์ได้', tag: 'ครอบครัว / ถ่ายรูป', rating: 4.3, location: 'อ.ชะอำ' },
  { id: 'a25', name: 'Camel Republic', category: 'nature', image: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=800&q=80', description: 'สวนสัตว์และสวนสนุกสไตล์โมร็อกโก', tag: 'สวนสนุก / สวนสัตว์', rating: 4.4, location: 'อ.ชะอำ' },
  { id: 'a26', name: 'น้ำพุร้อนหนองหญ้าปล้อง', category: 'nature', image: 'https://images.unsplash.com/photo-1543884846-95faec3e20e8?auto=format&fit=crop&w=800&q=80', description: 'บ่อน้ำพุร้อนธรรมชาติกลางป่า แช่น้ำแร่เพื่อสุขภาพ', tag: 'ธรรมชาติ / สุขภาพ', rating: 4.2, location: 'อ.หนองหญ้าปล้อง' },
  { id: 'a27', name: 'ตลาดน้ำกวางโจว', category: 'culture', image: 'https://images.unsplash.com/photo-1550993540-1bc6e3bb6fc5?auto=format&fit=crop&w=800&q=80', description: 'ตลาดน้ำบนน้ำตกแห่งแรกในไทย อาหารป่ารสเด็ด', tag: 'ตลาดน้ำ / อาหาร', rating: 4.3, location: 'อ.หนองหญ้าปล้อง' },
  { id: 'a28', name: 'ถ้ำค้างคาวนายาง', category: 'nature', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80', description: 'ชมฝูงค้างคาวนับล้านบินออกจากถ้ำในยามเย็น', tag: 'ธรรมชาติ / ชมนกและสัตว์', rating: 4.5, location: 'อ.ชะอำ' },
  { id: 'a29', name: 'มาลัยฟาร์ม', category: 'nature', image: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=800&q=80', description: 'แหล่งท่องเที่ยวเชิงเกษตร มีสัตว์หลากหลายชนิด เหมาะกับเด็กๆ', tag: 'เกษตร / ครอบครัว', rating: 4.4, location: 'อ.ชะอำ' },
  { id: 'a30', name: 'โป่งลึก-บางกลอย', category: 'culture', image: 'https://images.unsplash.com/photo-1542224566-6e85f2e10715?auto=format&fit=crop&w=800&q=80', description: 'หมู่บ้านชาวกะเหรี่ยงในป่าลึก เรียนรู้วิถีชีวิตที่เรียบง่าย', tag: 'วัฒนธรรม / ชุมชน', rating: 4.8, location: 'อ.แก่งกระจาน' },
];

export const DEFAULT_RESTAURANTS: Restaurant[] = [
  {
    id: 'r1',
    name: 'เจ๊กเม้ง ก๋วยเตี๋ยวน้ำแดง',
    category: 'food',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    description: 'สุดยอดก๋วยเตี๋ยวน้ำแดงสูตรเข้มข้น หอมกลิ่นน้ำตาลโตนดแท้เมืองเพชร เป็นร้านอร่อยห้ามพลาดเด็ดขาด',
    price: '฿ - ฿฿',
    rating: 4.6,
    tag: 'ก๋วยเตี๋ยวน้ำแดง / ของดีเมืองเพชร',
    location: 'อ.เมืองเพชรบุรี'
  },
  {
    id: 'r2',
    name: 'ครัวชมวาฬ บางตะบูน',
    category: 'food',
    image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=800&q=80',
    description: 'ร้านอาหารทะเลสดใหม่ริมปากอ่าวบางตะบูน เมนูปูไข่นึ่ง แกงคั่วปูใบชะคราม รสชาติจัดจ้านฉบับพื้นบ้านแท้ๆ',
    price: '฿฿฿ - ฿฿฿฿',
    rating: 4.7,
    tag: 'อาหารทะเล / ติดริมน้ำ',
    location: 'อ.บ้านแหลม'
  },
  {
    id: 'r3',
    name: 'สวีทโตนด คาเฟ่ (Sweet Tanot)',
    category: 'cafe',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    description: 'คาเฟ่กลางสวนต้นโตนดอันร่มรื่น นำน้ำตาลโตนดสดมาทำเป็นเครื่องดื่มและเค้กสไตล์โฮมเมดแสนอร่อย ถ่ายรูปสวยมาก',
    price: '฿฿',
    rating: 4.5,
    tag: 'สวนโตนด / กาแฟ / ขนมหวาน',
    location: 'อ.บ้านลาด'
  },
  { id: 'r4', name: 'ร้านระเบียงริมน้ำ', category: 'food', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80', description: 'อาหารไทยบรรยากาศดีริมแม่น้ำเพชรบุรี', price: '฿฿', rating: 4.6, tag: 'อาหารไทย / ริมน้ำ', location: 'อ.เมืองเพชรบุรี' },
  { id: 'r5', name: 'ข้าวแกง 200 ปี', category: 'food', image: 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?auto=format&fit=crop&w=800&q=80', description: 'ข้าวแกงพื้นบ้านรสเด็ด เปิดมาอย่างยาวนาน', price: '฿', rating: 4.5, tag: 'ข้าวแกง / ดั้งเดิม', location: 'อ.เมืองเพชรบุรี' },
  { id: 'r6', name: 'ซีฟู้ดเจ๊อ้อย ชะอำ', category: 'food', image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=800&q=80', description: 'อาหารทะเลสดใหม่ รสชาติจัดจ้าน', price: '฿฿฿', rating: 4.7, tag: 'ซีฟู้ด / ริมทะเล', location: 'อ.ชะอำ' },
  { id: 'r7', name: 'ขนมจีนทอดมัน', category: 'food', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80', description: 'อาหารขึ้นชื่อเมืองเพชร ขนมจีนทานคู่กับทอดมันปลากราย', price: '฿', rating: 4.6, tag: 'สตรีทฟู้ด / ของดีเมืองเพชร', location: 'อ.เมืองเพชรบุรี' },
  { id: 'r8', name: 'ลุงหนวด ซีฟู้ด', category: 'food', image: 'https://images.unsplash.com/photo-1626078696120-21e16fdf9e29?auto=format&fit=crop&w=800&q=80', description: 'ซีฟู้ดพื้นบ้าน กุ้งหอยปูปลาสดๆ', price: '฿฿฿', rating: 4.8, tag: 'ซีฟู้ด / สดใหม่', location: 'อ.บ้านแหลม' },
  { id: 'r9', name: 'คาเฟ่ เดอ เพชร', category: 'cafe', image: 'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&w=800&q=80', description: 'คาเฟ่สไตล์มินิมอล กาแฟหอม ขนมอร่อย', price: '฿฿', rating: 4.4, tag: 'กาแฟ / เค้ก', location: 'อ.เมืองเพชรบุรี' },
  { id: 'r10', name: 'ผัดไทยท่ายาง', category: 'food', image: 'https://images.unsplash.com/photo-1626804475297-4160aece9dc8?auto=format&fit=crop&w=800&q=80', description: 'ผัดไทยเจ้าเก่าแก่ รสชาติอร่อยไม่ต้องปรุง', price: '฿', rating: 4.7, tag: 'ผัดไทย / เก่าแก่', location: 'อ.ท่ายาง' },
  { id: 'r11', name: 'ครัวลุงญา', category: 'food', image: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&w=800&q=80', description: 'อาหารป่า แกงเผ็ด แกงป่า รสชาติถึงเครื่อง', price: '฿฿', rating: 4.5, tag: 'อาหารป่า / รสจัด', location: 'อ.แก่งกระจาน' },
  { id: 'r12', name: 'ชะอำ ฟิชชิ่ง พาร์ค & ซีฟู้ด', category: 'food', image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80', description: 'ตกปลาและทานอาหารทะเลสดๆ', price: '฿฿฿', rating: 4.3, tag: 'ซีฟู้ด / กิจกรรม', location: 'อ.ชะอำ' },
  { id: 'r13', name: 'ก๋วยเตี๋ยวเนื้อนายฮั่ง', category: 'food', image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cb438?auto=format&fit=crop&w=800&q=80', description: 'เนื้อเปื่อย เครื่องใน ครบเครื่อง ซุปหอมอร่อย', price: '฿', rating: 4.6, tag: 'ก๋วยเตี๋ยวเนื้อ', location: 'อ.เมืองเพชรบุรี' },
  { id: 'r14', name: 'ร้านเปลญวน', category: 'food', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80', description: 'อาหารไทยพื้นบ้าน บรรยากาศร่มรื่น สไตล์บ้านสวน', price: '฿฿', rating: 4.6, tag: 'อาหารไทย / บรรยากาศดี', location: 'อ.เมืองเพชรบุรี' },
  { id: 'r15', name: 'พวงเพชร', category: 'food', image: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&w=800&q=80', description: 'ร้านอาหารเก่าแก่ของเมืองเพชร เมนูแนะนำคือ ปลาดุกผัดฉ่า', price: '฿฿', rating: 4.5, tag: 'อาหารไทย / เก่าแก่', location: 'อ.เมืองเพชรบุรี' },
  { id: 'r16', name: 'เจ๊เหมียว ซีฟู้ด', category: 'food', image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=800&q=80', description: 'อาหารทะเลสด รสจัดจ้าน ราคาไม่แพง ริมหาดชะอำ', price: '฿฿', rating: 4.4, tag: 'ซีฟู้ด / คุ้มค่า', location: 'อ.ชะอำ' },
  { id: 'r17', name: 'ครัวจันทร์ฉาย', category: 'food', image: 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?auto=format&fit=crop&w=800&q=80', description: 'อาหารป่าและอาหารไทย รสชาติจัดจ้านตามสไตล์คนเพชร', price: '฿฿', rating: 4.5, tag: 'อาหารป่า / อาหารไทย', location: 'อ.เมืองเพชรบุรี' },
  { id: 'r18', name: 'ป้ารวยปูเป็น', category: 'food', image: 'https://images.unsplash.com/photo-1626078696120-21e16fdf9e29?auto=format&fit=crop&w=800&q=80', description: 'ปูม้านึ่งสดๆ น้ำจิ้มซีฟู้ดแซ่บๆ สไตล์บ้านๆ', price: '฿฿฿', rating: 4.7, tag: 'ซีฟู้ด / ปูม้า', location: 'อ.ชะอำ' },
  { id: 'r19', name: 'ชมวิวซีฟู้ด', category: 'food', image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80', description: 'ร้านอาหารบรรยากาศดีริมทะเลชะอำ อาหารทะเลสดใหม่', price: '฿฿฿', rating: 4.3, tag: 'ซีฟู้ด / วิวทะเล', location: 'อ.ชะอำ' },
  { id: 'r20', name: 'ร้านคุณลิน', category: 'food', image: 'https://images.unsplash.com/photo-1626804475297-4160aece9dc8?auto=format&fit=crop&w=800&q=80', description: 'อาหารไทยและอาหารตะวันตก ตกแต่งสวยงาม', price: '฿฿', rating: 4.4, tag: 'อาหารฟิวชั่น / บรรยากาศดี', location: 'อ.ชะอำ' },
  { id: 'r21', name: 'บ้านน้ำพริกข้าวสวย', category: 'food', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80', description: 'น้ำพริกหลากหลายชนิด ทานคู่กับผักเหนาะและข้าวสวยร้อนๆ', price: '฿', rating: 4.6, tag: 'น้ำพริก / อาหารไทย', location: 'อ.เมืองเพชรบุรี' },
  { id: 'r22', name: 'ครัวแม่สุมณฑา', category: 'food', image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cb438?auto=format&fit=crop&w=800&q=80', description: 'อาหารไทยรสชาติดั้งเดิม เหมือนรสมือแม่', price: '฿฿', rating: 4.5, tag: 'อาหารไทย / ครอบครัว', location: 'อ.ท่ายาง' },
  { id: 'r23', name: 'กาแฟบ้านร้อยปี', category: 'cafe', image: 'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&w=800&q=80', description: 'คาเฟ่ในบ้านไม้โบราณอายุร้อยปี กาแฟโบราณอร่อย', price: '฿', rating: 4.7, tag: 'กาแฟโบราณ / คลาสสิก', location: 'อ.เมืองเพชรบุรี' },
  { id: 'r24', name: 'ร้านนุชทอดมัน', category: 'food', image: 'https://images.unsplash.com/photo-1626804475297-4160aece9dc8?auto=format&fit=crop&w=800&q=80', description: 'ทอดมันปลากรายเนื้อเหนียวหนึบ ทานคู่กับขนมจีน', price: '฿', rating: 4.6, tag: 'สตรีทฟู้ด / ของดัง', location: 'อ.เมืองเพชรบุรี' },
  { id: 'r25', name: 'สวนอาหารบ้านลีลาวดี', category: 'food', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80', description: 'สวนอาหารขนาดใหญ่ มีดนตรีสด เหมาะกับการจัดเลี้ยง', price: '฿฿฿', rating: 4.2, tag: 'จัดเลี้ยง / ดนตรีสด', location: 'อ.เมืองเพชรบุรี' },
  { id: 'r26', name: 'ร้านอาหารรสเด็ด', category: 'food', image: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&w=800&q=80', description: 'ก๋วยเตี๋ยวและอาหารตามสั่ง รสชาติเด็ดสมชื่อ', price: '฿', rating: 4.4, tag: 'อาหารจานเดียว / ตามสั่ง', location: 'อ.เมืองเพชรบุรี' },
  { id: 'r27', name: 'ก๋วยเตี๋ยวหมูน้ำแดง (เจ๊ลั้ง)', category: 'food', image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cb438?auto=format&fit=crop&w=800&q=80', description: 'ก๋วยเตี๋ยวหมูน้ำแดงสูตรเมืองเพชรแท้ๆ', price: '฿', rating: 4.5, tag: 'ก๋วยเตี๋ยว / ของดัง', location: 'อ.เมืองเพชรบุรี' },
  { id: 'r28', name: 'ไอศกรีมเจริญกาด', category: 'cafe', image: 'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&w=800&q=80', description: 'ไอศกรีมกะทิสดเจ้าเก่า ท็อปปิ้งแน่นๆ', price: '฿', rating: 4.7, tag: 'ของหวาน / ดั้งเดิม', location: 'อ.เมืองเพชรบุรี' },
  { id: 'r29', name: 'ข้าวตัง สุคันธา', category: 'cafe', image: 'https://images.unsplash.com/photo-1626804475297-4160aece9dc8?auto=format&fit=crop&w=800&q=80', description: 'ร้านขายของฝากและข้าวตังเจ้าอร่อย มีมุมนั่งทานขนม', price: '฿฿', rating: 4.6, tag: 'ของฝาก / ขนมหวาน', location: 'อ.เมืองเพชรบุรี' },
  { id: 'r30', name: 'ลูกชิ้นหมูปิ้ง หน้าวัดข่อย', category: 'food', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80', description: 'ลูกชิ้นหมูปิ้งไม้ละ 5 บาท น้ำจิ้มรสเด็ด', price: '฿', rating: 4.8, tag: 'สตรีทฟู้ด / กินเล่น', location: 'อ.เมืองเพชรบุรี' },
];

export const DEFAULT_HOTELS: Hotel[] = [
  {
    id: 'h1',
    name: 'SO Sofitel Hua Hin (ชะอำ)',
    category: 'hotel',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    description: 'รีสอร์ทดีไซน์ลักชัวรีสุดอาร์ต ติดริมหาดชะอำ สวนสนุกริมสระว่ายน้ำยักษ์ เหมาะสำหรับการพักผ่อนแบบเหนือระดับ',
    price: '฿฿฿฿฿',
    rating: 4.9,
    tag: 'รีสอร์ทหรู / สระว่ายน้ำ / ติดหาด',
    location: 'อ.ชะอำ'
  },
  {
    id: 'h2',
    name: 'แก่งกระจาน โบ้ทเฮ้าส์ พาราไดซ์',
    category: 'hotel',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    description: 'รีสอร์ทสไตล์บ้านเรือนแพบนอ่างเก็บน้ำแก่งกระจาน นอนพักผ่อนชมพระอาทิตย์ลับขอบฟ้าและตื่นมาดูสายหมอกบนผิวน้ำ',
    price: '฿฿ - ฿฿฿',
    rating: 4.6,
    tag: 'ติดริมน้ำ / ชิลธรรมชาติ / ทะเลสาบ',
    location: 'อ.แก่งกระจาน'
  },
  {
    id: 'h3',
    name: 'บ้านสบายใจ รีสอร์ท ชะอำ',
    category: 'hotel',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
    description: 'ที่พักแสนอบอุ่นในบรรยากาศส่วนตัว ใกล้หาดชะอำ มีสระว่ายน้ำสำหรับครอบครัวและสวนสวยในราคาเป็นมิตร',
    price: '฿฿',
    rating: 4.4,
    tag: 'ครอบครัว / สระว่ายน้ำ / ราคามิตรภาพ',
    location: 'อ.ชะอำ'
  },
  { id: 'h4', name: 'Springfield @ Sea Resort & Spa', category: 'hotel', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', description: 'รีสอร์ทหรูริมหาดชะอำ พร้อมสระว่ายน้ำขนาดใหญ่และสปา', price: '฿฿฿฿', rating: 4.8, tag: 'รีสอร์ทหรู / สปา', location: 'อ.ชะอำ' },
  { id: 'h5', name: 'Nana Resort Kaeng Krachan', category: 'hotel', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80', description: 'รีสอร์ทสไตล์ธรรมชาติ ใกล้อุทยานแห่งชาติแก่งกระจาน', price: '฿฿฿', rating: 4.5, tag: 'ธรรมชาติ / ครอบครัว', location: 'อ.แก่งกระจาน' },
  { id: 'h6', name: 'The Regent Cha Am Beach Resort', category: 'hotel', image: 'https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=800&q=80', description: 'รีสอร์ทคลาสสิกริมหาด เหมาะกับการพักผ่อนและจัดสัมมนา', price: '฿฿฿฿', rating: 4.6, tag: 'ติดหาด / สัมมนา', location: 'อ.ชะอำ' },
  { id: 'h7', name: 'i Tara Resort & Spa', category: 'hotel', image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80', description: 'รีสอร์ทติดทะเล มีความเงียบสงบส่วนตัวสูง', price: '฿฿฿', rating: 4.5, tag: 'ส่วนตัว / สปา', location: 'อ.บ้านแหลม' },
  { id: 'h8', name: 'Fisherman\'s Resort', category: 'hotel', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80', description: 'บ้านพักสไตล์ชาวเล ริมหาดเจ้าสำราญ', price: '฿฿฿', rating: 4.4, tag: 'ริมหาด / สไตล์ชาวเล', location: 'อ.เมืองเพชรบุรี' },
  { id: 'h9', name: 'Sun Smile Resort', category: 'hotel', image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80', description: 'ที่พักสบายๆ ในเมืองเพชรบุรี เดินทางสะดวก', price: '฿฿', rating: 4.2, tag: 'ในเมือง / สะดวก', location: 'อ.เมืองเพชรบุรี' },
  { id: 'h10', name: 'Veranda Resort & Villas Hua Hin Cha Am', category: 'hotel', image: 'https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?auto=format&fit=crop&w=800&q=80', description: 'รีสอร์ทสุดชิค ถ่ายรูปสวยทุกมุม', price: '฿฿฿฿฿', rating: 4.9, tag: 'ชิค / ถ่ายรูปสวย', location: 'อ.ชะอำ' },
  { id: 'h11', name: 'River View Resort Phetchaburi', category: 'hotel', image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80', description: 'บรรยากาศดีริมแม่น้ำเพชรบุรี', price: '฿฿', rating: 4.3, tag: 'ริมน้ำ / ราคาประหยัด', location: 'อ.เมืองเพชรบุรี' },
  { id: 'h12', name: 'Mighty Mountain Thailand', category: 'hotel', image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80', description: 'บ้านพักตากอากาศสไตล์คันทรี', price: '฿฿฿', rating: 4.6, tag: 'ภูเขา / วิลล่า', location: 'อ.แก่งกระจาน' },
  { id: 'h13', name: 'Long Beach Cha-Am Hotel', category: 'hotel', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', description: 'โรงแรมตึกสูงริมหาดชะอำ วิวทะเลมุมกว้าง', price: '฿฿฿', rating: 4.4, tag: 'วิวทะเล / สระว่ายน้ำ', location: 'อ.ชะอำ' },
  { id: 'h14', name: 'Ace of Hua Hin Resort', category: 'hotel', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', description: 'รีสอร์ทติดทะเลสไตล์บูทีค ถ่ายรูปสวยทุกมุม มีสระว่ายน้ำเชื่อมถึงห้องพัก', price: '฿฿฿฿', rating: 4.7, tag: 'บูทีค / ติดทะเล', location: 'อ.ชะอำ' },
  { id: 'h15', name: 'Baba Beach Club Hua Hin', category: 'hotel', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80', description: 'พูลวิลล่าและโรงแรมสุดหรูริมหาด สไตล์นีโอโคโลเนียล พร้อม Music Lovers Hotel', price: '฿฿฿฿฿', rating: 4.9, tag: 'หรูหรา / ปาร์ตี้', location: 'อ.ชะอำ' },
  { id: 'h16', name: 'The Palayana Hua Hin', category: 'hotel', image: 'https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=800&q=80', description: 'รีสอร์ทส่วนตัวริมหาด มีห้องพักแบบพูลวิลล่าขนาดใหญ่', price: '฿฿฿฿', rating: 4.6, tag: 'พูลวิลล่า / ส่วนตัว', location: 'อ.ชะอำ' },
  { id: 'h17', name: 'Radisson Resort & Spa Hua Hin', category: 'hotel', image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80', description: 'โรงแรมหรูพร้อมสระว่ายน้ำวิวทะเลและสิ่งอำนวยความสะดวกครบครัน', price: '฿฿฿฿', rating: 4.5, tag: 'สปา / ติดทะเล', location: 'อ.ชะอำ' },
  { id: 'h18', name: 'Cher Resort', category: 'hotel', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80', description: 'รีสอร์ทตกแต่งโทนสีขาว-ดำ โดดเด่นด้วยต้นไม้ใหญ่กลางรีสอร์ท', price: '฿฿฿฿', rating: 4.5, tag: 'ดีไซน์เก๋ / ถ่ายรูป', location: 'อ.ชะอำ' },
  { id: 'h19', name: 'Tara Mantara', category: 'hotel', image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80', description: 'รีสอร์ทสไตล์ทรอปิคอล บรรยากาศเงียบสงบ เหมาะกับการพักผ่อน', price: '฿฿฿', rating: 4.3, tag: 'ธรรมชาติ / เงียบสงบ', location: 'อ.ชะอำ' },
  { id: 'h20', name: 'Cera Resort', category: 'hotel', image: 'https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?auto=format&fit=crop&w=800&q=80', description: 'โรงแรมตกแต่งด้วยเซรามิกหลากสีสัน มีเอกลักษณ์เฉพาะตัว', price: '฿฿฿', rating: 4.2, tag: 'ดีไซน์ / เซรามิก', location: 'อ.ชะอำ' },
  { id: 'h21', name: 'Eurasia Cha-am Lagoon', category: 'hotel', image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80', description: 'โรงแรมริมหาดชะอำ บรรยากาศคลาสสิก ราคาเข้าถึงง่าย', price: '฿฿', rating: 4.0, tag: 'ริมหาด / คุ้มค่า', location: 'อ.ชะอำ' },
  { id: 'h22', name: 'Mida De Sea Hua Hin', category: 'hotel', image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80', description: 'โรงแรมสูงวิวทะเลสวย พร้อมสระว่ายน้ำดาดฟ้า', price: '฿฿฿฿', rating: 4.4, tag: 'วิวทะเล / สระว่ายน้ำ', location: 'อ.ชะอำ' },
  { id: 'h23', name: 'Red Z Resort', category: 'hotel', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', description: 'รีสอร์ทสีแดงสดใส ติดหาดปึกเตียน', price: '฿฿฿', rating: 4.3, tag: 'สีสันสดใส / หาดปึกเตียน', location: 'อ.ท่ายาง' },
  { id: 'h24', name: 'J&T Resort Kaeng Krachan', category: 'hotel', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', description: 'ที่พักสไตล์ลอฟท์ ใกล้เขื่อนแก่งกระจาน', price: '฿฿', rating: 4.2, tag: 'ลอฟท์ / แก่งกระจาน', location: 'อ.แก่งกระจาน' },
  { id: 'h25', name: 'Wora Bura Hua Hin Resort', category: 'hotel', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80', description: 'รีสอร์ทสไตล์โคโลเนียลย้อนยุค จำลองบรรยากาศสมัยรัชกาลที่ 5', price: '฿฿฿฿฿', rating: 4.8, tag: 'คลาสสิก / โคโลเนียล', location: 'อ.ชะอำ' },
  { id: 'h26', name: 'Anantara Hua Hin Resort', category: 'hotel', image: 'https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=800&q=80', description: 'รีสอร์ทหรูสไตล์หมู่บ้านไทย บรรยากาศร่มรื่น สปาระดับโลก', price: '฿฿฿฿฿', rating: 4.9, tag: 'หรูหรา / สปา', location: 'อ.ชะอำ' },
  { id: 'h27', name: 'The Banyan Resort', category: 'hotel', image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80', description: 'พูลวิลล่าส่วนตัวท่ามกลางธรรมชาติ เหมาะกับครอบครัวและก๊วนเพื่อน', price: '฿฿฿฿', rating: 4.6, tag: 'วิลล่า / กอล์ฟ', location: 'อ.ชะอำ' },
  { id: 'h28', name: 'Dusit Thani Hua Hin', category: 'hotel', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80', description: 'โรงแรมหรูคลาสสิก สิ่งอำนวยความสะดวกครบครัน สระว่ายน้ำอลังการ', price: '฿฿฿฿฿', rating: 4.7, tag: 'หรูหรา / ครอบครัว', location: 'อ.ชะอำ' },
  { id: 'h29', name: 'Alpaca Resort', category: 'hotel', image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80', description: 'บ้านพักสไตล์ฟาร์ม มีฝูงอัลปาก้าให้ชมอย่างใกล้ชิด', price: '฿฿฿', rating: 4.4, tag: 'ฟาร์มสัตว์ / ครอบครัว', location: 'อ.ชะอำ' },
  { id: 'h30', name: 'บ้านเคียงเล รีสอร์ท', category: 'hotel', image: 'https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?auto=format&fit=crop&w=800&q=80', description: 'ที่พักบรรยากาศเป็นกันเอง ริมหาดเจ้าสำราญ', price: '฿฿', rating: 4.1, tag: 'ริมหาด / เป็นกันเอง', location: 'อ.เมืองเพชรบุรี' },
];

export const DEFAULT_PROMOTIONS: Promotion[] = [
  {
    id: 'p1',
    providerId: 'r1',
    providerType: 'restaurant',
    providerName: 'เจ๊กเม้ง ก๋วยเตี๋ยวน้ำแดง',
    title: 'ส่วนลดค่าอาหาร 15% ทันที',
    description: 'ลิ้มรสก๋วยเตี๋ยวน้ำแดงกลิ่นน้ำตาลโตนดดั้งเดิมในราคาคุ้มค่า เมื่อทานครบ 350 บาทขึ้นไป',
    code: 'JEKMENG15',
    pointsRequired: 50,
    discount: '15%'
  },
  {
    id: 'p2',
    providerId: 'r2',
    providerType: 'restaurant',
    providerName: 'ครัวชมวาฬ บางตะบูน',
    title: 'รับฟรี! เมนูปลาหมึกผัดกะปิหวาน 1 จาน',
    description: 'เมื่อสั่งอาหารประเภทซีฟู้ดชุดหลักของร้าน ทานของอร่อยริมน้ำปากอ่าวบางตะบูนฟรีๆ',
    code: 'WHALECRAB',
    pointsRequired: 100,
    discount: 'ฟรีอาหารพิเศษ'
  },
  {
    id: 'p3',
    providerId: 'h2',
    providerType: 'hotel',
    providerName: 'แก่งกระจาน โบ้ทเฮ้าส์ พาราไดซ์',
    title: 'ส่วนลดห้องพักริมน้ำ 20% สำหรับทริปแก่งกระจาน',
    description: 'เปลี่ยนบรรยากาศไปสัมผัสไอหมอกผิวน้ำแก่งกระจานและรับสิทธิ์ส่วนลดห้องพักแพริมน้ำสุดประทับใจ',
    code: 'BOATHOUSE20',
    pointsRequired: 150,
    discount: 'ลด 20%'
  },
  {
    id: 'p4',
    providerId: 'h3',
    providerType: 'hotel',
    providerName: 'บ้านสบายใจ รีสอร์ท ชะอำ',
    title: 'คูปองแทนเงินสด 300 บาท ในการจองห้องพัก',
    description: 'เหมาะสำหรับทริปชะอำวันครอบครัว คืนความคุ้มค่าให้ทริปริมทะเลของคุณจ่ายน้อยลง',
    code: 'SABAI300',
    pointsRequired: 80,
    discount: 'ลด 300 บาท'
  }
];

export const DEFAULT_SWIPE_DECK: SwipeItem[] = [
  {
    id: 'deck-1',
    name: 'ชายหาดชะอำริมทะเลเพชรบุรี',
    category: 'beach',
    tag: 'พักผ่อนริมชายหาด',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    description: 'จุดแวะเล่นคลื่น เดินลุยหาดทรายขาว และสัมผัสกิจกรรมขี่ม้าสุดคลาสสิกริมฝั่งน้ำชะอำ',
    matchRate: 98,
    typeText: 'ทะเลธรรมชาติ',
    behaviorLog: '❤️ แอดสิ่งอำนวยความสะดวกริมทะเล / ❌ หลีกเลี่ยงถ้าต้องการความเงียบสงบส่วนตัว'
  },
  {
    id: 'deck-2',
    name: 'สะพานแขวนอ่างเก็บน้ำแก่งกระจาน',
    category: 'nature',
    tag: 'สำรวจธรรมชาติมรดกโลก',
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=80',
    description: 'ทอดสะพานแขวนข้ามอ่าวทะเลหมอกและสายน้ำ ลมเย็นสดชื่นพร้อมวิวป่าดงดิบเขียวขจีอันสมบูรณ์',
    matchRate: 95,
    typeText: 'ผจญภัยเชิงอนุรักษ์',
    behaviorLog: '❤️ แอดสไตล์ Adventure / ❌ คัดแยกจุดนี้หากไม่ชอบเดินไกลหรือลุยป่าแดดร้อน'
  },
  {
    id: 'deck-3',
    name: 'สวีทโตนด คาเฟ่ (Sweet Tanot)',
    category: 'cafe',
    tag: 'ชิลคาเฟ่สวนต้นตาล',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    description: 'นั่งจิบกาแฟสดออร์แกนิกที่ผสมความหอมหวานอ่อนละมุนของน้ำตาลโตนดแท้เมืองเพชร ท่ามกลางดงสวนตาลร่มรื่น',
    matchRate: 91,
    typeText: 'สายชิมของหวาน & ถ่ายรูปคาเฟ่',
    behaviorLog: '❤️ เรียนรู้ว่าชอบกินและพักผ่อนคาเฟ่ / ❌ สุ่มกรองจุดเที่ยววิถีวัฒนธรรมที่ลุยกว่า'
  },
  {
    id: 'deck-4',
    name: 'พระนครคีรี (เขาวัง ยอดฮิต)',
    category: 'culture',
    tag: 'ประวัติศาสตร์โบราณราชวังโบราณ',
    image: 'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?auto=format&fit=crop&w=800&q=80',
    description: 'นั่งรถรางขึ้นภูเขาไปสำรวจสถาปัตยกรรมสไตล์นีโอคลาสสิก ชมทิวทัศน์เมืองเพชรบุรีรอบด้าน 360 องศา',
    matchRate: 88,
    typeText: 'โบราณสถานคู่บ้านคู่เมือง',
    behaviorLog: '❤️ บันทึกรสนิยมสายรักประวัติศาสตร์สถาปัตยกรรม / ❌ ปัดออกเมื่อต้องการท่องเที่ยวทันสมัย'
  },
  {
    id: 'deck-5',
    name: 'ก๋วยเตี๋ยวน้ำแดง เจ๊กเม้ง',
    category: 'food',
    tag: 'ลิ้มลองสตรีทฟู้ดน้ำแดงดั้งเดิม',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    description: 'เติมพลังด้วยเมนูเส้นสูตรพิเศษแห่งจังหวัดเพชรบุรี น้ำซุปปรุงด้วยน้ำตาลโตนด รสกลมกล่อมไม่ซ้ำใคร',
    matchRate: 94,
    typeText: 'อาหารท้องถิ่นรสชาติดั้งเดิม',
    behaviorLog: '❤️ ดักจับรสนิยมสตรีทฟู้ดและของคาวพื้นถิ่น / ❌ หากต้องการร้านหรูริมแม่น้ำส่วนตัว'
  },
  {
    id: 'deck-6',
    name: 'ถ้ำเขาหลวง (อุโมงค์แสงตะวัน)',
    category: 'culture',
    tag: 'สักการะสิ่งศักดิ์สิทธิ์ภายในถ้ำ',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    description: 'ชมมหัศจรรย์ธรรมชาติลำแสงอาทิตย์สีทอง ส่องทะลุผ่านปล่องเพดานถ้ำลงมากระทบพระประธานโบราณ',
    matchRate: 92,
    typeText: 'สิ่งศักดิ์สิทธิ์ลึกลับ',
    behaviorLog: '❤️ ชอบการทัศนศึกษาและจิตรกรรมสิ่งสวยงามในธรรมชาติ / ❌ ข้ามเมื่อเหนื่อยล้าจากความลึกลับ'
  }
];

export const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: 't1', type: 'restaurant', providerId: 'r1', providerName: 'เจ๊กเม้ง ก๋วยเตี๋ยวน้ำแดง', user: 'คุณ นภาพร เที่ยวเก่ง', discount: '15%', date: 'วันนี้ 12:30', profit: 480 },
  { id: 't2', type: 'restaurant', providerId: 'r1', providerName: 'เจ๊กเม้ง ก๋วยเตี๋ยวน้ำแดง', user: 'คุณ อภิสิทธิ์ สายกิน', discount: '15%', date: 'วันนี้ 13:15', profit: 620 },
  { id: 't3', type: 'hotel', providerId: 'h2', providerName: 'แก่งกระจาน โบ้ทเฮ้าส์ พาราไดซ์', user: 'คุณ สุรวิชญ์ พักผ่อน', discount: 'ลด 20%', date: 'เมื่อวาน 16:40', profit: 2200 },
  { id: 't4', type: 'restaurant', providerId: 'r2', providerName: 'ครัวชมวาฬ บางตะบูน', user: 'คุณ เกศรินทร์ รสแซ่บ', discount: 'ฟรีอาหารพิเศษ', date: 'เมื่อวาน 18:20', profit: 1450 }
];

/**
 * Seeds Phetchaburi databases into Firestore if they are empty
 */
export async function seedDatabaseIfEmpty() {
  try {
    const attractionsSnap = await getDocs(collection(db, 'attractions'));
    if (attractionsSnap.size < DEFAULT_ATTRACTIONS.length) {
      console.log('Seeding attractions collection...');
      const batch = writeBatch(db);
      DEFAULT_ATTRACTIONS.forEach(item => {
        batch.set(doc(db, 'attractions', item.id), item, { merge: true });
      });
      await batch.commit();
    }

    const restaurantsSnap = await getDocs(collection(db, 'restaurants'));
    if (restaurantsSnap.size < DEFAULT_RESTAURANTS.length) {
      console.log('Seeding restaurants collection...');
      const batch2 = writeBatch(db);
      DEFAULT_RESTAURANTS.forEach(item => {
        batch2.set(doc(db, 'restaurants', item.id), item, { merge: true });
      });
      await batch2.commit();
    }

    const hotelsSnap = await getDocs(collection(db, 'hotels'));
    if (hotelsSnap.size < DEFAULT_HOTELS.length) {
      console.log('Seeding hotels collection...');
      const batch3 = writeBatch(db);
      DEFAULT_HOTELS.forEach(item => {
        batch3.set(doc(db, 'hotels', item.id), item, { merge: true });
      });
      await batch3.commit();
    }

    const promotionsSnap = await getDocs(collection(db, 'promotions'));
    if (promotionsSnap.empty) {
      console.log('Seeding promotions collection...');
      const batch4 = writeBatch(db);
      DEFAULT_PROMOTIONS.forEach(item => {
        batch4.set(doc(db, 'promotions', item.id), item, { merge: true });
      });
      await batch4.commit();
    }

    const swipeSnap = await getDocs(collection(db, 'swipe_items'));
    if (swipeSnap.empty) {
      console.log('Seeding swipe pool collection...');
      const batch5 = writeBatch(db);
      DEFAULT_SWIPE_DECK.forEach(item => {
        batch5.set(doc(db, 'swipe_items', item.id), item, { merge: true });
      });
      await batch5.commit();
    }

    const txSnap = await getDocs(collection(db, 'transactions'));
    if (txSnap.empty) {
      console.log('Seeding transaction log history...');
      const batch6 = writeBatch(db);
      DEFAULT_TRANSACTIONS.forEach(item => {
        batch6.set(doc(db, 'transactions', item.id), item, { merge: true });
      });
      await batch6.commit();
    }

    console.log('Database seeding verified.');
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}
