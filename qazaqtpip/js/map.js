document.addEventListener("DOMContentLoaded", () => {
  console.log("🗺️ Инициализация карты...");
  
  let map = L.map("map").setView([48, 67], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);

  // Все локации
  const locations = [
    {title:"Бурабай", lat:53.082337, lng:70.306888, desc:"Озёра и леса", type:"nature"},
    {title:"Алаколь", lat:46.081111, lng:81.764167, desc:"Лечебное озеро", type:"nature"},
    {title:"Шымбулак", lat:43.128269, lng:77.081425, desc:"Горный курорт", type:"nature"},
    {title:"Кольсайские озёра", lat:42.936145, lng:78.324983, desc:"Горные озёра", type:"nature"},
    {title:"Чарынский каньон", lat:43.379167, lng:79.123333, desc:"Каньон", type:"nature"},
    {title:"Каспийское море", lat:41.777000, lng:50.759000, desc:"Море", type:"nature"},
    {title:"Бозжыра", lat:43.413967, lng:54.073425, desc:"Скалы и пустыня", type:"nature"},
    {title:"Балхаш", lat:46.467723, lng:76.187440, desc:"Большое озеро", type:"nature"},
    {title:"Байконур", lat:45.858920, lng:63.313350, desc:"Космодром", type:"nature"},
    {title:"Медео", lat:43.157500, lng:77.058611, desc:"Высокогорный каток", type:"nature"},
    {title:"Маркаколь", lat:48.745823, lng:85.760390, desc:"Дикая природа", type:"nature"},
    {title:"Устюрт", lat:43.833333, lng:55.266667, desc:"Плато", type:"nature"},
    {title:"Каркаралы", lat:49.405833, lng:75.474167, desc:"Горы и лес", type:"nature"},
    {title:"Зайсан", lat:48.013436, lng:83.860912, desc:"Озеро", type:"nature"},
    {title:"Резиденция Абылай хана", lat:54.8730, lng:69.1500, desc:"Петропавловск", type:"culture"},
    {title:"Усадьба Сырымбет", lat:53.0500, lng:69.2000, desc:"Имение Чокана Валиханова", type:"culture"},
    {title:"Карасай и Агынтай батыры", lat:53.1000, lng:69.3000, desc:"Мемориальный комплекс", type:"culture"},
    {title:"Тамгалы петроглифы", lat:43.8730, lng:75.5400, desc:"Наскальные рисунки", type:"culture"},
    {title:"Отрар и Арыстан-Баб", lat:42.8530, lng:68.3000, desc:"Древнее городище", type:"culture"},
    {title:"Карлаг", lat:49.6700, lng:73.1000, desc:"Музей памяти", type:"culture"},
    {title:"Сибинские озёра", lat:49.4000, lng:82.0000, desc:"Живописные озёра", type:"culture"},
    {title:"Алматы", lat:43.2380, lng:76.9450, desc:"Южная столица", type:"city"},
    {title:"Шымкент", lat:42.3170, lng:69.5900, desc:"Город традиций", type:"city"},
    {title:"Астана", lat:51.1605, lng:71.4704, desc:"Столица будущего", type:"city"},
    {title:"Актау", lat:43.6500, lng:51.1500, desc:"Город на Каспии", type:"city"},
    {title:"Тараз", lat:42.9000, lng:71.3650, desc:"Древний город", type:"city"},
    {title:"Бурабай (посёлок)", lat:53.0830, lng:70.3000, desc:"Курорт", type:"city"},
    {title:"Туркистан", lat:43.2973, lng:68.2517, desc:"Духовная столица", type:"city"},
    {title:"Алатау", lat:43.1500, lng:77.3000, desc:"Илийский Алатау", type:"mountain"},
    {title:"Кокшетау", lat:53.2833, lng:69.3833, desc:"Синегорье", type:"mountain"},
    {title:"Имантау", lat:53.2000, lng:69.1000, desc:"Гора и озеро", type:"mountain"},
    {title:"Чарын", lat:43.3791, lng:79.1233, desc:"Долина замков", type:"mountain"},
    {title:"Бектау-Ата", lat:47.6500, lng:74.7000, desc:"Священная гора", type:"mountain"}
  ];

  // Функция получения цвета маркера по типу
  function getMarkerColor(type) {
    const colors = { nature: '#4caf50', culture: '#9c27b0', city: '#2196f3', mountain: '#ff9800' };
    return colors[type] || '#4f7cff';
  }

  // Массив маркеров
  let markers = [];
  let selectedMarker = null;

  // Добавляем все маркеры
  locations.forEach(loc => {
    const color = getMarkerColor(loc.type);
    const icon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [16, 16],
      popupAnchor: [0, -8]
    });
    
    const marker = L.marker([loc.lat, loc.lng], { icon: icon }).addTo(map);
    marker.bindPopup(`
      <div style="min-width:200px;">
        <h3 style="color:#7df9ff; margin:0 0 8px 0;">${loc.title}</h3>
        <p style="color:#cbd3ff; margin:0 0 10px 0;">${loc.desc}</p>
        <span style="display:inline-block; padding:2px 8px; background:${color}; border-radius:12px; font-size:10px; color:white;">${loc.type}</span>
      </div>
    `);
    
    markers.push({ marker, title: loc.title, lat: loc.lat, lng: loc.lng, type: loc.type });
  });

  console.log(`📍 Добавлено маркеров: ${markers.length}`);

  // Функция выделения маркера
  function highlightMarker(title) {
    console.log(`🔍 Ищем маркер: "${title}"`);
    
    // Сбрасываем предыдущее выделение
    if (selectedMarker) {
      const oldData = markers.find(m => m.marker === selectedMarker);
      if (oldData) {
        const color = getMarkerColor(oldData.type);
        const defaultIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [16, 16],
          popupAnchor: [0, -8]
        });
        selectedMarker.setIcon(defaultIcon);
      }
    }
    
    // Находим новый маркер
    const found = markers.find(m => m.title === title || m.title.includes(title) || title.includes(m.title));
    
    if (found) {
      selectedMarker = found.marker;
      console.log(`✅ Найден маркер: ${found.title}`);
      
      // Выделенная иконка
      const selectedIcon = L.divIcon({
        className: 'custom-marker-selected',
        html: `<div style="background: #ff4444; width: 22px; height: 22px; border-radius: 50%; border: 3px solid #ffd700; box-shadow: 0 0 16px rgba(255,68,68,0.8); animation: pulse 1s infinite;"></div>`,
        iconSize: [28, 28],
        popupAnchor: [0, -14]
      });
      
      selectedMarker.setIcon(selectedIcon);
      selectedMarker.openPopup();
      map.setView([found.lat, found.lng], 12);
      console.log(`📍 Карта центрирована на: ${found.lat}, ${found.lng}`);
    } else {
      console.log(`❌ Маркер не найден для: "${title}"`);
    }
  }

  // Обработка параметров из URL
  const params = new URLSearchParams(window.location.search);
  const title = params.get("title");
  const lat = parseFloat(params.get("lat"));
  const lng = parseFloat(params.get("lng"));

  console.log(`📥 Параметры URL: title=${title}, lat=${lat}, lng=${lng}`);

  if (title) {
    setTimeout(() => {
      highlightMarker(title);
    }, 500);
  }

  // Добавляем анимацию пульсации
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.3); opacity: 0.7; }
      100% { transform: scale(1); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  console.log('✅ Карта готова');
});