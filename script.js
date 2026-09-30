// DATOS SIMULADOS
const petsData = {
  max: {
    name: "Max",
    type: "Dog",
    lat: 4.6097,
    lng: -74.0817,
    avatar: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200"
  },
  luna: {
    name: "Luna",
    type: "Cat",
    lat: 4.6120,
    lng: -74.0830,
    avatar: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=200"
  }
};

let currentPet = "max";
let map, petMarker, geofenceCircle;
let simulationInterval = null;

// INICIALIZACIÓN DEL MAPA (Leaflet.js)
function initMap() {
  const defaultLat = petsData[currentPet].lat;
  const defaultLng = petsData[currentPet].lng;

  map = L.map('map').setView([defaultLat, defaultLng], 16);

  // Mapa base OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  // Icono personalizado para la mascota
  const customIcon = L.divIcon({
    className: 'custom-pet-pin',
    html: `<div style="background: #10b981; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
             <i class="fa-solid fa-paw"></i>
           </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });

  // Marcador
  petMarker = L.marker([defaultLat, defaultLng], { icon: customIcon }).addTo(map);
  petMarker.bindPopup(`<b>${petsData[currentPet].name}</b><br>Rastreador GPS Activo`).openPopup();

  // Zona segura (Geofence Circle)
  geofenceCircle = L.circle([defaultLat, defaultLng], {
    color: '#10b981',
    fillColor: '#10b981',
    fillOpacity: 0.15,
    radius: 180
  }).addTo(map);

  startGpsSimulation();
}

// LOGS DE EVENTOS
function addLog(message, type = "info") {
  const logBox = document.getElementById('liveLogs');
  const entry = document.createElement('div');
  entry.className = `log-entry log-${type}`;
  const icon = type === 'danger' ? 'fa-triangle-exclamation' : (type === 'success' ? 'fa-shield-check' : 'fa-circle-info');
  entry.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`;
  logBox.prepend(entry);
}

// SIMULACIÓN DE MOVIMIENTO GPS
function startGpsSimulation() {
  if (simulationInterval) clearInterval(simulationInterval);

  simulationInterval = setInterval(() => {
    // Generar pequeño movimiento aleatorio
    const deltaLat = (Math.random() - 0.5) * 0.0003;
    const deltaLng = (Math.random() - 0.5) * 0.0003;

    petsData[currentPet].lat += deltaLat;
    petsData[currentPet].lng += deltaLng;

    const newPos = [petsData[currentPet].lat, petsData[currentPet].lng];
    petMarker.setLatLng(newPos);

    // Verificar si está dentro de la Zona Segura
    const center = geofenceCircle.getLatLng();
    const distance = map.distance(newPos, center);

    if (distance > geofenceCircle.getRadius()) {
      addLog(`¡ALERTA! ${petsData[currentPet].name} salió de la Zona Segura`, 'danger');
    }
  }, 3000);
}

// CAMBIO DE MASCOTA EN EL MAPA
document.querySelectorAll('.btn-pet-select').forEach(button => {
  button.addEventListener('click', (e) => {
    document.querySelectorAll('.btn-pet-select').forEach(b => b.classList.remove('active'));
    button.classList.add('active');

    currentPet = button.dataset.pet;
    const pet = petsData[currentPet];

    petMarker.setLatLng([pet.lat, pet.lng]);
    geofenceCircle.setLatLng([pet.lat, pet.lng]);
    map.panTo([pet.lat, pet.lng]);

    addLog(`Cambiado monitoreo a: ${pet.name}`, 'info');
  });
});

// TOGGLE GEOCERCA
document.getElementById('toggleGeofence').addEventListener('change', (e) => {
  if (e.target.checked) {
    map.addLayer(geofenceCircle);
    addLog("Zona segura activada", "success");
  } else {
    map.removeLayer(geofenceCircle);
    addLog("Zona segura desactivada", "info");
  }
});

// SIMULAR ESCAPE
document.getElementById('btnSimulateEscape').addEventListener('click', () => {
  const center = geofenceCircle.getLatLng();
  // Mover marcador fuera del radio
  const escapeLat = center.lat + 0.003;
  const escapeLng = center.lng + 0.003;

  petsData[currentPet].lat = escapeLat;
  petsData[currentPet].lng = escapeLng;

  petMarker.setLatLng([escapeLat, escapeLng]);
  map.panTo([escapeLat, escapeLng]);

  addLog(`🚨 SIMULACIÓN: ${petsData[currentPet].name} ha traspasado el perímetro!`, 'danger');
});

// ALERTAS COMUNITARIAS DINÁMICAS
const lostPetsFeed = [
  { name: "Rocky", breed: "Bulldog Francés", time: "Hace 15 min", img: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=200", zone: "Sector Norte" },
  { name: "Mimi", breed: "Gato Persa", time: "Hace 1 hora", img: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=200", zone: "Parque Sur" }
];

function renderFeed() {
  const container = document.getElementById('lostPetsFeed');
  container.innerHTML = lostPetsFeed.map(pet => `
    <div class="alert-card">
      <img src="${pet.img}" alt="${pet.name}">
      <div class="alert-details">
        <h4>${pet.name} <span class="alert-badge">PERDIDO</span></h4>
        <p><strong>Raza:</strong> ${pet.breed}</p>
        <p><i class="fa-solid fa-location-dot"></i> ${pet.zone} (${pet.time})</p>
      </div>
    </div>
  `).join('');
}

// CONTROL DE MODALES
const modalEmergency = document.getElementById('modalEmergency');
const modalCardGen = document.getElementById('modalCardGen');

document.getElementById('btnAlertEmergency').addEventListener('click', () => modalEmergency.classList.add('active'));
document.getElementById('btnCloseModal').addEventListener('click', () => modalEmergency.classList.remove('active'));

document.getElementById('btnOpenCardGen').addEventListener('click', () => modalCardGen.classList.add('active'));
document.getElementById('btnCloseCardModal').addEventListener('click', () => modalCardGen.classList.remove('active'));

// REPORTE DE EMERGENCIA (FORMULARIO)
document.getElementById('formEmergency').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('petName').value;
  const type = document.getElementById('petType').value;
  const location = document.getElementById('lastLocation').value;

  lostPetsFeed.unshift({
    name: name,
    breed: type,
    time: "Ahora mismo",
    img: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&q=80&w=200",
    zone: location
  });

  renderFeed();
  modalEmergency.classList.remove('active');
  alert(`Alerta emitida con éxito para ${name}. Se ha notificado a la comunidad cercana.`);
  document.getElementById('formEmergency').reset();
});

// CARGA INICIAL
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  renderFeed();
});