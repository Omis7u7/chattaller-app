import express from "express";
const router = express.Router();

let carros = [];

router.post("/", (req, res) => {
  const nuevoCarro = req.body;
  nuevoCarro.id = Date.now();
  carros.push(nuevoCarro);
  res.status(201).json(nuevoCarro);
});

router.get("/", (req, res) => {
  res.json(carros);
});

export default router;
