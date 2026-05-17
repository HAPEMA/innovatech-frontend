import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "./Modal";
import { FormDespacho } from "./FormDespacho";
import axios from "axios";
import { API_VENTAS } from "../../config/api";

// TODO: Reemplazar mock data cuando el backend exponga GET /api/v1/ventas
const MOCK_VENTAS = [
  {
    idVenta: 1001,
    direccionCompra: "Av. Providencia 1234, Santiago",
    fechaCompra: "2025-05-10",
    valorCompra: 150000,
    despachoGenerado: false,
  },
  {
    idVenta: 1002,
    direccionCompra: "Calle Los Leones 456, Providencia",
    fechaCompra: "2025-05-11",
    valorCompra: 89990,
    despachoGenerado: false,
  },
  {
    idVenta: 1003,
    direccionCompra: "Av. Las Condes 789, Las Condes",
    fechaCompra: "2025-05-12",
    valorCompra: 230000,
    despachoGenerado: true,
  },
];

export const TableCompras = () => {
  const navigate = useNavigate();
  const [ventas, setVentas] = useState([]);

  const compras = async () => {
    try {
      const response = await axios.get(`${API_VENTAS}/api/v1/ventas`, {
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
        : data?.content ?? data?.data ?? data?.ventas ?? [];
      setVentas(lista);
    } catch (error) {
      // TODO: Remover mock data cuando el endpoint esté disponible en el backend
      console.warn(
        "Endpoint /api/v1/ventas no disponible, usando datos de ejemplo:",
        error.message
      );
      setVentas(MOCK_VENTAS);
    }
  };

  // Llamada a la función para obtener los datos cuando el componente se monta
  useEffect(() => {
    compras();
  }, []);

  //state que controla el modal
  const [openModal, setOpenModal] = useState(false);

  //state que abre el modal junto con la data del id seleccionado
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const handleAbrirModal = (venta) => {
    setVentaSeleccionada(venta);
    setOpenModal(true);
  };

  return (
    <>
      <section className="grid text-center grid-cols-12 mb-8">
        <div className="col-span-12 flex justify-center">
          <div className="col-span-10 p-2 bg-white border border-gray-200 rounded-lg shadow dark:bg-white h-full overflow-hidden">
            {/* Botón volver */}
            <div className="flex justify-start p-2 mb-2">
              <button
                onClick={() => navigate("/")}
                className="py-1 px-4 bg-gray-200 text-gray-700 rounded-xl shadow-md hover:bg-gray-300 transition-all duration-300 font-bold"
              >
                ← Volver
              </button>
            </div>

            <table className="table-fixed">
              <thead>
                <tr className="py-10">
                  <th className="pr-10">Orden de compra</th>
                  <th className="pr-10">direccion</th>
                  <th className="pr-10">fecha de compra</th>
                  <th className="pr-10">valor total</th>
                  <th className="pr-10"></th>
                </tr>
              </thead>
              <tbody>
                {ventas
                  .filter((venta) => !venta.despachoGenerado)
                  .map((venta) => (
                    <tr key={venta.idVenta}>
                      <td className="pr-10 py-10 items-center">
                        {venta.idVenta}
                      </td>
                      <td className="pr-10 py-10  items-center">
                        {venta.direccionCompra}
                      </td>
                      <td className="pr-10 py-10  items-center">
                        {venta.fechaCompra}
                      </td>
                      <td className="pr-10 py-10  items-center">
                        ${venta.valorCompra}
                      </td>
                      <td>
                        <button
                          onClick={() => handleAbrirModal(venta)}
                          className="py-1 bg-orange-200 px-8 rounded-xl shadow-md hover:bg-orange-300/70 transition-all duration-300 "
                        >
                          Generar Despacho
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <Modal
        onClose={() => {
          setOpenModal(false);
        }}
        open={openModal}
      >
        {ventaSeleccionada && (
          <FormDespacho
            venta={ventaSeleccionada}
            onClose={() => {
              //onclose es un prop que pasa funciones al modal con el form abierto, por ende al cerrarse, se ejecutan esas 2 funciones
              setOpenModal(false);
              compras();
            }}
          />
        )}
      </Modal>
    </>
  );
};
