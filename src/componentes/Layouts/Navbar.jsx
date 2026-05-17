import { NavLink } from "react-router-dom";

function Navbar() {
  const linkClass = ({ isActive }) =>
    `block font-bold py-2 px-3 rounded transition-colors duration-200 ${
      isActive ? "bg-teal-800" : "hover:bg-teal-700"
    }`;

  return (
    <nav className="rounded-xl w-[250px] min-h-[880px] bg-teal-600 text-white sticky top-0 p-4 m-4">
      {/* Logo / título — click vuelve al dashboard */}
      <NavLink to="/">
        <h2 className="text-xl font-bold mb-8 hover:opacity-80 transition-opacity cursor-pointer">
          Despacho Dashboard
        </h2>
      </NavLink>

      {/* Menú de navegación */}
      <ul className="space-y-3">
        <li>
          <NavLink to="/usuarios" className={linkClass}>
            Usuarios
          </NavLink>
        </li>
        <li>
          <NavLink to="/productos" className={linkClass}>
            Productos
          </NavLink>
        </li>
        <li>
          <NavLink to="/configuracion" className={linkClass}>
            Configuración
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
