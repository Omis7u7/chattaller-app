const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configurar Multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}${ext}`;
    cb(null, filename);
  }
});
const upload = multer({ storage });

// Cargar datos iniciales
const DATA_FILE = path.join(__dirname, 'carros.json');
const leerCarros = () => fs.readJson(DATA_FILE).catch(() => []);
const guardarCarros = (data) => fs.writeJson(DATA_FILE, data, { spaces: 2 });

// Ruta para subir fotos
app.post('/upload', upload.single('foto'), (req, res) => {
  res.json({ path: `/uploads/${req.file.filename}` });
});

// Obtener todos los carros
app.get('/carros', async (req, res) => {
  const carros = await leerCarros();
  res.json(carros);
});

// Agregar un carro nuevo
app.post('/carros', async (req, res) => {
  const carros = await leerCarros();
  const nuevo = { id: Date.now(), ...req.body };
  carros.push(nuevo);
  await guardarCarros(carros);
  res.json(nuevo);
});

// Actualizar un carro
app.put('/carros/:id', async (req, res) => {
  const id = Number(req.params.id);
  const carros = await leerCarros();
  const index = carros.findIndex((c) => c.id === id);
  if (index !== -1) {
    carros[index] = { ...carros[index], ...req.body };
    await guardarCarros(carros);
    res.json(carros[index]);
  } else {
    res.status(404).json({ error: 'Carro no encontrado' });
  }
});

// Borrar un carro
app.delete('/carros/:id', async (req, res) => {
  const id = Number(req.params.id);
  let carros = await leerCarros();
  carros = carros.filter((c) => c.id !== id);
  await guardarCarros(carros);
  res.json({ ok: true });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor backend en http://localhost:${PORT}`);
});
