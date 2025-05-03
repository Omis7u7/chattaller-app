const API = 'http://localhost:3001';

const form = document.getElementById('form-carro');
const lista = document.getElementById('lista-carros');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const fotoFile = document.getElementById('foto').files[0];
  const formData = new FormData();
  formData.append('foto', fotoFile);

  // Subir imagen
  const uploadRes = await fetch(`${API}/upload`, {
    method: 'POST',
    body: formData
  });

  const { path } = await uploadRes.json();

  // Crear nuevo carro
  const nuevoCarro = {
    marca: document.getElementById('marca').value,
    modelo: document.getElementById('modelo').value,
    año: document.getElementById('año').value,
    foto: path
  };

  await fetch(`${API}/carros`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nuevoCarro)
  });

  form.reset();
  cargarCarros();
});

async function cargarCarros() {
  const res = await fetch(`${API}/carros`);
  const carros = await res.json();

  lista.innerHTML = '';
  carros.forEach((carro) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${API}${carro.foto}" alt="Foto del auto">
      <h3>${carro.marca} ${carro.modelo}</h3>
      <p>Año: ${carro.año}</p>
      <button onclick="eliminarCarro(${carro.id})">Eliminar</button>
    `;
    lista.appendChild(card);
  });
}

async function eliminarCarro(id) {
  await fetch(`${API}/carros/${id}`, { method: 'DELETE' });
  cargarCarros();
}

// Cargar autos al inicio
cargarCarros();
