import React, { useEffect } from 'react';
import { LegalPageShell, LegalSection } from '@features/legal/components/LegalPageShell';

export const PrivacyPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Aviso de Privacidad — MedSync';
  }, []);

  return (
    <LegalPageShell
      eyebrow="POLÍTICA DE PRIVACIDAD"
      title="Aviso de Privacidad"
      lastUpdated="27 de mayo de 2026"
    >
      <p>
        MedSync es un proyecto académico desarrollado por el equipo <strong className="text-text-primary">EQ3005B
        del Tecnológico de Monterrey</strong> como herramienta de apoyo clínico para personal médico
        autorizado. Este aviso describe qué información tratamos, qué información <strong className="text-text-primary">no</strong> almacenamos
        nosotros y cómo se relaciona MedSync con el sistema de información del hospital.
      </p>

      <LegalSection title="1. Naturaleza del proyecto">
        <p>
          MedSync es una aplicación en desarrollo en el marco del bloque académico EQ3005B. No es
          un producto comercial certificado y no cuenta con certificaciones formales de seguridad
          o cumplimiento sanitario. La información presentada aquí refleja el funcionamiento real
          del sistema a la fecha indicada al inicio.
        </p>
      </LegalSection>

      <LegalSection title="2. Arquitectura de datos: dos bases separadas">
        <p>
          MedSync opera con dos bases de datos independientes para mantener la confidencialidad
          de los datos clínicos:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong className="text-text-primary">Base de datos del hospital (externa):</strong> contiene
            los expedientes clínicos, consultas y datos identificables del paciente. Esta base es
            propiedad y responsabilidad del hospital. MedSync se <em>conecta</em> a ella en modo
            lectura/escritura controlada, pero no es su titular ni la replica.
          </li>
          <li>
            <strong className="text-text-primary">Base de datos de MedSync:</strong> contiene únicamente
            los datos necesarios para operar la plataforma — cuentas de usuarios profesionales,
            artículos científicos sincronizados desde PubMed, contexto clínico anonimizado para
            sugerencias y referencias a recursos guardados.
          </li>
        </ul>
        <p>
          Esta separación implica que la información sensible del paciente vive en la
          infraestructura del hospital, no en la nuestra.
        </p>
      </LegalSection>

      <LegalSection title="3. Datos que MedSync sí almacena directamente">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong className="text-text-primary">Cuenta profesional:</strong> nombre, correo
            electrónico, rol clínico (médico, COO) y especialidad asignada por el administrador.
          </li>
          <li>
            <strong className="text-text-primary">Contexto clínico del paciente:</strong> etiquetas
            (tipo + valor, por ejemplo "enfermedad: hipertensión") usadas para cruzar el
            expediente con literatura médica. No incluye nombre ni datos personales del paciente.
          </li>
          <li>
            <strong className="text-text-primary">Artículos científicos:</strong> resúmenes de
            PubMed sincronizados periódicamente, sus etiquetas y los artículos guardados por
            cada profesional.
          </li>
          <li>
            <strong className="text-text-primary">Notas SOAP y análisis IA:</strong> resúmenes
            generados durante consultas y análisis sugeridos por el modelo de inteligencia
            artificial.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Uso de la información">
        <p>
          Los datos que MedSync gestiona se usan exclusivamente para:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Permitir el acceso del personal autorizado al expediente del hospital.</li>
          <li>
            Cruzar el contexto clínico del paciente con literatura médica relevante (PubMed) y
            sugerir lecturas al profesional tratante.
          </li>
          <li>
            Generar análisis y resúmenes asistidos con inteligencia artificial sobre artículos
            científicos.
          </li>
          <li>Mantener la operación de la plataforma y la seguridad de las cuentas.</li>
        </ul>
        <p>
          MedSync no comparte datos con terceros con fines de publicidad y no comercializa
          información clínica ni profesional.
        </p>
      </LegalSection>

      <LegalSection title="5. Proveedores tecnológicos">
        <p>
          Para operar, MedSync utiliza servicios de terceros bajo sus respectivas políticas:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong className="text-text-primary">Google Cloud Platform</strong> (Cloud Run y Cloud SQL)
            para alojar la aplicación y la base de datos de la plataforma.
          </li>
          <li>
            <strong className="text-text-primary">Firebase Authentication</strong> para gestionar
            sesiones de usuario y validar credenciales.
          </li>
          <li>
            <strong className="text-text-primary">Groq Cloud</strong> para los análisis con modelos
            de lenguaje (Llama 3.3). Solo se envían textos de artículos científicos públicos,
            nunca datos personales del paciente.
          </li>
          <li>
            <strong className="text-text-primary">NCBI E-utilities (PubMed)</strong> para
            sincronizar artículos médicos públicos.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Acceso y autenticación">
        <p>
          El acceso a MedSync es exclusivamente por invitación: las cuentas son creadas por un
          administrador desde el panel interno. No existe registro público abierto. Las
          credenciales se validan contra Firebase Authentication mediante tokens firmados, y
          cada petición a la API requiere un token vigente.
        </p>
      </LegalSection>

      <LegalSection title="7. Derechos sobre los datos del paciente">
        <p>
          Como los datos identificables del paciente residen en la base de datos del hospital,
          cualquier solicitud de acceso, rectificación, cancelación u oposición debe dirigirse al
          área responsable del hospital. MedSync no puede atender de forma independiente
          solicitudes sobre información que no almacena.
        </p>
        <p>
          Para datos de tu cuenta profesional dentro de MedSync (nombre, correo, especialidad)
          puedes solicitar correcciones a través del administrador institucional que gestionó tu
          alta.
        </p>
      </LegalSection>

      <LegalSection title="8. Conservación">
        <p>
          La información de la base de datos del hospital se conserva según las políticas del
          propio hospital. Los datos almacenados directamente por MedSync (cuentas, artículos
          guardados, contexto clínico anonimizado) se conservan mientras la cuenta esté activa o
          el proyecto siga en operación; al finalizar el proyecto académico, los datos serán
          eliminados o devueltos al hospital responsable según corresponda.
        </p>
      </LegalSection>

      <LegalSection title="9. Cambios al aviso">
        <p>
          Al ser un proyecto en desarrollo, este aviso puede actualizarse conforme cambien las
          funcionalidades, los proveedores tecnológicos o las prácticas de manejo de datos. La
          versión vigente estará siempre en esta página, con la fecha de última actualización
          indicada al inicio.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
};
