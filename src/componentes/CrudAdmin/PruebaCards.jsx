import { useNavigate } from "react-router-dom";
import { CardComponent } from "./CardComponent";

export const PruebaCards = () => {
  const navigate = useNavigate();

  return (
    <section>
      <div className="flex justify-center">
        <CardComponent
          title="Consultar Ordenes de compra 💰"
          description="Revisa las últimas oc realizadas para generar su despacho"
          buttonText="Consultar"
          onClick={() => navigate("/compras")}
        />
        <CardComponent
          title="Revisar Ordenes de despacho 🚚"
          description="Consulta los despachos realizados, modifica los registros de intentos o cierra la orden"
          buttonText="Consultar"
          onClick={() => navigate("/despachos")}
        />
      </div>
    </section>
  );
};
