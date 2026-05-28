import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import axios from "axios";
import { API_VENTAS } from "../../config/api";

export const FormVenta = ({ venta, onClose }) => {
  const { register, handleSubmit } = useForm();
  const esEditar = !!venta;

  const onSubmit = async (data) => {
    const jsonData = {
      direccionCompra: data.direccion,
      valorCompra: Number(data.valorTotal),
      fechaCompra: data.fecha,
      despachoGenerado: esEditar ? (venta.despachoGenerado ?? false) : false,
    };

    try {
      if (esEditar) {
        await axios.put(
          `${API_VENTAS}/api/v1/ventas/${venta.idVenta}`,
          jsonData,
          { headers: { "Content-Type": "application/json", Accept: "application/json" } }
        );
        Swal.fire({ title: "Venta actualizada!", icon: "success", confirmButtonText: "Aceptar" });
      } else {
        await axios.post(`${API_VENTAS}/api/v1/ventas`, jsonData, {
          headers: { "Content-Type": "application/json", Accept: "application/json" },
        });
        Swal.fire({ title: "Venta registrada!", icon: "success", confirmButtonText: "Aceptar" });
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo procesar la venta.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col justify-center text-center px-24 text-xl"
    >
      <div className="mx-auto text-3xl font-bold mb-10 text-teal-600">
        {esEditar ? "Editar venta" : "Nueva venta"}
      </div>

      <div className="mb-5">
        <label className="block font-bold mb-2">Fecha</label>
        <input
          type="date"
          className="border border-gray-300 rounded-lg block w-full p-1"
          defaultValue={esEditar ? (venta.fecha ?? venta.fechaCompra) : undefined}
          {...register("fecha", { required: true })}
        />
      </div>

      <div className="mb-5">
        <label className="block font-bold mb-2">Dirección</label>
        <input
          type="text"
          placeholder="Ingresa la dirección"
          className="border border-gray-300 rounded-lg block w-full p-1"
          defaultValue={esEditar ? (venta.direccion ?? venta.direccionCompra) : undefined}
          {...register("direccion", { required: true })}
        />
      </div>

      <div className="mb-5">
        <label className="block font-bold mb-2">Valor total</label>
        <input
          type="number"
          min="0"
          placeholder="Ingresa el valor total"
          className="border border-gray-300 rounded-lg block w-full p-1"
          defaultValue={esEditar ? (venta.valorTotal ?? venta.valorCompra) : undefined}
          {...register("valorTotal", { required: true, min: 0 })}
        />
      </div>

      <button
        className="py-6 px-14 rounded-lg bg-teal-600 text-white font-bold mb-14"
        type="submit"
      >
        {esEditar ? "Guardar cambios" : "Registrar venta"}
      </button>
    </form>
  );
};
