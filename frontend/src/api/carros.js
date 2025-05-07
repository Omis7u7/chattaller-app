import axios from "axios";

const API = "http://localhost:3001/api/carros";

export const obtenerCarros = () => axios.get(API);

export const agregarCarro = (carro) => axios.post(API, carro);

export const actualizarCarro = (id, data) => axios.put(`${API}/${id}`, data);
