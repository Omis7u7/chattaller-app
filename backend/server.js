import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import path from "path";
import carrosRoutes from "./routes/carros.js";

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use("/api/carros", carrosRoutes);

const autosFile = "autos.json";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });
app.post("/upload", upload.single("archivo"), (req, res) => {
  res.json({ url: `/uploads/${req.file.filename}` });
});

app.use("/uploads", express.static("uploads"));

const leerAutos = () => JSON.parse(fs.readFileSync(autosFile, "utf-8") || "[]");
const guardarAutos = (data) => fs.writeFileSync(autosFile, JSON.stringify(data, null, 2));

app.get("/autos", (req, res) => {
  const autos = leerAutos();
  res.json(autos);
});

app.post("/autos", upload.single("foto"), (req, res) => {
  const autos = leerAutos();
  const nuevo = {
    id: Date.now(),
    marca: req.body.marca,
    modelo: req.body.modelo,
    año: req.body.año,
    foto: req.file ? `/uploads/${req.file.filename}` : null,
  };
  autos.push(nuevo);
  guardarAutos(autos);
  res.json(nuevo);
});

app.put("/autos/:id", upload.single("foto"), (req, res) => {
  const autos = leerAutos();
  const id = parseInt(req.params.id);
  const index = autos.findIndex((a) => a.id === id);
  if (index === -1) return res.status(404).send("No encontrado");

  if (req.file && autos[index].foto) {
    const oldPath = "." + autos[index].foto;
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  autos[index] = {
    ...autos[index],
    marca: req.body.marca,
    modelo: req.body.modelo,
    año: req.body.año,
    foto: req.file ? `/uploads/${req.file.filename}` : autos[index].foto,
  };
  guardarAutos(autos);
  res.json(autos[index]);
});

app.delete("/autos/:id", (req, res) => {
  const autos = leerAutos();
  const id = parseInt(req.params.id);
  const auto = autos.find((a) => a.id === id);
  if (!auto) return res.status(404).send("No encontrado");

  if (auto.foto) {
    const filePath = "." + auto.foto;
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  const filtrados = autos.filter((a) => a.id !== id);
  guardarAutos(filtrados);
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
