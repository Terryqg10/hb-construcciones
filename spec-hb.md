\# Software Design Document (SDD) - HB CONSTRUCCIONES



\## 1. Arquitectura y Stack Tecnológico

\*   \*\*Framework Core:\*\* Next.js (App Router).

\*   \*\*Lenguaje:\*\* TypeScript (Strict mode).

\*   \*\*Estilos y UI:\*\* Tailwind CSS (Arquitectura Mobile-First) + Lucide Icons.

\*   \*\*Despliegue:\*\* Vercel (preparado para PWA a futuro).



\## 2. Paleta de Colores (Propuesta de Marca)

\*   \*\*Fondo General:\*\* Blanco puro (`bg-white`) y gris extra claro (`bg-gray-50`) para separar secciones.

\*   \*\*Texto y Contraste:\*\* Gris Pizarra/Carbón (`text-slate-900`) para máxima legibilidad.

\*   \*\*Acento y CTAs (Call to Action):\*\* Naranja Seguridad Vibrante (ej. `bg-orange-500` o `#F97316`). Este color se usará EXCLUSIVAMENTE para los botones de WhatsApp y llamadas telefónicas.



\## 3. Estructura de la Landing Page (Layout sin fricción)

\*   \*\*Header (Sticky):\*\* Logo tipográfico "HB CONSTRUCCIONES" a la izquierda. A la derecha, un botón visible de "Llamar ahora" con el ícono de un teléfono.

\*   \*\*Hero Section:\*\* 

&#x20;   \*   Fondo: Imagen oscurecida de una piscina o reforma de alta calidad (usar placeholder de Unsplash temporalmente).

&#x20;   \*   Copy: "Expertos en Reformas Integrales y Construcción de Piscinas".

&#x20;   \*   CTAs (2 botones): Botón principal "Escríbenos por WhatsApp" (Naranja) y botón secundario "Ver nuestros trabajos" (Transparente con borde blanco).

&#x20;   \*   Badges de confianza (debajo de los CTAs, visibles sin scrollear): "Respuesta en 24h", "Presupuesto Gratis", "Garantía de Obra". Basado en estudio de mercado: las señales de confianza above-the-fold mejoran conversión 8-15%.

\*   \*\*Sección de Servicios:\*\* Grid minimalista de 2 a 4 tarjetas con íconos para: Reformas Generales, Construcción de Piscinas, etc.

\*   \*\*Galería (El Core del Negocio):\*\* Una cuadrícula (CSS Grid) asimétrica y moderna tipo "Masonry" para mostrar fotografías y videos de obras terminadas. Sin bordes, solo imágenes de alta calidad con un sutil `rounded-xl`.

\*   \*\*FAB (Floating Action Button):\*\* Botón flotante permanente en la esquina inferior derecha con el ícono de WhatsApp (`bg-green-500`) para contacto inmediato. Sin formulario de contacto en el MVP (ver Fase 6, opcional/futura).

\*   \*\*Sección de Valoraciones:\*\* Grid de 3 tarjetas `rounded-2xl` sobre `bg-gray-50`, con calificación (estrellas), cita del cliente y nombre. Contenido placeholder hasta tener reseñas reales. Ubicada entre la Galería y el footer.

\*   \*\*Sección "Por Qué Elegirnos":\*\* Grid de 4 tarjetas `rounded-2xl` sobre `bg-white`, con ícono, título y descripción breve, listando garantías/diferenciales (experiencia, presupuesto sin compromiso, garantía de obra, cumplimiento de plazos). Ubicada justo después del Hero, antes de Servicios, para generar confianza temprano.



\## 4. Fases de Implementación

\*   \*\*Fase 1:\*\* Setup del proyecto Next.js + Tailwind + Configuración de Tipos.

\*   \*\*Fase 2:\*\* Maquetación del Header y el Hero Section (Banner principal).

\*   \*\*Fase 3:\*\* Sección de Servicios y Cuadrícula de la Galería de Trabajos.

\*   \*\*Fase 4:\*\* Implementación de enlaces de contacto (WhatsApp/Teléfono) y el botón flotante (FAB).

\*   \*\*Fase 5:\*\* Sección de Valoraciones de clientes.

\*   \*\*Fase 7:\*\* Sección "Por Qué Elegirnos" (diferenciales de confianza).

\*   \*\*Fase 8:\*\* Slider "Antes y Después" (Piscina, Cocina, Baño). Basado en estudio de mercado del nicho: es el elemento de mayor impacto en conversión en sitios de contratistas. Client Component (estado de posición del slider vía `<input type="range">` superpuesto). Ubicada entre Galería y Valoraciones.

\*   \*\*Fase 9:\*\* Badges de confianza en el Hero + Sección "Cómo Trabajamos" (4 pasos: Contacto, Presupuesto, Ejecución, Entrega). Server Component. Ubicada entre "Por Qué Elegirnos" y Servicios. Requiere re-alternar blanco/gris en las secciones siguientes.

\*   \*\*Fase 6 (Opcional):\*\* Formulario de contacto. Campos: Nombre, Teléfono, Tipo de servicio (select), Mensaje. Validación en cliente (campos requeridos + formato básico de teléfono). Sin backend: al enviar arma un mensaje prellenado y redirige a WhatsApp (`wa.me`), reutilizando el mismo canal del resto del sitio. Client Component (requiere estado y `onSubmit`).

