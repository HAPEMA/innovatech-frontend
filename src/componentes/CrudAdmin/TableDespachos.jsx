import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { API_DESPACHOS } from "../../config/api";
import { Modal } from "./Modal";
import { FormCierreDespacho } from "./FormCierreDespacho";
import { FormDespacho } from "./FormDespacho";

export const TableDespachos = () => {
  const navigate = useNavigate();
  const [despachos, setDespachos] = useState([]);

  const fetchDespachos = async () => {
    try {
      const response = await axios.get(`${API_DESPACHOS}/api/v1/despachos`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      console.log(response.data);
      const data = response.data;
      // La API puede devolver el array directamente o envuelto en una propiedad
      const lista = Array.isArray(data)
        ? data
        : data?.content ?? data?.data ?? data?.despachos ?? [];
      setDespachos(lista);
    } catch (error) {
      console.error("Error al obtener despachos:", error);
    }
  };

  useEffect(() => {
    fetchDespachos();
  }, []);

  // Modal para editar/cerrar despacho existente
  const [openModal, setOpenModal] = useState(false);
  const [despachoSeleccionado, setDespachoSeleccionado] = useState(null);

  const handleAbrirModal = (despacho) => {
    setDespachoSeleccionado(despacho);
    setOpenModal(true);
  };

  // Modal para crear nuevo despacho
  const [openNuevoModal, setOpenNuevoModal] = useState(false);

  // Eliminar despacho
  const handleEliminar = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar despacho?",
      text: `Se eliminará el despacho #${id} de forma permanente.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${API_DESPACHOS}/api/v1/despachos/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        Swal.fire({
          title: "Eliminado",
          text: "El despacho ha sido eliminado.",
          icon: "success",
          confirmButtonText: "Aceptar",
        });
        fetchDespachos();
      } catch (error) {
        console.error("Error al eliminar despacho:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudo eliminar el despacho.",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      }
    }
  };

  return (
    <>
      <section className="grid text-center grid-cols-12 mb-8">
        <div className="col-span-12 flex justify-center">
          <div className="col-span-10 p-2 bg-white border border-gray-200 rounded-lg shadow dark:bg-white h-full overflow-hidden">
            {/* Barra superior: volver + nuevo despacho */}
            <div className="flex justify-between items-center p-2 mb-2">
              <button
                onClick={() => navigate("/")}
                className="py-1 px-4 bg-gray-200 text-gray-700 rounded-xl shadow-md hover:bg-gray-300 transition-all duration-300 font-bold"
              >
                ← Volver
              </button>
              <button
                onClick={() => setOpenNuevoModal(true)}
                className="py-1 px-6 bg-teal-500 text-white rounded-xl shadow-md hover:bg-teal-600 transition-all duration-300 font-bold"
              >
                + Nuevo Despacho
              </button>
            </div>


            <table className="table-fixed">
              <thead>
                <tr className="py-10">
                  <th className="pr-10">Orden de despacho</th>
                  <th className="pr-10">Orden de compra</th>
                  <th className="pr-10">Dirección de entrega</th>
                  <th className="pr-10">Fecha despacho</th>
                  <th className="pr-10">Patente Camión</th>
                  <th className="pr-10">Entregado</th>
                  <th className="pr-10">Intentos de entrega</th>
                  <th className="pr-10">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {despachos.map((despacho) => (
                  <tr key={despacho.idDespacho}>
                    <td className="pr-10 py-10 items-center">
                      {despacho.idDespacho}
                    </td>
                    <td className="pr-10 py-10 items-center">
                      {despacho.idCompra}
                    </td>
                    <td className="pr-10 py-10 items-center">
                      {despacho.direccionCompra}
                    </td>
                    <td className="pr-10 py-10 items-center">
                      {despacho.fechaDespacho}
                    </td>
                    <td className="pr-10 py-10 items-center">
                      {despacho.patenteCamion}
                    </td>
                    <td className="pr-10 py-10 items-center">
                      {despacho.entregado
                        ? "Despacho entregado"
                        : "Despacho pendiente"}
                    </td>
                    <td className="pr-10 py-10 items-center">
                      {despacho.intento}
                    </td>
                    <td className="pr-4 py-10 items-center">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleAbrirModal(despacho)}
                          className="py-1 bg-orange-200 px-4 rounded-xl shadow-md hover:bg-orange-300/70 transition-all duration-300"
                        >
                          Cerrar despacho
                        </button>
                        <button
                          onClick={() => handleEliminar(despacho.idDespacho)}
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

      {/* Modal para editar/cerrar despacho existente */}
      <Modal
        onClose={() => setOpenModal(false)}
        open={openModal}
      >
        {despachoSeleccionado && (
          <FormCierreDespacho
            despacho={despachoSeleccionado}
            onClose={() => {
              setOpenModal(false);
              fetchDespachos();
            }}
          />
        )}
      </Modal>

      {/* Modal para crear nuevo despacho */}
      <Modal
        onClose={() => setOpenNuevoModal(false)}
        open={openNuevoModal}
      >
        <FormDespacho
          venta={null}
          onClose={() => {
            setOpenNuevoModal(false);
            fetchDespachos();
          }}
        />
      </Modal>
    </>
  );
};
