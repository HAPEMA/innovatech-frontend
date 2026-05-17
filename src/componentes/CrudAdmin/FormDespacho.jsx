import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import axios from "axios";
import { API_DESPACHOS, API_VENTAS } from "../../config/api";

// venta puede ser null cuando se crea un despacho directamente desde TableDespachos
export const FormDespacho = ({ venta, onClose }) => {
  const { register, handleSubmit } = useForm();
  const esStandalone = !venta; // true = creación sin compra vinculada

  const onSubmit = async (data) => {
    console.log("onSubmit ejecutado");
    const jsonData = {
      fechaDespacho: data.fechaDespacho,
      patenteCamion: data.patenteCamion,
      intento: 0,
      entregado: false,
      idCompra: esStandalone ? Number(data.idCompra) : venta.idVenta,
      direccionCompra: esStandalone ? data.direccionCompra : venta.direccionCompra,
      valorCompra: esStandalone ? Number(data.valorCompra) : venta.valorCompra,
    };

    console.log("Datos del formulario:", jsonData);

    try {
      // Solo actualizamos la venta si venimos desde TableCompras
      if (!esStandalone) {
        await axios.put(
          `${API_VENTAS}/api/v1/ventas/${venta.idVenta}`,
          { despachoGenerado: true },
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );
      }

      await axios.post(`${API_DESPACHOS}/api/v1/despachos`, jsonData, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      Swal.fire({
        title: "Despacho registrado 🛻!",
        text: "El despacho ha sido generado con éxito en la base de datos",
        icon: "success",
        confirmButtonText: "Aceptar",
      });
    } catch (error) {
      console.error("Error en la solicitud:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo registrar el despacho.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
    onClose();
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col justify-center text-center px-24 text-xl"
      >
        <div className="mx-auto text-3xl font-bold mb-10 text-teal-600">
          Ingreso de orden de despacho
        </div>
        <div className="mb-5">
          <label className="block font-bold mb-2">Fecha de despacho</label>
          <input
            type="date"
            placeholder="Ingresa fecha de despacho"
            className="border border-gray-300 rounded-lg block w-full p-1"
            {...register("fechaDespacho", { required: true })}
          />
        </div>
        <div className="mb-5">
          <label className="block font-bold mb-2">Patente de camión</label>
          <input
            type="text"
            placeholder="Elige patente de camión"
            className="border border-gray-300 rounded-lg block w-full p-1"
            {...register("patenteCamion", { required: true })}
          />
        </div>
        <div className="mb-5">
          <label className="block font-bold mb-2">
            Orden de compra asociado
          </label>
          {esStandalone ? (
            <input
              type="number"
              placeholder="Ingresa el ID de la orden de compra"
              className="border border-gray-300 rounded-lg block w-full p-1"
              {...register("idCompra", { required: true })}
            />
          ) : (
            <input
              type="number"
              disabled={true}
              value={venta.idVenta}
              className="border border-gray-300 rounded-lg block w-full text-slate-400 p-1"
            />
          )}
        </div>
        <div className="mb-5">
          <label className="block font-bold mb-2">Dirección de entrega</label>
          {esStandalone ? (
            <input
              type="text"
              placeholder="Ingresa la dirección de entrega"
              className="border border-gray-300 rounded-lg block w-full p-1"
              {...register("direccionCompra", { required: true })}
            />
          ) : (
            <input
              type="text"
              disabled={true}
              value={venta.direccionCompra}
              className="border border-gray-300 rounded-lg block w-full text-slate-400 p-1"
            />
          )}
        </div>
        <div className="mb-5">
          <label className="block font-bold mb-2">Valor de compra</label>
          {esStandalone ? (
            <input
              type="number"
              placeholder="Ingresa el valor de la compra"
              className="border border-gray-300 rounded-lg block w-full p-1"
              {...register("valorCompra", { required: true })}
            />
          ) : (
            <input
              type="number"
              value={venta.valorCompra}
              className="border border-gray-300 rounded-lg block w-full text-slate-400 p-1"
              disabled={true}
            />
          )}
        </div>

        <button
          className="py-6 px-14 rounded-lg bg-teal-600 text-white font-bold mb-14"
          type="submit"
        >
          Asignar despacho
        </button>
      </form>
    </>
  );
};
