import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "./Modal";
import { FormDespacho } from "./FormDespacho";
import { FormVenta } from "./FormVenta";
import axios from "axios";
import Swal from "sweetalert2";
import { API_VENTAS } from "../../config/api";

export const TableCompras = () => {
  const navigate = useNavigate();
  const [ventas, setVentas] = useState([]);

  const fetchVentas = async () => {
    try {
      const response = await axios.get(`${API_VENTAS}/api/v1/ventas`, {
        headers: { "Content-Type": "application/json", Accept: "application/json" },
      });
      const data = response.data;
      const lista = Array.isArray(data)
        ? data
        : data?.content ?? data?.data ?? data?.ventas ?? [];
      setVentas(lista);
    } catch (error) {
      console.error("Error al obtener ventas:", error);
      setVentas([]);
    }
  };

  useEffect(() => { fetchVentas(); }, []);

  // Modal: Generar Despacho
  const [openDespachoModal, setOpenDespachoModal] = useState(false);
  const [ventaDespacho, setVentaDespacho] = useState(null);

  // Modal: Editar Venta
  const [openEditModal, setOpenEditModal] = useState(false);
  const [ventaEditar, setVentaEditar] = useState(null);

  // Modal: Nueva Venta
  const [openNuevaModal, setOpenNuevaModal] = useState(false);

  const handleEliminar = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar venta?",
      text: `Se eliminará la venta #${id} de forma permanente.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${API_VENTAS}/api/v1/ventas/${id}`, {
          headers: { "Content-Type": "application/json", Accept: "application/json" },
        });
        Swal.fire({ title: "Eliminada", text: "La venta ha sido eliminada.", icon: "success", confirmButtonText: "Aceptar" });
        fetchVentas();
      } catch (error) {
        console.error("Error al eliminar venta:", error);
        Swal.fire({ title: "Error", text: "No se pudo eliminar la venta.", icon: "error", confirmButtonText: "Aceptar" });
      }
    }
  };

  return (
    <>
      <section className="grid text-center grid-cols-12 mb-8">
        <div className="col-span-12 flex justify-center">
          <div className="col-span-10 p-2 bg-white border border-gray-200 rounded-lg shadow dark:bg-white h-full overflow-hidden">
            <div className="flex justify-between items-center p-2 mb-2">
              <button
                onClick={() => navigate("/")}
                className="py-1 px-4 bg-gray-200 text-gray-700 rounded-xl shadow-md hover:bg-gray-300 transition-all duration-300 font-bold"
              >
                ← Volver
              </button>
              <button
                onClick={() => setOpenNuevaModal(true)}
                className="py-1 px-6 bg-teal-500 text-white rounded-xl shadow-md hover:bg-teal-600 transition-all duration-300 font-bold"
              >
                + Nueva Venta
              </button>
            </div>

            <table className="table-fixed">
              <thead>
                <tr className="py-10">
                  <th className="pr-10">Orden de compra</th>
                  <th className="pr-10">Dirección</th>
                  <th className="pr-10">Fecha</th>
                  <th className="pr-10">Valor total</th>
                  <th className="pr-10">Despacho</th>
                  <th className="pr-10">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((venta) => (
                  <tr key={venta.idVenta}>
                    <td className="pr-10 py-10 items-center">{venta.idVenta}</td>
                    <td className="pr-10 py-10 items-center">
                      {venta.direccion ?? venta.direccionCompra}
                    </td>
                    <td className="pr-10 py-10 items-center">
                      {venta.fecha ?? venta.fechaCompra}
                    </td>
                    <td className="pr-10 py-10 items-center">
                      ${venta.valorTotal ?? venta.valorCompra}
                    </td>
                    <td className="pr-10 py-10 items-center">
                      {venta.despachoGenerado ? "Generado" : "Pendiente"}
                    </td>
                    <td className="pr-4 py-10 items-center">
                      <div className="flex flex-col gap-2">
                        {!venta.despachoGenerado && (
                          <button
                            onClick={() => { setVentaDespacho(venta); setOpenDespachoModal(true); }}
                            className="py-1 bg-teal-200 px-4 rounded-xl shadow-md hover:bg-teal-300/70 transition-all duration-300"
                          >
                            Generar Despacho
                          </button>
                        )}
                        <button
                          onClick={() => { setVentaEditar(venta); setOpenEditModal(true); }}
                          className="py-1 bg-orange-200 px-4 rounded-xl shadow-md hover:bg-orange-300/70 transition-all duration-300"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleEliminar(venta.idVenta)}
                          className="py-1 bg-red-200 px-4 rounded-xl shadow-md hover:bg-red-300/70 transition-all duration-300"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Modal onClose={() => setOpenDespachoModal(false)} open={openDespachoModal}>
        {ventaDespacho && (
          <FormDespacho
            venta={ventaDespacho}
            onClose={() => { setOpenDespachoModal(false); fetchVentas(); }}
          />
        )}
      </Modal>

      <Modal onClose={() => setOpenEditModal(false)} open={openEditModal}>
        {ventaEditar && (
          <FormVenta
            venta={ventaEditar}
            onClose={() => { setOpenEditModal(false); fetchVentas(); }}
          />
        )}
      </Modal>

      <Modal onClose={() => setOpenNuevaModal(false)} open={openNuevaModal}>
        <FormVenta
          onClose={() => { setOpenNuevaModal(false); fetchVentas(); }}
        />
      </Modal>
    </>
  );
};
