/**
 * Base de datos de códigos postales de China (邮政编码)
 * Sistema de 6 dígitos:
 *   - Dígitos 1-2: Provincia/Municipio
 *   - Dígitos 3-4: Ciudad/Prefectura
 *   - Dígitos 5-6: Zona de entrega
 */

export interface ZonaPostal {
  provincia: string;
  provinciaZh: string;
  tipo: "municipio" | "provincia" | "region_autonoma";
  ciudad?: string;
  ciudadZh?: string;
  distrito?: string;
}

// Coordenadas de referencia para cálculo de distancias
export const GUANGZHOU_COORDS = { lat: 23.1291, lng: 113.2644 };
export const YIWU_COORDS = { lat: 29.3074, lng: 120.0750 };

/** Calcula distancia en km entre dos coordenadas usando la fórmula de Haversine */
export function calcularDistanciaKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// ─── Provincias por primeros 2 dígitos ────────────────────────────────────────
const PROVINCIAS: Record<string, Omit<ZonaPostal, "ciudad" | "ciudadZh">> = {
  "01": { provincia: "Mongolia Interior",  provinciaZh: "内蒙古自治区", tipo: "region_autonoma" },
  "02": { provincia: "Mongolia Interior",  provinciaZh: "内蒙古自治区", tipo: "region_autonoma" },
  "03": { provincia: "Shanxi",             provinciaZh: "山西省",       tipo: "provincia" },
  "04": { provincia: "Shanxi",             provinciaZh: "山西省",       tipo: "provincia" },
  "05": { provincia: "Hebei",              provinciaZh: "河北省",       tipo: "provincia" },
  "06": { provincia: "Hebei",              provinciaZh: "河北省",       tipo: "provincia" },
  "07": { provincia: "Hebei",              provinciaZh: "河北省",       tipo: "provincia" },
  "10": { provincia: "Pekín",              provinciaZh: "北京市",       tipo: "municipio" },
  "11": { provincia: "Liaoning",           provinciaZh: "辽宁省",       tipo: "provincia" },
  "12": { provincia: "Liaoning",           provinciaZh: "辽宁省",       tipo: "provincia" },
  "13": { provincia: "Jilin",              provinciaZh: "吉林省",       tipo: "provincia" },
  "15": { provincia: "Heilongjiang",       provinciaZh: "黑龙江省",     tipo: "provincia" },
  "16": { provincia: "Heilongjiang",       provinciaZh: "黑龙江省",     tipo: "provincia" },
  "20": { provincia: "Shanghái",           provinciaZh: "上海市",       tipo: "municipio" },
  "21": { provincia: "Jiangsu",            provinciaZh: "江苏省",       tipo: "provincia" },
  "22": { provincia: "Jiangsu",            provinciaZh: "江苏省",       tipo: "provincia" },
  "23": { provincia: "Anhui",              provinciaZh: "安徽省",       tipo: "provincia" },
  "24": { provincia: "Anhui",              provinciaZh: "安徽省",       tipo: "provincia" },
  "25": { provincia: "Shandong",           provinciaZh: "山东省",       tipo: "provincia" },
  "26": { provincia: "Shandong",           provinciaZh: "山东省",       tipo: "provincia" },
  "27": { provincia: "Shandong",           provinciaZh: "山东省",       tipo: "provincia" },
  "30": { provincia: "Tianjin",            provinciaZh: "天津市",       tipo: "municipio" },
  "31": { provincia: "Zhejiang",           provinciaZh: "浙江省",       tipo: "provincia" },
  "32": { provincia: "Zhejiang",           provinciaZh: "浙江省",       tipo: "provincia" },
  "33": { provincia: "Jiangxi",            provinciaZh: "江西省",       tipo: "provincia" },
  "34": { provincia: "Jiangxi",            provinciaZh: "江西省",       tipo: "provincia" },
  "35": { provincia: "Fujian",             provinciaZh: "福建省",       tipo: "provincia" },
  "36": { provincia: "Fujian",             provinciaZh: "福建省",       tipo: "provincia" },
  "40": { provincia: "Chongqing",          provinciaZh: "重庆市",       tipo: "municipio" },
  "41": { provincia: "Hunan",              provinciaZh: "湖南省",       tipo: "provincia" },
  "42": { provincia: "Hunan",              provinciaZh: "湖南省",       tipo: "provincia" },
  "43": { provincia: "Hubei",              provinciaZh: "湖北省",       tipo: "provincia" },
  "44": { provincia: "Hubei",              provinciaZh: "湖北省",       tipo: "provincia" },
  "45": { provincia: "Henan",              provinciaZh: "河南省",       tipo: "provincia" },
  "46": { provincia: "Henan",              provinciaZh: "河南省",       tipo: "provincia" },
  "47": { provincia: "Henan",              provinciaZh: "河南省",       tipo: "provincia" },
  "51": { provincia: "Guangdong",          provinciaZh: "广东省",       tipo: "provincia" },
  "52": { provincia: "Guangdong",          provinciaZh: "广东省",       tipo: "provincia" },
  "53": { provincia: "Guangxi",            provinciaZh: "广西壮族自治区", tipo: "region_autonoma" },
  "54": { provincia: "Guangxi",            provinciaZh: "广西壮族自治区", tipo: "region_autonoma" },
  "55": { provincia: "Guizhou",            provinciaZh: "贵州省",       tipo: "provincia" },
  "57": { provincia: "Hainan",             provinciaZh: "海南省",       tipo: "provincia" },
  "61": { provincia: "Sichuan",            provinciaZh: "四川省",       tipo: "provincia" },
  "62": { provincia: "Sichuan",            provinciaZh: "四川省",       tipo: "provincia" },
  "63": { provincia: "Sichuan",            provinciaZh: "四川省",       tipo: "provincia" },
  "64": { provincia: "Sichuan",            provinciaZh: "四川省",       tipo: "provincia" },
  "65": { provincia: "Yunnan",             provinciaZh: "云南省",       tipo: "provincia" },
  "66": { provincia: "Yunnan",             provinciaZh: "云南省",       tipo: "provincia" },
  "67": { provincia: "Yunnan",             provinciaZh: "云南省",       tipo: "provincia" },
  "71": { provincia: "Shaanxi",            provinciaZh: "陕西省",       tipo: "provincia" },
  "72": { provincia: "Shaanxi",            provinciaZh: "陕西省",       tipo: "provincia" },
  "73": { provincia: "Gansu",              provinciaZh: "甘肃省",       tipo: "provincia" },
  "74": { provincia: "Gansu",              provinciaZh: "甘肃省",       tipo: "provincia" },
  "75": { provincia: "Ningxia",            provinciaZh: "宁夏回族自治区", tipo: "region_autonoma" },
  "81": { provincia: "Qinghai",            provinciaZh: "青海省",       tipo: "provincia" },
  "83": { provincia: "Xinjiang",           provinciaZh: "新疆维吾尔自治区", tipo: "region_autonoma" },
  "84": { provincia: "Xinjiang",           provinciaZh: "新疆维吾尔自治区", tipo: "region_autonoma" },
  "85": { provincia: "Tíbet",              provinciaZh: "西藏自治区",   tipo: "region_autonoma" },
  "86": { provincia: "Tíbet",              provinciaZh: "西藏自治区",   tipo: "region_autonoma" },
};

// ─── Ciudades por primeros 4 dígitos ─────────────────────────────────────────
const CIUDADES: Record<string, { ciudad: string; ciudadZh: string }> = {
  // Beijing
  "1000": { ciudad: "Pekín",        ciudadZh: "北京" },
  "1010": { ciudad: "Pekín",        ciudadZh: "北京" },
  "1020": { ciudad: "Pekín",        ciudadZh: "北京" },
  // Tianjin
  "3000": { ciudad: "Tianjin",      ciudadZh: "天津" },
  "3010": { ciudad: "Tianjin",      ciudadZh: "天津" },
  // Shanghai
  "2000": { ciudad: "Shanghái",     ciudadZh: "上海" },
  "2010": { ciudad: "Shanghái",     ciudadZh: "上海" },
  // Chongqing
  "4000": { ciudad: "Chongqing",    ciudadZh: "重庆" },
  "4010": { ciudad: "Chongqing",    ciudadZh: "重庆" },
  "4020": { ciudad: "Chongqing",    ciudadZh: "重庆" },
  "4040": { ciudad: "Chongqing",    ciudadZh: "重庆" },
  "4080": { ciudad: "Chongqing",    ciudadZh: "重庆" },
  // Guangdong
  "5100": { ciudad: "Guangzhou",    ciudadZh: "广州" },
  "5101": { ciudad: "Guangzhou",    ciudadZh: "广州" },
  "5102": { ciudad: "Guangzhou",    ciudadZh: "广州" },
  "5103": { ciudad: "Guangzhou",    ciudadZh: "广州" },
  "5110": { ciudad: "Guangzhou",    ciudadZh: "广州" },
  "5120": { ciudad: "Shaoguan",     ciudadZh: "韶关" },
  "5130": { ciudad: "Shenzhen",     ciudadZh: "深圳" },
  "5140": { ciudad: "Meizhou",      ciudadZh: "梅州" },
  "5150": { ciudad: "Shantou",      ciudadZh: "汕头" },
  "5160": { ciudad: "Huizhou",      ciudadZh: "惠州" },
  "5170": { ciudad: "Shanwei",      ciudadZh: "汕尾" },
  "5180": { ciudad: "Shenzhen",     ciudadZh: "深圳" },
  "5190": { ciudad: "Zhuhai",       ciudadZh: "珠海" },
  "5200": { ciudad: "Jieyang",      ciudadZh: "揭阳" },
  "5210": { ciudad: "Foshan",       ciudadZh: "佛山" },
  "5220": { ciudad: "Heyuan",       ciudadZh: "河源" },
  "5230": { ciudad: "Dongguan",     ciudadZh: "东莞" },
  "5240": { ciudad: "Zhanjiang",    ciudadZh: "湛江" },
  "5250": { ciudad: "Maoming",      ciudadZh: "茂名" },
  "5260": { ciudad: "Zhaoqing",     ciudadZh: "肇庆" },
  "5270": { ciudad: "Chaozhou",     ciudadZh: "潮州" },
  "5280": { ciudad: "Foshan",       ciudadZh: "佛山" },
  "5281": { ciudad: "Foshan",       ciudadZh: "佛山" },
  "5282": { ciudad: "Zhongshan",    ciudadZh: "中山" },
  "5283": { ciudad: "Zhongshan",    ciudadZh: "中山" },
  "5284": { ciudad: "Zhongshan",    ciudadZh: "中山" },
  "5290": { ciudad: "Jiangmen",     ciudadZh: "江门" },
  "5295": { ciudad: "Yangjiang",    ciudadZh: "阳江" },
  "5298": { ciudad: "Yunfu",        ciudadZh: "云浮" },
  // Guangxi
  "5300": { ciudad: "Nanning",      ciudadZh: "南宁" },
  "5310": { ciudad: "Nanning",      ciudadZh: "南宁" },
  "5350": { ciudad: "Liuzhou",      ciudadZh: "柳州" },
  "5410": { ciudad: "Guilin",       ciudadZh: "桂林" },
  "5360": { ciudad: "Guilin",       ciudadZh: "桂林" },
  "5370": { ciudad: "Wuzhou",       ciudadZh: "梧州" },
  // Hainan
  "5700": { ciudad: "Haikou",       ciudadZh: "海口" },
  "5710": { ciudad: "Haikou",       ciudadZh: "海口" },
  "5720": { ciudad: "Sanya",        ciudadZh: "三亚" },
  // Zhejiang
  "3100": { ciudad: "Hangzhou",     ciudadZh: "杭州" },
  "3101": { ciudad: "Hangzhou",     ciudadZh: "杭州" },
  "3102": { ciudad: "Hangzhou",     ciudadZh: "杭州" },
  "3110": { ciudad: "Hangzhou",     ciudadZh: "杭州" },
  "3120": { ciudad: "Ningbo",       ciudadZh: "宁波" },
  "3150": { ciudad: "Ningbo",       ciudadZh: "宁波" },
  "3160": { ciudad: "Wenzhou",      ciudadZh: "温州" },
  "3250": { ciudad: "Wenzhou",      ciudadZh: "温州" },
  "3140": { ciudad: "Jiaxing",      ciudadZh: "嘉兴" },
  "3130": { ciudad: "Huzhou",       ciudadZh: "湖州" },
  "3210": { ciudad: "Shaoxing",     ciudadZh: "绍兴" },
  "3220": { ciudad: "Jinhua",       ciudadZh: "金华" },
  "3221": { ciudad: "Yiwu",         ciudadZh: "义乌" },
  "3222": { ciudad: "Yiwu",         ciudadZh: "义乌" },
  "3240": { ciudad: "Quzhou",       ciudadZh: "衢州" },
  "3170": { ciudad: "Zhoushan",     ciudadZh: "舟山" },
  "3180": { ciudad: "Taizhou",      ciudadZh: "台州" },
  "3230": { ciudad: "Lishui",       ciudadZh: "丽水" },
  // Jiangsu
  "2100": { ciudad: "Nanjing",      ciudadZh: "南京" },
  "2101": { ciudad: "Nanjing",      ciudadZh: "南京" },
  "2102": { ciudad: "Nanjing",      ciudadZh: "南京" },
  "2140": { ciudad: "Wuxi",         ciudadZh: "无锡" },
  "2150": { ciudad: "Suzhou",       ciudadZh: "苏州" },
  "2151": { ciudad: "Suzhou",       ciudadZh: "苏州" },
  "2152": { ciudad: "Suzhou",       ciudadZh: "苏州" },
  "2160": { ciudad: "Nantong",      ciudadZh: "南通" },
  "2130": { ciudad: "Changzhou",    ciudadZh: "常州" },
  "2238": { ciudad: "Suqian",       ciudadZh: "宿迁" },
  "2210": { ciudad: "Xuzhou",       ciudadZh: "徐州" },
  "2220": { ciudad: "Lianyungang",  ciudadZh: "连云港" },
  "2230": { ciudad: "Huaian",       ciudadZh: "淮安" },
  "2240": { ciudad: "Yancheng",     ciudadZh: "盐城" },
  "2250": { ciudad: "Yangzhou",     ciudadZh: "扬州" },
  "2120": { ciudad: "Zhenjiang",    ciudadZh: "镇江" },
  "2260": { ciudad: "Taizhou",      ciudadZh: "泰州" },
  // Shandong
  "2500": { ciudad: "Jinan",        ciudadZh: "济南" },
  "2501": { ciudad: "Jinan",        ciudadZh: "济南" },
  "2502": { ciudad: "Jinan",        ciudadZh: "济南" },
  "2550": { ciudad: "Zibo",         ciudadZh: "淄博" },
  "2610": { ciudad: "Weifang",      ciudadZh: "潍坊" },
  "2620": { ciudad: "Weifang",      ciudadZh: "潍坊" },
  "2630": { ciudad: "Yantai",       ciudadZh: "烟台" },
  "2640": { ciudad: "Yantai",       ciudadZh: "烟台" },
  "2645": { ciudad: "Weihai",       ciudadZh: "威海" },
  "2660": { ciudad: "Qingdao",      ciudadZh: "青岛" },
  "2661": { ciudad: "Qingdao",      ciudadZh: "青岛" },
  "2662": { ciudad: "Qingdao",      ciudadZh: "青岛" },
  "2710": { ciudad: "Taian",        ciudadZh: "泰安" },
  "2720": { ciudad: "Jining",       ciudadZh: "济宁" },
  "2730": { ciudad: "Jining",       ciudadZh: "济宁" },
  "2740": { ciudad: "Heze",         ciudadZh: "菏泽" },
  "2760": { ciudad: "Linyi",        ciudadZh: "临沂" },
  "2520": { ciudad: "Liaocheng",    ciudadZh: "聊城" },
  "2530": { ciudad: "Dezhou",       ciudadZh: "德州" },
  "2560": { ciudad: "Binzhou",      ciudadZh: "滨州" },
  "2570": { ciudad: "Dongying",     ciudadZh: "东营" },
  "2580": { ciudad: "Rizhao",       ciudadZh: "日照" },
  "2700": { ciudad: "Zaozhuang",    ciudadZh: "枣庄" },
  "2770": { ciudad: "Zaozhuang",    ciudadZh: "枣庄" },
  // Anhui
  "2300": { ciudad: "Hefei",        ciudadZh: "合肥" },
  "2301": { ciudad: "Hefei",        ciudadZh: "合肥" },
  "2310": { ciudad: "Hefei",        ciudadZh: "合肥" },
  "2320": { ciudad: "Wuhu",         ciudadZh: "芜湖" },
  "2330": { ciudad: "Bengbu",       ciudadZh: "蚌埠" },
  "2340": { ciudad: "Huainan",      ciudadZh: "淮南" },
  "2350": { ciudad: "Maanshan",     ciudadZh: "马鞍山" },
  "2410": { ciudad: "Anqing",       ciudadZh: "安庆" },
  "2420": { ciudad: "Huangshan",    ciudadZh: "黄山" },
  "2430": { ciudad: "Fuyang",       ciudadZh: "阜阳" },
  // Fujian
  "3500": { ciudad: "Fuzhou",       ciudadZh: "福州" },
  "3501": { ciudad: "Fuzhou",       ciudadZh: "福州" },
  "3502": { ciudad: "Fuzhou",       ciudadZh: "福州" },
  "3510": { ciudad: "Fuzhou",       ciudadZh: "福州" },
  "3610": { ciudad: "Xiamen",       ciudadZh: "厦门" },
  "3620": { ciudad: "Quanzhou",     ciudadZh: "泉州" },
  "3630": { ciudad: "Zhangzhou",    ciudadZh: "漳州" },
  "3530": { ciudad: "Putian",       ciudadZh: "莆田" },
  "3540": { ciudad: "Sanming",      ciudadZh: "三明" },
  "3550": { ciudad: "Nanping",      ciudadZh: "南平" },
  "3560": { ciudad: "Longyan",      ciudadZh: "龙岩" },
  "3520": { ciudad: "Ningde",       ciudadZh: "宁德" },
  // Jiangxi
  "3300": { ciudad: "Nanchang",     ciudadZh: "南昌" },
  "3301": { ciudad: "Nanchang",     ciudadZh: "南昌" },
  "3310": { ciudad: "Nanchang",     ciudadZh: "南昌" },
  "3320": { ciudad: "Jiujiang",     ciudadZh: "九江" },
  "3330": { ciudad: "Jingdezhen",   ciudadZh: "景德镇" },
  "3340": { ciudad: "Pingxiang",    ciudadZh: "萍乡" },
  "3350": { ciudad: "Xinyu",        ciudadZh: "新余" },
  "3360": { ciudad: "Yingtan",      ciudadZh: "鹰潭" },
  "3410": { ciudad: "Ganzhou",      ciudadZh: "赣州" },
  "3430": { ciudad: "Jian",         ciudadZh: "吉安" },
  "3440": { ciudad: "Fuzhou",       ciudadZh: "抚州" },
  "3450": { ciudad: "Shangrao",     ciudadZh: "上饶" },
  // Liaoning
  "1100": { ciudad: "Shenyang",     ciudadZh: "沈阳" },
  "1101": { ciudad: "Shenyang",     ciudadZh: "沈阳" },
  "1102": { ciudad: "Shenyang",     ciudadZh: "沈阳" },
  "1160": { ciudad: "Dalian",       ciudadZh: "大连" },
  "1161": { ciudad: "Dalian",       ciudadZh: "大连" },
  "1162": { ciudad: "Dalian",       ciudadZh: "大连" },
  "1120": { ciudad: "Anshan",       ciudadZh: "鞍山" },
  "1130": { ciudad: "Fushun",       ciudadZh: "抚顺" },
  "1140": { ciudad: "Benxi",        ciudadZh: "本溪" },
  "1150": { ciudad: "Dandong",      ciudadZh: "丹东" },
  "1210": { ciudad: "Jinzhou",      ciudadZh: "锦州" },
  "1220": { ciudad: "Yingkou",      ciudadZh: "营口" },
  "1230": { ciudad: "Fuxin",        ciudadZh: "阜新" },
  "1110": { ciudad: "Liaoyang",     ciudadZh: "辽阳" },
  "1240": { ciudad: "Panjin",       ciudadZh: "盘锦" },
  "1250": { ciudad: "Tieling",      ciudadZh: "铁岭" },
  // Jilin
  "1300": { ciudad: "Changchun",    ciudadZh: "长春" },
  "1301": { ciudad: "Changchun",    ciudadZh: "长春" },
  "1310": { ciudad: "Changchun",    ciudadZh: "长春" },
  "1320": { ciudad: "Jilin",        ciudadZh: "吉林" },
  "1330": { ciudad: "Jilin",        ciudadZh: "吉林" },
  "1350": { ciudad: "Yanbian",      ciudadZh: "延边" },
  "1360": { ciudad: "Tonghua",      ciudadZh: "通化" },
  "1370": { ciudad: "Baishan",      ciudadZh: "白山" },
  "1380": { ciudad: "Songyuan",     ciudadZh: "松原" },
  // Heilongjiang
  "1500": { ciudad: "Harbin",       ciudadZh: "哈尔滨" },
  "1501": { ciudad: "Harbin",       ciudadZh: "哈尔滨" },
  "1502": { ciudad: "Harbin",       ciudadZh: "哈尔滨" },
  "1510": { ciudad: "Harbin",       ciudadZh: "哈尔滨" },
  "1520": { ciudad: "Qiqihar",      ciudadZh: "齐齐哈尔" },
  "1530": { ciudad: "Daqing",       ciudadZh: "大庆" },
  "1540": { ciudad: "Jixi",         ciudadZh: "鸡西" },
  "1550": { ciudad: "Hegang",       ciudadZh: "鹤岗" },
  "1560": { ciudad: "Shuangyashan", ciudadZh: "双鸭山" },
  "1570": { ciudad: "Jiamusi",      ciudadZh: "佳木斯" },
  "1580": { ciudad: "Mudanjiang",   ciudadZh: "牡丹江" },
  // Hebei
  "0500": { ciudad: "Shijiazhuang", ciudadZh: "石家庄" },
  "0501": { ciudad: "Shijiazhuang", ciudadZh: "石家庄" },
  "0502": { ciudad: "Shijiazhuang", ciudadZh: "石家庄" },
  "0530": { ciudad: "Hengshui",     ciudadZh: "衡水" },
  "0540": { ciudad: "Xingtai",      ciudadZh: "邢台" },
  "0550": { ciudad: "Xingtai",      ciudadZh: "邢台" },
  "0560": { ciudad: "Handan",       ciudadZh: "邯郸" },
  "0570": { ciudad: "Handan",       ciudadZh: "邯郸" },
  "0610": { ciudad: "Cangzhou",     ciudadZh: "沧州" },
  "0620": { ciudad: "Cangzhou",     ciudadZh: "沧州" },
  "0630": { ciudad: "Tangshan",     ciudadZh: "唐山" },
  "0640": { ciudad: "Tangshan",     ciudadZh: "唐山" },
  "0650": { ciudad: "Langfang",     ciudadZh: "廊坊" },
  "0660": { ciudad: "Qinhuangdao",  ciudadZh: "秦皇岛" },
  "0670": { ciudad: "Chengde",      ciudadZh: "承德" },
  "0680": { ciudad: "Chengde",      ciudadZh: "承德" },
  "0710": { ciudad: "Baoding",      ciudadZh: "保定" },
  "0720": { ciudad: "Baoding",      ciudadZh: "保定" },
  "0750": { ciudad: "Zhangjiakou",  ciudadZh: "张家口" },
  // Shanxi
  "0300": { ciudad: "Taiyuan",      ciudadZh: "太原" },
  "0301": { ciudad: "Taiyuan",      ciudadZh: "太原" },
  "0302": { ciudad: "Taiyuan",      ciudadZh: "太原" },
  "0310": { ciudad: "Taiyuan",      ciudadZh: "太原" },
  "0460": { ciudad: "Datong",       ciudadZh: "大同" },
  "0440": { ciudad: "Jinzhong",     ciudadZh: "晋中" },
  "0450": { ciudad: "Yangquan",     ciudadZh: "阳泉" },
  "0420": { ciudad: "Changzhi",     ciudadZh: "长治" },
  "0480": { ciudad: "Linfen",       ciudadZh: "临汾" },
  "0430": { ciudad: "Jincheng",     ciudadZh: "晋城" },
  "0470": { ciudad: "Lvliang",      ciudadZh: "吕梁" },
  // Inner Mongolia
  "0100": { ciudad: "Hohhot",       ciudadZh: "呼和浩特" },
  "0101": { ciudad: "Hohhot",       ciudadZh: "呼和浩特" },
  "0110": { ciudad: "Baotou",       ciudadZh: "包头" },
  "0120": { ciudad: "Wulanchabu",   ciudadZh: "乌兰察布" },
  "0130": { ciudad: "Chifeng",      ciudadZh: "赤峰" },
  "0210": { ciudad: "Tongliao",     ciudadZh: "通辽" },
  "0220": { ciudad: "Hulunbuir",    ciudadZh: "呼伦贝尔" },
  "0260": { ciudad: "Ordo",         ciudadZh: "鄂尔多斯" },
  // Sichuan
  "6100": { ciudad: "Chengdu",      ciudadZh: "成都" },
  "6101": { ciudad: "Chengdu",      ciudadZh: "成都" },
  "6102": { ciudad: "Chengdu",      ciudadZh: "成都" },
  "6103": { ciudad: "Chengdu",      ciudadZh: "成都" },
  "6110": { ciudad: "Chengdu",      ciudadZh: "成都" },
  "6120": { ciudad: "Mianyang",     ciudadZh: "绵阳" },
  "6130": { ciudad: "Deyang",       ciudadZh: "德阳" },
  "6140": { ciudad: "Guangyuan",    ciudadZh: "广元" },
  "6150": { ciudad: "Suining",      ciudadZh: "遂宁" },
  "6160": { ciudad: "Nanchong",     ciudadZh: "南充" },
  "6170": { ciudad: "Dazhou",       ciudadZh: "达州" },
  "6180": { ciudad: "Guangan",      ciudadZh: "广安" },
  "6200": { ciudad: "Zigong",       ciudadZh: "自贡" },
  "6430": { ciudad: "Panzhihua",    ciudadZh: "攀枝花" },
  "6210": { ciudad: "Yibin",        ciudadZh: "宜宾" },
  "6440": { ciudad: "Meishan",      ciudadZh: "眉山" },
  "6250": { ciudad: "Leshan",       ciudadZh: "乐山" },
  "6460": { ciudad: "Yaan",         ciudadZh: "雅安" },
  // Guizhou
  "5500": { ciudad: "Guiyang",      ciudadZh: "贵阳" },
  "5501": { ciudad: "Guiyang",      ciudadZh: "贵阳" },
  "5510": { ciudad: "Guiyang",      ciudadZh: "贵阳" },
  "5520": { ciudad: "Zunyi",        ciudadZh: "遵义" },
  "5530": { ciudad: "Tongren",      ciudadZh: "铜仁" },
  "5540": { ciudad: "Bijie",        ciudadZh: "毕节" },
  "5550": { ciudad: "Anshun",       ciudadZh: "安顺" },
  // Yunnan
  "6500": { ciudad: "Kunming",      ciudadZh: "昆明" },
  "6501": { ciudad: "Kunming",      ciudadZh: "昆明" },
  "6502": { ciudad: "Kunming",      ciudadZh: "昆明" },
  "6510": { ciudad: "Kunming",      ciudadZh: "昆明" },
  "6520": { ciudad: "Qujing",       ciudadZh: "曲靖" },
  "6530": { ciudad: "Yuxi",         ciudadZh: "玉溪" },
  "6540": { ciudad: "Baoshan",      ciudadZh: "保山" },
  "6550": { ciudad: "Zhaotong",     ciudadZh: "昭通" },
  "6710": { ciudad: "Lijiang",      ciudadZh: "丽江" },
  "6720": { ciudad: "Pu'er",        ciudadZh: "普洱" },
  "6770": { ciudad: "Xishuangbanna",ciudadZh: "西双版纳" },
  "6760": { ciudad: "Dali",         ciudadZh: "大理" },
  // Shaanxi
  "7100": { ciudad: "Xi'an",        ciudadZh: "西安" },
  "7101": { ciudad: "Xi'an",        ciudadZh: "西安" },
  "7102": { ciudad: "Xi'an",        ciudadZh: "西安" },
  "7103": { ciudad: "Xi'an",        ciudadZh: "西安" },
  "7110": { ciudad: "Xi'an",        ciudadZh: "西安" },
  "7120": { ciudad: "Xianyang",     ciudadZh: "咸阳" },
  "7130": { ciudad: "Tongchuan",    ciudadZh: "铜川" },
  "7210": { ciudad: "Baoji",        ciudadZh: "宝鸡" },
  "7220": { ciudad: "Weinan",       ciudadZh: "渭南" },
  "7230": { ciudad: "Yan'an",       ciudadZh: "延安" },
  "7240": { ciudad: "Hanzhong",     ciudadZh: "汉中" },
  "7250": { ciudad: "Yulin",        ciudadZh: "榆林" },
  "7260": { ciudad: "Ankang",       ciudadZh: "安康" },
  "7270": { ciudad: "Shangluo",     ciudadZh: "商洛" },
  // Gansu
  "7300": { ciudad: "Lanzhou",      ciudadZh: "兰州" },
  "7301": { ciudad: "Lanzhou",      ciudadZh: "兰州" },
  "7310": { ciudad: "Lanzhou",      ciudadZh: "兰州" },
  "7320": { ciudad: "Tianshui",     ciudadZh: "天水" },
  "7330": { ciudad: "Pingliang",    ciudadZh: "平凉" },
  "7340": { ciudad: "Qingyang",     ciudadZh: "庆阳" },
  "7309": { ciudad: "Baiyin",       ciudadZh: "白银" },
  "7360": { ciudad: "Dingxi",       ciudadZh: "定西" },
  "7370": { ciudad: "Longnan",      ciudadZh: "陇南" },
  "7380": { ciudad: "Wuwei",        ciudadZh: "武威" },
  "7420": { ciudad: "Zhangye",      ciudadZh: "张掖" },
  "7350": { ciudad: "Jiayuguan",    ciudadZh: "嘉峪关" },
  "7400": { ciudad: "Jiuquan",      ciudadZh: "酒泉" },
  // Ningxia
  "7500": { ciudad: "Yinchuan",     ciudadZh: "银川" },
  "7501": { ciudad: "Yinchuan",     ciudadZh: "银川" },
  "7510": { ciudad: "Yinchuan",     ciudadZh: "银川" },
  "7520": { ciudad: "Shizuishan",   ciudadZh: "石嘴山" },
  "7530": { ciudad: "Wuzhong",      ciudadZh: "吴忠" },
  "7540": { ciudad: "Guyuan",       ciudadZh: "固原" },
  "7550": { ciudad: "Zhongwei",     ciudadZh: "中卫" },
  // Qinghai
  "8100": { ciudad: "Xining",       ciudadZh: "西宁" },
  "8101": { ciudad: "Xining",       ciudadZh: "西宁" },
  "8110": { ciudad: "Xining",       ciudadZh: "西宁" },
  "8120": { ciudad: "Haidong",      ciudadZh: "海东" },
  // Xinjiang
  "8300": { ciudad: "Ürümqi",       ciudadZh: "乌鲁木齐" },
  "8301": { ciudad: "Ürümqi",       ciudadZh: "乌鲁木齐" },
  "8302": { ciudad: "Ürümqi",       ciudadZh: "乌鲁木齐" },
  "8310": { ciudad: "Ürümqi",       ciudadZh: "乌鲁木齐" },
  "8320": { ciudad: "Karamay",      ciudadZh: "克拉玛依" },
  "8380": { ciudad: "Turpan",       ciudadZh: "吐鲁番" },
  "8390": { ciudad: "Hami",         ciudadZh: "哈密" },
  "8420": { ciudad: "Kashgar",      ciudadZh: "喀什" },
  "8430": { ciudad: "Hotan",        ciudadZh: "和田" },
  "8440": { ciudad: "Aksu",         ciudadZh: "阿克苏" },
  // Tibet
  "8500": { ciudad: "Lhasa",        ciudadZh: "拉萨" },
  "8501": { ciudad: "Lhasa",        ciudadZh: "拉萨" },
  "8510": { ciudad: "Lhasa",        ciudadZh: "拉萨" },
  "8520": { ciudad: "Shigatse",     ciudadZh: "日喀则" },
  "8560": { ciudad: "Chamdo",       ciudadZh: "昌都" },
  "8600": { ciudad: "Nyingchi",     ciudadZh: "林芝" },
  // Henan
  "4500": { ciudad: "Zhengzhou",    ciudadZh: "郑州" },
  "4501": { ciudad: "Zhengzhou",    ciudadZh: "郑州" },
  "4502": { ciudad: "Zhengzhou",    ciudadZh: "郑州" },
  "4510": { ciudad: "Zhengzhou",    ciudadZh: "郑州" },
  "4520": { ciudad: "Kaifeng",      ciudadZh: "开封" },
  "4710": { ciudad: "Luoyang",      ciudadZh: "洛阳" },
  "4540": { ciudad: "Pingdingshan", ciudadZh: "平顶山" },
  "4550": { ciudad: "Anyang",       ciudadZh: "安阳" },
  "4560": { ciudad: "Hebi",         ciudadZh: "鹤壁" },
  "4530": { ciudad: "Xinxiang",     ciudadZh: "新乡" },
  "4570": { ciudad: "Jiaozuo",      ciudadZh: "焦作" },
  "4750": { ciudad: "Puyang",       ciudadZh: "濮阳" },
  "4610": { ciudad: "Xuchang",      ciudadZh: "许昌" },
  "4620": { ciudad: "Luohe",        ciudadZh: "漯河" },
  "4630": { ciudad: "Sanmenxia",    ciudadZh: "三门峡" },
  "4730": { ciudad: "Nanyang",      ciudadZh: "南阳" },
  "4740": { ciudad: "Xinyang",      ciudadZh: "信阳" },
  "4760": { ciudad: "Zhoukou",      ciudadZh: "周口" },
  "4770": { ciudad: "Zhumadian",    ciudadZh: "驻马店" },
  // Hubei
  "4300": { ciudad: "Wuhan",        ciudadZh: "武汉" },
  "4301": { ciudad: "Wuhan",        ciudadZh: "武汉" },
  "4302": { ciudad: "Wuhan",        ciudadZh: "武汉" },
  "4310": { ciudad: "Wuhan",        ciudadZh: "武汉" },
  "4320": { ciudad: "Huangshi",     ciudadZh: "黄石" },
  "4330": { ciudad: "Yichang",      ciudadZh: "宜昌" },
  "4410": { ciudad: "Xiangyang",    ciudadZh: "襄阳" },
  "4350": { ciudad: "Ezhou",        ciudadZh: "鄂州" },
  "4360": { ciudad: "Jingmen",      ciudadZh: "荆门" },
  "4370": { ciudad: "Xiaogan",      ciudadZh: "孝感" },
  "4340": { ciudad: "Jingzhou",     ciudadZh: "荆州" },
  "4480": { ciudad: "Huanggang",    ciudadZh: "黄冈" },
  "4470": { ciudad: "Xianning",     ciudadZh: "咸宁" },
  "4460": { ciudad: "Suizhou",      ciudadZh: "随州" },
  // Hunan
  "4100": { ciudad: "Changsha",     ciudadZh: "长沙" },
  "4101": { ciudad: "Changsha",     ciudadZh: "长沙" },
  "4102": { ciudad: "Changsha",     ciudadZh: "长沙" },
  "4110": { ciudad: "Changsha",     ciudadZh: "长沙" },
  "4120": { ciudad: "Zhuzhou",      ciudadZh: "株洲" },
  "4130": { ciudad: "Xiangtan",     ciudadZh: "湘潭" },
  "4210": { ciudad: "Hengyang",     ciudadZh: "衡阳" },
  "4220": { ciudad: "Shaoyang",     ciudadZh: "邵阳" },
  "4140": { ciudad: "Yueyang",      ciudadZh: "岳阳" },
  "4150": { ciudad: "Changde",      ciudadZh: "常德" },
  "4160": { ciudad: "Zhangjiajie",  ciudadZh: "张家界" },
  "4230": { ciudad: "Yiyang",       ciudadZh: "益阳" },
  "4240": { ciudad: "Chenzhou",     ciudadZh: "郴州" },
  "4250": { ciudad: "Yongzhou",     ciudadZh: "永州" },
  "4270": { ciudad: "Huaihua",      ciudadZh: "怀化" },
  "4290": { ciudad: "Xiangxi",      ciudadZh: "湘西" },
};

// ─── Distritos por prefijo de 5 dígitos (aproximado) ─────────────────────────
const DISTRITOS: Record<string, string> = {
  // Guangzhou (51)
  "51000": "Yuexiu / Centro",
  "51001": "Yuexiu",
  "51002": "Haizhu",
  "51003": "Liwan",
  "51004": "Tianhe",
  "51005": "Baiyun",
  "51006": "Panyu",
  "51007": "Huangpu",
  "51008": "Huadu",
  "51009": "Zengcheng",
  "51010": "Tianhe",
  "51011": "Tianhe Norte",
  "51012": "Guangzhou Dev. Zone",
  "51013": "Luogang",
  "51014": "Conghua",
  "51015": "Huadu",
  "51016": "Nansha",
  "51018": "Nansha",
  "51019": "Conghua",
  // Shenzhen (518)
  "51800": "Futian",
  "51801": "Luohu",
  "51802": "Nanshan",
  "51803": "Yantian",
  "51804": "Bao'an",
  "51805": "Longhua",
  "51806": "Longgang",
  "51807": "Pingshan",
  "51808": "Guangming",
  "51809": "Dapeng",
  // Dongguan (523)
  "52300": "Guancheng",
  "52301": "Dongcheng",
  "52302": "Nancheng",
  "52306": "Wanjiang",
  "52310": "Tangxia",
  "52313": "Fenggang",
  "52315": "Zhangmutou",
  "52316": "Qingxi",
  "52318": "Dongkeng",
  "52319": "Dalang",
  // Foshan (528)
  "52800": "Chancheng",
  "52801": "Guicheng",
  "52802": "Nanhai",
  "52803": "Shunde",
  "52808": "Sanshui",
  "52809": "Gaoming",
  "52810": "Gaoming",
  "52811": "Nanhai",
  // Zhongshan (528)
  "52840": "Shiqi",
  "52841": "Dongfeng",
  "52845": "Guzhen",
  // Shanghai (200)
  "20000": "Huangpu",
  "20001": "Huangpu",
  "20002": "Yangpu",
  "20003": "Luwan",
  "20004": "Xuhui",
  "20005": "Changning",
  "20006": "Jing'an",
  "20007": "Putuo",
  "20008": "Zhabei",
  "20009": "Hongkou",
  "20010": "Minhang",
  "20011": "Baoshan",
  "20012": "Jiading",
  "20013": "Pudong Nuevo",
  "20015": "Pudong",
  "20016": "Fengxian",
  "20025": "Songjiang",
  "20030": "Jinshan",
  "20040": "Qingpu",
  // Beijing (100)
  "10000": "Dongcheng",
  "10001": "Xicheng",
  "10002": "Xuanwu",
  "10003": "Chongwen",
  "10004": "Chaoyangmen",
  "10005": "Fengtai",
  "10006": "Shijingshan",
  "10007": "Haidian",
  "10008": "Haidian Norte",
  "10009": "Mentougou",
  "10010": "Chaoyang",
  "10011": "Chaoyang Este",
  "10012": "Chaoyang Sur",
  "10013": "Tongzhou",
  "10015": "Shunyi",
  "10017": "Daxing",
  "10018": "Yanqing",
  // Yiwu (322)
  "32200": "Choucheng",
  "32201": "Jiangdong",
  "32202": "Beiyuan",
  "32203": "Futian",
  "32204": "Suxi",
  "32205": "Fotang",
  "32206": "Shangxi",
  // Hangzhou (310)
  "31000": "Shangcheng",
  "31001": "Xiacheng",
  "31002": "Jianggan",
  "31003": "Gongshu",
  "31004": "Xihu",
  "31005": "Binjiang",
  "31006": "Xiaoshan",
  "31007": "Yuhang",
  "31008": "Fuyang",
  "31009": "Lin'an",
  // Wuhan (430)
  "43000": "Jiang'an",
  "43001": "Jianghan",
  "43002": "Qiaokou",
  "43003": "Hanyang",
  "43004": "Wuchang",
  "43005": "Qingshan",
  "43006": "Hongshan",
  "43007": "Dongxihu",
  "43008": "Hannan",
  "43009": "Caidian",
  "43010": "Jiangxia",
  "43011": "Huangpi",
  "43012": "Xinzhou",
  // Chengdu (610)
  "61000": "Jinjiang",
  "61001": "Qingyang",
  "61002": "Jinniu",
  "61003": "Wuhou",
  "61004": "Chenghua",
  "61005": "Longquanyi",
  "61006": "Qingbaijiang",
  "61007": "Xindu",
  "61008": "Wenjiang",
  "61009": "Shuangliu",
  // Xi'an (710)
  "71000": "Beilin",
  "71001": "Lianhu",
  "71002": "Baqiao",
  "71003": "Xincheng",
  "71004": "Yanta",
  "71005": "Yanling",
  "71006": "Weiyang",
  "71007": "Yanliang",
  "71009": "Chang'an",
};

// ─── Coordenadas aproximadas (centroide de ciudad/provincia) ─────────────────
const COORDS_CIUDADES: Record<string, { lat: number; lng: number }> = {
  "北京":   { lat: 39.9042, lng: 116.4074 },
  "上海":   { lat: 31.2304, lng: 121.4737 },
  "天津":   { lat: 39.0842, lng: 117.2010 },
  "重庆":   { lat: 29.5630, lng: 106.5516 },
  "广州":   { lat: 23.1291, lng: 113.2644 },
  "深圳":   { lat: 22.5431, lng: 114.0579 },
  "东莞":   { lat: 23.0207, lng: 113.7519 },
  "佛山":   { lat: 23.0218, lng: 113.1219 },
  "中山":   { lat: 22.5176, lng: 113.3926 },
  "珠海":   { lat: 22.2710, lng: 113.5767 },
  "汕头":   { lat: 23.3535, lng: 116.6820 },
  "韶关":   { lat: 24.8102, lng: 113.5908 },
  "江门":   { lat: 22.5787, lng: 113.0820 },
  "湛江":   { lat: 21.2707, lng: 110.3594 },
  "茂名":   { lat: 21.6630, lng: 110.9252 },
  "肇庆":   { lat: 23.0470, lng: 112.4654 },
  "惠州":   { lat: 23.1115, lng: 114.4152 },
  "梅州":   { lat: 24.2882, lng: 116.1224 },
  "义乌":   { lat: 29.3074, lng: 120.0750 },
  "杭州":   { lat: 30.2741, lng: 120.1551 },
  "宁波":   { lat: 29.8683, lng: 121.5440 },
  "温州":   { lat: 28.0002, lng: 120.6720 },
  "金华":   { lat: 29.0790, lng: 119.6479 },
  "嘉兴":   { lat: 30.7522, lng: 120.7556 },
  "湖州":   { lat: 30.8926, lng: 120.0869 },
  "绍兴":   { lat: 30.0302, lng: 120.5800 },
  "衢州":   { lat: 28.9359, lng: 118.8591 },
  "舟山":   { lat: 29.9858, lng: 122.2034 },
  "台州":   { lat: 28.6562, lng: 121.4213 },
  "丽水":   { lat: 28.4680, lng: 119.9219 },
  "南京":   { lat: 32.0603, lng: 118.7969 },
  "苏州":   { lat: 31.2990, lng: 120.5853 },
  "无锡":   { lat: 31.5692, lng: 120.2989 },
  "常州":   { lat: 31.7779, lng: 119.9742 },
  "南通":   { lat: 31.9797, lng: 120.8944 },
  "扬州":   { lat: 32.3941, lng: 119.4130 },
  "武汉":   { lat: 30.5928, lng: 114.3055 },
  "长沙":   { lat: 28.2278, lng: 112.9388 },
  "成都":   { lat: 30.5723, lng: 104.0665 },
  "西安":   { lat: 34.3416, lng: 108.9398 },
  "郑州":   { lat: 34.7466, lng: 113.6254 },
  "沈阳":   { lat: 41.8057, lng: 123.4315 },
  "哈尔滨": { lat: 45.8038, lng: 126.5350 },
  "长春":   { lat: 43.8171, lng: 125.3235 },
  "济南":   { lat: 36.6512, lng: 117.1201 },
  "青岛":   { lat: 36.0671, lng: 120.3826 },
  "福州":   { lat: 26.0745, lng: 119.2965 },
  "厦门":   { lat: 24.4798, lng: 118.0894 },
  "南昌":   { lat: 28.6820, lng: 115.8579 },
  "合肥":   { lat: 31.8206, lng: 117.2272 },
  "南宁":   { lat: 22.8170, lng: 108.3665 },
  "昆明":   { lat: 25.0453, lng: 102.7100 },
  "贵阳":   { lat: 26.6470, lng: 106.6302 },
  "乌鲁木齐": { lat: 43.8256, lng: 87.6168 },
  "拉萨":   { lat: 29.6500, lng: 91.1000 },
  "银川":   { lat: 38.4872, lng: 106.2309 },
  "西宁":   { lat: 36.6171, lng: 101.7782 },
  "兰州":   { lat: 36.0611, lng: 103.8343 },
  "海口":   { lat: 20.0444, lng: 110.3198 },
};

const COORDS_PROVINCIAS: Record<string, { lat: number; lng: number }> = {
  "北京市":       { lat: 39.9042, lng: 116.4074 },
  "上海市":       { lat: 31.2304, lng: 121.4737 },
  "天津市":       { lat: 39.0842, lng: 117.2010 },
  "重庆市":       { lat: 29.5630, lng: 106.5516 },
  "广东省":       { lat: 23.1291, lng: 113.2644 },
  "浙江省":       { lat: 30.2741, lng: 120.1551 },
  "江苏省":       { lat: 32.0603, lng: 118.7969 },
  "山东省":       { lat: 36.6512, lng: 117.1201 },
  "河南省":       { lat: 34.7466, lng: 113.6254 },
  "湖北省":       { lat: 30.5928, lng: 114.3055 },
  "湖南省":       { lat: 28.2278, lng: 112.9388 },
  "四川省":       { lat: 30.5723, lng: 104.0665 },
  "福建省":       { lat: 26.0745, lng: 119.2965 },
  "安徽省":       { lat: 31.8206, lng: 117.2272 },
  "江西省":       { lat: 28.6820, lng: 115.8579 },
  "陕西省":       { lat: 34.3416, lng: 108.9398 },
  "辽宁省":       { lat: 41.8057, lng: 123.4315 },
  "黑龙江省":     { lat: 45.8038, lng: 126.5350 },
  "吉林省":       { lat: 43.8171, lng: 125.3235 },
  "河北省":       { lat: 38.0428, lng: 114.5149 },
  "山西省":       { lat: 37.8736, lng: 112.5490 },
  "广西壮族自治区": { lat: 22.8170, lng: 108.3665 },
  "云南省":       { lat: 25.0453, lng: 102.7100 },
  "贵州省":       { lat: 26.6470, lng: 106.6302 },
  "甘肃省":       { lat: 36.0611, lng: 103.8343 },
  "内蒙古自治区": { lat: 40.8183, lng: 111.7655 },
  "新疆维吾尔自治区": { lat: 43.8256, lng: 87.6168 },
  "西藏自治区":   { lat: 29.6500, lng: 91.1000 },
  "宁夏回族自治区": { lat: 38.4872, lng: 106.2309 },
  "青海省":       { lat: 36.6171, lng: 101.7782 },
  "海南省":       { lat: 20.0444, lng: 110.3198 },
};

/** Devuelve coordenadas aproximadas para una zona postal */
export function getCoordsParaZona(zona: ZonaPostal): { lat: number; lng: number } | null {
  if (zona.ciudadZh && COORDS_CIUDADES[zona.ciudadZh]) {
    return COORDS_CIUDADES[zona.ciudadZh];
  }
  if (zona.provinciaZh && COORDS_PROVINCIAS[zona.provinciaZh]) {
    return COORDS_PROVINCIAS[zona.provinciaZh];
  }
  return null;
}

// ─── Funciones de consulta ────────────────────────────────────────────────────

/**
 * Busca la información geográfica a partir de un código postal (o prefijo).
 * - Con 2+ dígitos: detecta la provincia
 * - Con 4+ dígitos: detecta además la ciudad
 */
export function buscarCodigoPostal(codigo: string): ZonaPostal | null {
  const clean = codigo.replace(/\D/g, "");
  if (clean.length < 2) return null;

  const prov = PROVINCIAS[clean.slice(0, 2)];
  if (!prov) return null;

  const base: ZonaPostal = { ...prov };

  // Para municipios directos (Beijing, Shanghai, Tianjin, Chongqing),
  // la ciudad es el mismo que la provincia
  if (prov.tipo === "municipio") {
    base.ciudad = prov.provincia;
    base.ciudadZh = prov.provinciaZh.replace(/市$/, "");
  }

  if (clean.length >= 4) {
    const ciudad = CIUDADES[clean.slice(0, 4)];
    if (ciudad) {
      base.ciudad = ciudad.ciudad;
      base.ciudadZh = ciudad.ciudadZh;
    }
  }

  if (clean.length >= 5) {
    const dist = DISTRITOS[clean.slice(0, 5)];
    if (dist) {
      base.distrito = dist;
    }
  }

  return base;
}

/** Valida que el código postal sea exactamente 6 dígitos y tenga provincia conocida */
export function validarCodigoPostal(codigo: string): string | null {
  const clean = codigo.replace(/\D/g, "");
  if (clean.length !== 6) return "El código postal de China tiene 6 dígitos";
  const zona = buscarCodigoPostal(clean);
  if (!zona) return "Código postal no reconocido";
  return null;
}

/** Devuelve el ícono de tipo para mostrar en la UI */
export function tipoLabel(tipo: ZonaPostal["tipo"]): string {
  const map = {
    municipio: "Municipio directo",
    provincia: "Provincia",
    region_autonoma: "Región autónoma",
  };
  return map[tipo];
}
