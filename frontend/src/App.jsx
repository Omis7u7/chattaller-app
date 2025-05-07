import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:3001";

function App() {
  const [autos, setAutos] = useState([]);
  const [formulario, setFormulario] = useState({ marca: "", modelo: "", año: "", foto: null });
  const [editando, setEditando] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargarAutos();
  }, []);

  const cargarAutos = async () => {
    const res = await axios.get(`${API}/autos`);
    setAutos(res.data);
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: value });
  };

  const handleFile = (e) => {
    setFormulario({ ...formulario, foto: e.target.files[0] });
  };

  const validarFormulario = () => {
    return formulario.marca && formulario.modelo && formulario.año;
  };

  const guardarAuto = async () => {
    if (!validarFormulario()) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }

    const formData = new FormData();
    formData.append("marca", formulario.marca);
    formData.append("modelo", formulario.modelo);
    formData.append("año", formulario.año);
    if (formulario.foto) formData.append("foto", formulario.foto);

    if (editando) {
      await axios.put(`${API}/autos/${editando}`, formData);
    } else {
      await axios.post(`${API}/autos`, formData);
    }

    setFormulario({ marca: "", modelo: "", año: "", foto: null });
    setEditando(null);
    cargarAutos();
  };

  const editarAuto = (auto) => {
    setFormulario({
      marca: auto.marca,
      modelo: auto.modelo,
      año: auto.año,
      foto: null,
    });
    setEditando(auto.id);
  };

  const eliminarAuto = async (id) => {
    if (confirm("¿Estás seguro de que quieres eliminar este auto?")) {
      await axios.delete(`${API}/autos/${id}`);
      cargarAutos();
    }
  };

  const autosFiltrados = autos.filter((a) =>
    `${a.marca} ${a.modelo}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="App">
      <h1>Taller de Autos</h1>

      <div className="formulario">
        <input name="marca" placeholder="Marca" value={formulario.marca} onChange={handleInput} />
        <input name="modelo" placeholder="Modelo" value={formulario.modelo} onChange={handleInput} />
        <input name="año" placeholder="Año" value={formulario.año} onChange={handleInput} />
        <input type="file" accept="image/*" onChange={handleFile} />
        <button onClick={guardarAuto}>{editando ? "Actualizar" : "Agregar"}</button>
      </div>

      <input
        className="buscador"
        placeholder="Buscar autos..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <ul className="lista">
        {autosFiltrados.map((auto) => (
          <li key={auto.id}>
            <strong>{auto.marca} {auto.modelo}</strong> - {auto.año}
            <div>
              {auto.foto && <img src={`${API}${auto.foto}`} alt="foto" width="100" />}
            </div>
            <div className="botones">
              <button onClick={() => editarAuto(auto)}>Editar</button>
              <button onClick={() => eliminarAuto(auto.id)} className="eliminar">Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
