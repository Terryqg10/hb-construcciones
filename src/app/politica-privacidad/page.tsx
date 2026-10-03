import type { Metadata } from "next";
import { LegalLayout } from "@/components/layout/LegalLayout";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Política de Privacidad | HB Construcciones",
  description: "Cómo tratamos los datos personales de quienes usan este sitio web.",
};

export default function PoliticaPrivacidadPage() {
  return (
    <LegalLayout title="Política de Privacidad" updated="3 de octubre de 2026">
      {/* Oculto hasta tener los datos reales del titular (nombre, NIF y email). Para mostrarlo, descomentar y volver a importar `location` de "@/lib/location-data".
      <section className="flex flex-col gap-3">
        <h2>1. Responsable del tratamiento</h2>
        <ul>
          <li>
            <strong>Responsable:</strong> [NOMBRE Y APELLIDOS DEL AUTÓNOMO]
            (nombre comercial: {siteConfig.brandName})
          </li>
          <li>
            <strong>NIF:</strong> [NIF DEL AUTÓNOMO]
          </li>
          <li>
            <strong>Domicilio:</strong> {location.address}
          </li>
          <li>
            <strong>Email de contacto:</strong> [EMAIL DE CONTACTO]
          </li>
        </ul>
      </section>
      */}

      <section className="flex flex-col gap-3">
        <h2>2. Qué datos recogemos</h2>
        <p>
          El formulario de &ldquo;Solicita tu Presupuesto&rdquo; recoge los siguientes
          datos cuando el usuario decide enviarlo voluntariamente: nombre,
          teléfono, servicio de interés y mensaje.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>3. Cómo se usan estos datos</h2>
        <p>
          Este sitio <strong>no tiene un servidor propio que almacene los
          datos del formulario</strong>. Al enviarlo, el navegador abre
          WhatsApp con un mensaje ya redactado con esos datos, listo para que
          el usuario lo envíe directamente al número de contacto del
          titular ({siteConfig.phoneNumber}). A partir de ese momento, la
          conversación se gestiona a través de WhatsApp y aplica la política
          de privacidad de WhatsApp Ireland Limited (Meta).
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>4. Finalidad y legitimación</h2>
        <p>
          La finalidad es atender la consulta o solicitud de presupuesto del
          usuario. La base legal es el consentimiento que el usuario otorga
          al rellenar y enviar el formulario de forma voluntaria.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>5. Conservación de los datos</h2>
        <p>
          Al no quedar almacenados en ningún servidor de este sitio web, su
          conservación depende únicamente de la conversación de WhatsApp
          entre el usuario y el titular, que cada parte puede eliminar en
          cualquier momento desde su propia aplicación.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>6. Derechos del usuario</h2>
        <p>
          El usuario puede ejercer sus derechos de acceso, rectificación,
          supresión, oposición, limitación del tratamiento y portabilidad
          escribiendo a [EMAIL DE CONTACTO]. También puede presentar una
          reclamación ante la Agencia Española de Protección de Datos (
          <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">
            www.aepd.es
          </a>
          ) si considera que sus derechos no han sido atendidos correctamente.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>7. Cookies</h2>
        <p>
          Este sitio no utiliza cookies propias de analítica, publicidad ni
          seguimiento. La sección de ubicación incrusta un mapa de
          OpenStreetMap, que puede cargar recursos de su propio servidor;
          consulta su política en{" "}
          <a href="https://wiki.osmfoundation.org/wiki/Privacy_Policy" target="_blank" rel="noopener noreferrer">
            osmfoundation.org
          </a>
          .
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>8. Cambios en esta política</h2>
        <p>
          Esta política puede actualizarse para adaptarse a cambios
          legislativos o del propio sitio web. Se recomienda revisarla
          periódicamente.
        </p>
      </section>
    </LegalLayout>
  );
}
