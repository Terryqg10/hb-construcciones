import type { Metadata } from "next";
import { LegalLayout } from "@/components/layout/LegalLayout";

export const metadata: Metadata = {
  title: "Aviso Legal | HB Construcciones",
  description: "Información legal sobre el titular y las condiciones de uso de este sitio web.",
};

export default function AvisoLegalPage() {
  return (
    <LegalLayout title="Aviso Legal" updated="3 de octubre de 2026">
      {/* Oculto hasta tener los datos reales del titular (nombre, NIF y email). Para mostrarlo, descomentar y volver a importar `location` de "@/lib/location-data" y `siteConfig` de "@/lib/site-config".
      <section className="flex flex-col gap-3">
        <h2>1. Datos identificativos del titular</h2>
        <p>
          En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio,
          de Servicios de la Sociedad de la Información y de Comercio
          Electrónico (LSSI-CE), se informa de los siguientes datos:
        </p>
        <ul>
          <li>
            <strong>Titular:</strong> [NOMBRE Y APELLIDOS DEL AUTÓNOMO] (nombre
            comercial: {siteConfig.brandName})
          </li>
          <li>
            <strong>NIF:</strong> [NIF DEL AUTÓNOMO]
          </li>
          <li>
            <strong>Domicilio:</strong> {location.address}
          </li>
          <li>
            <strong>Teléfono:</strong> {siteConfig.phoneNumber}
          </li>
          <li>
            <strong>Email de contacto:</strong> [EMAIL DE CONTACTO]
          </li>
        </ul>
      </section>
      */}

      <section className="flex flex-col gap-3">
        <h2>2. Objeto y ámbito de aplicación</h2>
        <p>
          Este sitio web tiene como finalidad informar sobre los servicios de
          reformas integrales y construcción de piscinas prestados por el
          titular, y facilitar el contacto de clientes potenciales a través
          de WhatsApp, teléfono o el formulario de solicitud de presupuesto.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>3. Condiciones de uso</h2>
        <p>
          El acceso y uso de este sitio web atribuye la condición de usuario
          e implica la aceptación de las condiciones recogidas en este Aviso
          Legal. El usuario se compromete a hacer un uso adecuado del sitio,
          de conformidad con la ley, la moral y el orden público, y a no
          emplearlo para realizar actividades ilícitas o que infrinjan
          derechos de terceros.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>4. Propiedad intelectual e industrial</h2>
        <p>
          Los textos, imágenes, logotipos, diseño y demás contenidos de este
          sitio web son propiedad del titular o se utilizan con la
          correspondiente autorización. Queda prohibida su reproducción,
          distribución o comunicación pública, total o parcial, sin la
          autorización expresa del titular.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>5. Exclusión de responsabilidad</h2>
        <p>
          El titular no garantiza la disponibilidad y continuidad del
          funcionamiento del sitio web, ni se hace responsable de los daños
          que pudiera ocasionar su falta de disponibilidad. Este sitio puede
          incluir enlaces a páginas de terceros (como WhatsApp, Google Maps u
          OpenStreetMap) cuyo contenido y políticas no son responsabilidad
          del titular.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2>6. Legislación aplicable y jurisdicción</h2>
        <p>
          Las presentes condiciones se rigen por la legislación española.
          Para la resolución de cualquier controversia derivada del uso de
          este sitio web, las partes se someten a los juzgados y tribunales
          del domicilio del usuario, salvo que la normativa aplicable
          disponga otra cosa.
        </p>
      </section>
    </LegalLayout>
  );
}
