import React from 'react';
import { Header } from '../../../components/ui/navigation/Header';
import { Button } from '../../../components/ui/buttons/Button';
import { Input } from '../../../components/ui/inputs/Input';
import { Textarea } from '../../../components/ui/inputs/Textarea';
import { SOAPSection } from '../../../components/ui/cards/SOAPSection';
import { FileUploadZone } from '../../../components/ui/inputs/FileUploadZone';

export const NewSOAPEntry: React.FC = () => {
  const patientName = "Carlos Eduardo Mendez";
  const patientId = "29.332-1";

  const handleBack = () => {
    window.location.href = '/medical-record/history';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] transition-colors duration-300">
      <Header role="doctor" activeLink="Pacientes" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nueva Entrada Clínica (SOAP)</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Paciente: <span className="text-gray-900 dark:text-gray-200 font-bold">{patientName}</span> • ID: {patientId}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">history</span>
              Historial
            </button>
            <button className="flex items-center justify-center w-10 h-10 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm">
              <span className="material-symbols-outlined text-[20px]">print</span>
            </button>
          </div>
        </div>

        {/* SOAP Form Sections */}
        <div className="space-y-6">
          {/* S - Subjetivo */}
          <SOAPSection
            letter="S"
            title="Subjetivo"
            subtitle="Sintomatología y Motivo"
            headerAction={
              <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
                <span className="material-symbols-outlined text-[16px]">mic</span>
                Dictado por voz
              </button>
            }
          >
            <Textarea
              placeholder="Describa el motivo de consulta, síntomas actuales, antecedentes y preocupaciones del paciente..."
              className="w-full bg-transparent border-none focus:ring-0 focus:bg-transparent p-0 dark:focus:bg-transparent"
              rows={5}
            />
          </SOAPSection>

          {/* O - Objetivo */}
          <SOAPSection
            letter="O"
            title="Objetivo"
            subtitle="Examen Físico y Signos Vitales"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Input label="TEMP (°C)" placeholder="36.5" />
                <Input label="PRESIÓN ART. (MMHG)" placeholder="120/80" />
                <Input label="FREC. CARDÍACA (LPM)" placeholder="72" />
                <Input label="SATURACIÓN O2 (%)" placeholder="98" />
              </div>
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hallazgos del examen físico</h4>
                <Textarea
                  placeholder="Detalle los hallazgos observados durante la exploración..."
                  className="w-full bg-transparent border-none focus:ring-0 focus:bg-transparent p-0 dark:focus:bg-transparent"
                  rows={3}
                />
              </div>
            </div>
          </SOAPSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* A - Análisis */}
            <SOAPSection letter="A" title="Análisis" subtitle="Diagnóstico">
              <Textarea
                placeholder="Razonamiento clínico y diagnóstico presuntivo o definitivo..."
                className="w-full bg-transparent border-none focus:ring-0 focus:bg-transparent p-0 dark:focus:bg-transparent"
                rows={5}
              />
            </SOAPSection>

            {/* P - Plan */}
            <SOAPSection letter="P" title="Plan" subtitle="Tratamiento">
              <Textarea
                placeholder="Medicamentos, dosis, estudios complementarios solicitados y seguimiento..."
                className="w-full bg-transparent border-none focus:ring-0 focus:bg-transparent p-0 dark:focus:bg-transparent"
                rows={5}
              />
            </SOAPSection>
          </div>

          <FileUploadZone />
        </div>

        {/* Form Footer Actions */}
        <div className="flex items-center justify-between gap-4 pt-8 border-t border-gray-100 dark:border-gray-800">
          <Button
            variant="danger"
            onClick={handleBack}
            icon={<span className="material-symbols-outlined">delete</span>}
          >
            Cancelar y descartar
          </Button>

          <div className="flex items-center gap-4">
            <Button variant="secondary" icon={<span className="material-symbols-outlined">picture_as_pdf</span>}>
              Exportar PDF
            </Button>
            <Button className="px-8" icon={<span className="material-symbols-outlined">save</span>}>
              Guardar Entrada
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};
