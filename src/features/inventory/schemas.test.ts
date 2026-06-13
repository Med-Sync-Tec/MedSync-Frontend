import {
  MedicamentoEstadoSchema,
  MedicamentoSchema,
  MedicamentosPageSchema,
  CreateMedicamentoSchema,
  UpdateMedicamentoSchema,
} from './schemas';

const VALID_UUID = '7f4df3a2-5b1c-4f7e-9a3d-2c8b1e6f4a90';

const validMedicamento = {
  id: VALID_UUID,
  nombre: 'Amoxicilina 500mg',
  estado: 'vigente',
  descripcion: 'Antibiótico de amplio espectro',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-02T00:00:00Z',
};

describe('MedicamentoEstadoSchema', () => {
  it.each(['vigente', 'en_revision', 'obsoleto'])('accepts %s', (estado) => {
    expect(MedicamentoEstadoSchema.safeParse(estado).success).toBe(true);
  });

  it('rejects unknown estado values', () => {
    expect(MedicamentoEstadoSchema.safeParse('descontinuado').success).toBe(false);
  });
});

describe('MedicamentoSchema', () => {
  it('parses a fully populated medicamento', () => {
    const result = MedicamentoSchema.safeParse(validMedicamento);

    expect(result.success).toBe(true);
  });

  it('accepts null for descripcion, createdAt and updatedAt', () => {
    const result = MedicamentoSchema.safeParse({
      ...validMedicamento,
      descripcion: null,
      createdAt: null,
      updatedAt: null,
    });

    expect(result.success).toBe(true);
  });

  it('rejects a non-uuid id', () => {
    const result = MedicamentoSchema.safeParse({ ...validMedicamento, id: 'not-a-uuid' });

    expect(result.success).toBe(false);
  });

  it('rejects an invalid estado', () => {
    const result = MedicamentoSchema.safeParse({ ...validMedicamento, estado: 'activo' });

    expect(result.success).toBe(false);
  });

  it('rejects missing nombre', () => {
    const { id, estado, descripcion, createdAt, updatedAt } = validMedicamento;

    expect(
      MedicamentoSchema.safeParse({ id, estado, descripcion, createdAt, updatedAt }).success
    ).toBe(false);
  });
});

describe('MedicamentosPageSchema', () => {
  it('parses a valid page envelope', () => {
    const result = MedicamentosPageSchema.safeParse({
      content: [validMedicamento],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });

    expect(result.success).toBe(true);
  });

  it('parses an empty content array', () => {
    const result = MedicamentosPageSchema.safeParse({
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });

    expect(result.success).toBe(true);
  });

  it('rejects when content contains an invalid medicamento', () => {
    const result = MedicamentosPageSchema.safeParse({
      content: [{ id: VALID_UUID }],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
    });

    expect(result.success).toBe(false);
  });

  it('rejects when pagination fields are not numbers', () => {
    const result = MedicamentosPageSchema.safeParse({
      content: [],
      page: '0',
      size: 10,
      totalElements: 0,
      totalPages: 0,
    });

    expect(result.success).toBe(false);
  });
});

describe('CreateMedicamentoSchema', () => {
  it('parses a valid input', () => {
    const result = CreateMedicamentoSchema.safeParse({
      nombre: 'Paracetamol',
      descripcion: 'Analgésico',
    });

    expect(result.success).toBe(true);
  });

  it('defaults descripcion to empty string when omitted', () => {
    const result = CreateMedicamentoSchema.parse({ nombre: 'Paracetamol' });

    expect(result.descripcion).toBe('');
  });

  it('rejects an empty nombre with a Spanish message', () => {
    const result = CreateMedicamentoSchema.safeParse({ nombre: '' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('El nombre es requerido');
    }
  });

  it('rejects nombre longer than 150 characters', () => {
    const result = CreateMedicamentoSchema.safeParse({ nombre: 'a'.repeat(151) });

    expect(result.success).toBe(false);
  });

  it('rejects descripcion longer than 1000 characters', () => {
    const result = CreateMedicamentoSchema.safeParse({
      nombre: 'Paracetamol',
      descripcion: 'a'.repeat(1001),
    });

    expect(result.success).toBe(false);
  });
});

describe('UpdateMedicamentoSchema', () => {
  it('parses a valid update input', () => {
    const result = UpdateMedicamentoSchema.safeParse({
      nombre: 'Paracetamol',
      estado: 'obsoleto',
      descripcion: 'Actualizado',
    });

    expect(result.success).toBe(true);
  });

  it('defaults descripcion to empty string when omitted', () => {
    const result = UpdateMedicamentoSchema.parse({ nombre: 'Paracetamol', estado: 'vigente' });

    expect(result.descripcion).toBe('');
  });

  it('rejects when estado is missing', () => {
    const result = UpdateMedicamentoSchema.safeParse({ nombre: 'Paracetamol' });

    expect(result.success).toBe(false);
  });

  it('rejects empty nombre', () => {
    const result = UpdateMedicamentoSchema.safeParse({ nombre: '', estado: 'vigente' });

    expect(result.success).toBe(false);
  });
});
