import React, { useEffect } from 'react';
import { LegalPageShell, LegalSection } from '@features/legal/components/LegalPageShell';

export const TermsPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Términos y Condiciones — MedSync';
  }, []);

  return (
    <LegalPageShell
      eyebrow="TÉRMINOS DEL SERVICIO"
      title="Términos y Condiciones"
      lastUpdated="27 de mayo de 2026"
    >
      <p>
        Estos términos describen las reglas de uso de <strong className="text-text-primary">MedSync</strong>,
        un proyecto académico desarrollado por el equipo EQ3005B del Tecnológico de Monterrey.
        Al acceder a la plataforma aceptas estas condiciones.
      </p>

      <LegalSection title="1. Naturaleza del servicio">
        <p>
          MedSync es una plataforma <strong className="text-text-primary">en desarrollo y con fines
          académicos</strong> que se conecta a la base de datos clínica del hospital para apoyar
          al personal médico autorizado en:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Consultar y registrar notas SOAP sobre las consultas del paciente.</li>
          <li>
            Cruzar el contexto clínico con literatura médica de PubMed para sugerir lecturas
            relevantes.
          </li>
          <li>Generar análisis y resúmenes asistidos por modelos de inteligencia artificial.</li>
        </ul>
        <p>
          MedSync <strong className="text-text-primary">no es un dispositivo médico</strong>, no
          emite diagnósticos y no sustituye el juicio profesional del personal sanitario.
          Cualquier decisión clínica derivada del uso de la plataforma es responsabilidad
          exclusiva del médico tratante.
        </p>
      </LegalSection>

      <LegalSection title="2. Cuentas y acceso">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            Las cuentas son creadas únicamente por un <strong className="text-text-primary">administrador
            institucional</strong> desde el panel interno. No existe registro público abierto.
          </li>
          <li>Las cuentas son personales e intransferibles.</li>
          <li>
            El usuario es responsable de mantener la confidencialidad de su contraseña y de
            notificar de inmediato cualquier acceso indebido a su administrador.
          </li>
          <li>
            El administrador puede suspender o revocar el acceso de un usuario en cualquier
            momento por motivos de seguridad o término del proyecto.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Uso aceptable">
        <p>Al usar MedSync te comprometes a:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            Acceder únicamente al expediente de pacientes que estén bajo tu cuidado o supervisión
            profesional.
          </li>
          <li>Registrar información veraz y relacionada con la atención del paciente.</li>
          <li>
            No extraer, copiar ni redistribuir datos clínicos por fuera de los canales
            autorizados.
          </li>
          <li>No compartir tus credenciales con otra persona.</li>
          <li>
            No intentar realizar ingeniería inversa, alterar el código o vulnerar los controles
            de seguridad de la plataforma.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Datos del paciente y base del hospital">
        <p>
          MedSync se conecta a la base de datos del hospital como un sistema externo
          autorizado. Los datos identificables del paciente (expediente clínico, consultas
          previas, signos vitales) son propiedad y responsabilidad del hospital; MedSync los
          consume durante la sesión activa pero no los replica en su propia base.
        </p>
        <p>
          El contexto clínico que MedSync sí almacena (etiquetas tipo/valor para el motor de
          sugerencias) es anonimizado y no contiene nombre ni identificadores personales del
          paciente. Para más detalle consulta el <a href="/privacidad" className="text-primary font-semibold hover:underline underline-offset-[3px]">Aviso de Privacidad</a>.
        </p>
      </LegalSection>

      <LegalSection title="5. Inteligencia artificial">
        <p>
          MedSync incluye funciones asistidas por modelos de lenguaje (Groq Cloud / Llama 3.3)
          para analizar artículos científicos y generar resúmenes. Los resultados son
          orientativos y siempre deben validarse contra la fuente original (artículo de PubMed,
          expediente del paciente). El modelo no recibe datos identificables del paciente.
        </p>
      </LegalSection>

      <LegalSection title="6. Disponibilidad">
        <p>
          MedSync se despliega en infraestructura de Google Cloud (Cloud Run y Cloud SQL). Al
          ser un proyecto académico en desarrollo, no garantizamos un nivel de servicio formal
          (SLA). Pueden ocurrir cortes, mantenimientos no programados o cambios en la
          funcionalidad sin previo aviso.
        </p>
      </LegalSection>

      <LegalSection title="7. Propiedad intelectual">
        <p>
          El código fuente, diseño, marca y materiales asociados a MedSync son propiedad del
          equipo desarrollador y del Tecnológico de Monterrey en el marco del proyecto
          académico. Los datos clínicos pertenecen al hospital y al paciente; MedSync los
          procesa únicamente para los fines descritos en estos términos.
        </p>
      </LegalSection>

      <LegalSection title="8. Limitación de responsabilidad">
        <p>
          MedSync se proporciona <em>tal cual</em>, en el marco de un proyecto académico. En la
          máxima medida permitida por la ley aplicable, el equipo desarrollador y el
          Tecnológico de Monterrey no serán responsables por daños indirectos, lucro cesante,
          pérdida de datos o decisiones clínicas tomadas con base en la información presentada
          por la plataforma. La responsabilidad sobre la atención del paciente recae siempre en
          el personal sanitario tratante.
        </p>
      </LegalSection>

      <LegalSection title="9. Ley aplicable">
        <p>
          Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier
          controversia se someterá a los tribunales competentes en Nuevo León, México.
        </p>
      </LegalSection>

      <LegalSection title="10. Contacto">
        <p>
          Para dudas sobre estos términos puedes comunicarte con el administrador institucional
          que gestionó tu cuenta dentro de MedSync.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
};
