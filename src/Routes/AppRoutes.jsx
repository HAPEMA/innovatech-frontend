import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CrudAdmin } from "../componentes/CrudAdmin.jsx";
import { PruebaCards } from "../componentes/CrudAdmin/PruebaCards.jsx";
import { TableDespachos } from "../componentes/CrudAdmin/TableDespachos.jsx";
import { TableCompras } from "../componentes/CrudAdmin/TableCompras.jsx";
import Reviews from "../componentes/Layouts/Reviews.jsx";
import Footer from "../componentes/Layouts/Footer.jsx";

// Páginas placeholder — reemplazar con componentes reales cuando estén listos
const PaginaEnConstruccion = ({ titulo }) => (
  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
    <span className="text-5xl mb-4">🚧</span>
    <h2 className="text-2xl font-bold mb-2">{titulo}</h2>
    <p className="text-base">Esta sección está en construcción.</p>
  </div>
);

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CrudAdmin />}>
          {/* Dashboard principal */}
          <Route
            index
            element={
              <>
                <PruebaCards />
                <Reviews />
                <Footer />
              </>
            }
          />

          {/* Tablas CRUD */}
          <Route path="despachos" element={<TableDespachos />} />
          <Route path="compras" element={<TableCompras />} />

          {/* Secciones del menú lateral */}
          <Route
            path="usuarios"
            element={<PaginaEnConstruccion titulo="Usuarios" />}
          />
          <Route
            path="productos"
            element={<PaginaEnConstruccion titulo="Productos" />}
          />
          <Route
            path="configuracion"
            element={<PaginaEnConstruccion titulo="Configuración" />}
          />

          {/* Ruta 404 dentro del layout */}
          <Route
            path="*"
            element={<PaginaEnConstruccion titulo="Página no encontrada" />}
          />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;
