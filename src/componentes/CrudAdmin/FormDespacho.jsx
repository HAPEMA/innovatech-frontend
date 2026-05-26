import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import axios from "axios";
import { API_DESPACHOS, API_VENTAS } from "../../config/api";

export const FormDespacho = ({ venta, despacho, onClose }) => {
  const { register, handleSubmit } = useForm();
  const esEditar = !!despacho;
  const esStandalone = !venta && !despacho;

  const onSubmit = async (data) => {
    const entregadoVal = data.entregado === "true" || data.entregado === true;

    try {
      if (esEditar) {
        const jsonData = {
          fechaDespacho: data.fechaDespacho,
          patenteCamion: data.patenteCamion,
          idCompra: Number(data.idCompra),
          direccionCompra: data.direccionCompra,
          valorCompra: despacho.valorCompra,
          entregado: entregadoVal,
          intento: Number(data.intento),
        };
        await axios.put(
          `${API_DESPACHOS}/api/v1/despachos/${despacho.idDespacho}`,
          jsonData,
          { headers: { "Content-Type": "application/json", Accept: "application/json" } }
        );
        Swal.fire({ title: "Despacho actualizado!", icon: "success", confirmButtonText: "Aceptar" });
      } else {
        const jsonData = {
          fechaDespacho: data.fechaDespacho,
          patenteCamion: data.patenteCamion,
          intento: esStandalone ? Number(data.intento) || 0 : 0,
          entregado: esStandalone ? entregadoVal : false,
          idCompra: esStandalone ? Number(data.idCompra) : venta.idVenta,
          direccionCompra: esStandalone
            ? data.direccionCompra
            : (venta.direccion ?? venta.direccionCompra),
          valorCompra: esStandalone
            ? Number(data.valorCompra)
            : (venta.valorTotal ?? venta.valorCompra),
        };

        if (!esStandalone) {
          await axios.put(
            `${API_VENTAS}/api/v1/ventas/${venta.idVenta}`,
            { despachoGenerado: true },
            { headers: { "Content-Type": "application/json", Accept: "application/json" } }
          );
        }

        await axios.post(`${API_DESPACHOS}/api/v1/despachos`, jsonData, {
          headers: { "Content-Type": "application/json", Accept: "application/json" },
        });
        Swal.fire({
          title: "Despacho registrado!",
          text: "El despacho ha sido generado con éxito.",
          icon: "success",
          confirmButtonText: "Aceptar",
        });
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo procesar el despacho.",
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
        {esEditar ? "Editar orden de despacho" : "Ingreso de orden de despacho"}
      </div>

      <div className="mb-5">
        <label className="block font-bold mb-2">Fecha de despacho</label>
        <input
          type="date"
          className="border border-gray-300 rounded-lg block w-full p-1"
          defaultValue={esEditar ? despacho.fechaDespacho : undefined}
          {...register("fechaDespacho", { required: true })}
        />
      </div>

      <div className="mb-5">
        <label className="block font-bold mb-2">Patente de camión</label>
        <input
          type="text"
          placeholder="Ej: ABCD12"
          className="border border-gray-300 rounded-lg block w-full p-1"
          defaultValue={esEditar ? despacho.patenteCamion : undefined}
          {...register("patenteCamion", { required: true })}
        />
      </div>

      <div className="mb-5">
        <label className="block font-bold mb-2">Orden de compra asociada</label>
        {!venta ? (
          <input
            type="number"
            placeholder="Ingresa el ID de la orden de compra"
            className="border border-gray-300 rounded-lg block w-full p-1"
            defaultValue={esEditar ? despacho.idCompra : undefined}
            {...register("idCompra", { required: true })}
          />
        ) : (
          <input
            type="number"
            disabled
            value={venta.idVenta}
            className="border border-gray-300 rounded-lg block w-full text-slate-400 p-1"
          />
        )}
      </div>

      <div className="mb-5">
        <label className="block font-bold mb-2">Dirección de entrega</label>
        {!venta ? (
          <input
            type="text"
            placeholder="Ingresa la dirección de entrega"
            className="border border-gray-300 rounded-lg block w-full p-1"
            defaultValue={esEditar ? despacho.direccionCompra : undefined}
            {...register("direccionCompra", { required: true })}
          />
        ) : (
          <input
            type="text"
            disabled
            value={venta.direccion ?? venta.direccionCompra}
            className="border border-gray-300 rounded-lg block w-full text-slate-400 p-1"
          />
        )}
      </div>

      {esStandalone && (
        <div className="mb-5">
          <label className="block font-bold mb-2">Valor de compra</label>
          <input
            type="number"
            placeholder="Ingresa el valor de la compra"
            className="border border-gray-300 rounded-lg block w-full p-1"
            {...register("valorCompra", { required: true })}
          />
        </div>
      )}

      {venta && !esEditar && (
        <div className="mb-5">
          <label className="block font-bold mb-2">Valor de compra</label>
          <input
            type="number"
            disabled
            value={venta.valorTotal ?? venta.valorCompra}
            className="border border-gray-300 rounded-lg block w-full text-slate-400 p-1"
          />
        </div>
      )}

      {(esStandalone || esEditar) && (
        <>
          <div className="mb-5">
            <label className="block font-bold mb-2">Estado de entrega</label>
            <select
              className="border border-gray-300 rounded-lg block w-full p-1"
              defaultValue={esEditar ? String(despacho.entregado) : "false"}
              {...register("entregado")}
            >
              <option value="false">Despacho pendiente</option>
              <option value="true">Despacho entregado</option>
            </select>
          </div>

          <div className="mb-5">
            <label className="block font-bold mb-2">Intentos de entrega</label>
            <input
              type="number"
              min="0"
              className="border border-gray-300 rounded-lg block w-full p-1"
              defaultValue={esEditar ? despacho.intento : 0}
              {...register("intento", { required: true, min: 0 })}
            />
          </div>
        </>
      )}

      <button
        className="py-6 px-14 rounded-lg bg-teal-600 text-white font-bold mb-14"
        type="submit"
      >
        {esEditar ? "Guardar cambios" : "Asignar despacho"}
      </button>
    </form>
  );
};
