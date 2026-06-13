import {
  SpecialtySchema,
  SpecialtyListSchema,
  CreateUserSchema,
  CreateDoctorSchema,
  CreatedUserSchema,
} from './schemas';

const SPECIALTY_UUID = '3f1b6a52-8c4d-4e2a-9f7b-1d2c3e4f5a6b';
const USER_UUID = '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d';

const validSpecialty = {
  id: SPECIALTY_UUID,
  nombre: 'Cardiología',
  slug: 'cardiologia',
  descripcion: 'Especialidad del corazón',
  activo: true,
};

const validDoctorInput = {
  rol: 'DOCTOR',
  nombre: 'Dr. Juan Pérez',
  correo: 'juan@medsync.local',
  password: 'secret123',
  especialidadId: SPECIALTY_UUID,
};

describe('SpecialtySchema', () => {
  it('parses a fully populated specialty', () => {
    expect(SpecialtySchema.safeParse(validSpecialty).success).toBe(true);
  });

  it('accepts null or missing descripcion', () => {
    expect(SpecialtySchema.safeParse({ ...validSpecialty, descripcion: null }).success).toBe(true);

    const { id, nombre, slug, activo } = validSpecialty;
    expect(SpecialtySchema.safeParse({ id, nombre, slug, activo }).success).toBe(true);
  });

  it('rejects a non-uuid id', () => {
    expect(SpecialtySchema.safeParse({ ...validSpecialty, id: '123' }).success).toBe(false);
  });

  it('rejects a non-boolean activo', () => {
    expect(SpecialtySchema.safeParse({ ...validSpecialty, activo: 'yes' }).success).toBe(false);
  });
});

describe('SpecialtyListSchema', () => {
  it('parses an array of specialties', () => {
    expect(SpecialtyListSchema.safeParse([validSpecialty]).success).toBe(true);
  });

  it('parses an empty array', () => {
    expect(SpecialtyListSchema.safeParse([]).success).toBe(true);
  });

  it('rejects a non-array payload', () => {
    expect(SpecialtyListSchema.safeParse({ items: [] }).success).toBe(false);
  });
});

describe('CreateUserSchema', () => {
  it('parses a valid DOCTOR input', () => {
    expect(CreateUserSchema.safeParse(validDoctorInput).success).toBe(true);
  });

  it('requires a uuid especialidadId for DOCTOR', () => {
    const result = CreateUserSchema.safeParse({ ...validDoctorInput, especialidadId: '' });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      expect(messages).toContain('Selecciona una especialidad');
    }
  });

  it('parses a valid COO input without especialidadId', () => {
    const result = CreateUserSchema.safeParse({
      rol: 'COO',
      nombre: 'Lic. María García',
      correo: 'maria@medsync.local',
      password: 'secret123',
    });

    expect(result.success).toBe(true);
  });

  it('allows an arbitrary especialidadId string for COO', () => {
    const result = CreateUserSchema.safeParse({
      rol: 'COO',
      nombre: 'Lic. María García',
      correo: 'maria@medsync.local',
      password: 'secret123',
      especialidadId: '',
    });

    expect(result.success).toBe(true);
  });

  it('rejects an unknown rol', () => {
    expect(
      CreateUserSchema.safeParse({ ...validDoctorInput, rol: 'CMO' }).success
    ).toBe(false);
  });

  it('rejects empty nombre with a Spanish message', () => {
    const result = CreateUserSchema.safeParse({ ...validDoctorInput, nombre: '' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.message)).toContain('El nombre es obligatorio');
    }
  });

  it('rejects a malformed correo', () => {
    const result = CreateUserSchema.safeParse({ ...validDoctorInput, correo: 'no-es-correo' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.message)).toContain('Formato de correo inválido');
    }
  });

  it('rejects a password shorter than 6 characters', () => {
    const result = CreateUserSchema.safeParse({ ...validDoctorInput, password: '12345' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.message)).toContain('Mínimo 6 caracteres');
    }
  });

  it('exposes CreateDoctorSchema as a backward-compat alias', () => {
    expect(CreateDoctorSchema).toBe(CreateUserSchema);
  });
});

describe('CreatedUserSchema', () => {
  const validCreatedUser = {
    id: USER_UUID,
    nombre: 'Dr. Juan Pérez',
    correo: 'juan@medsync.local',
    role: 'DOCTOR',
    especialidadId: SPECIALTY_UUID,
    especialidadNombre: 'Cardiología',
    activo: true,
    createdAt: '2026-06-12T00:00:00Z',
  };

  it('parses a fully populated created user', () => {
    expect(CreatedUserSchema.safeParse(validCreatedUser).success).toBe(true);
  });

  it('accepts null or missing optional fields', () => {
    const result = CreatedUserSchema.safeParse({
      ...validCreatedUser,
      especialidadId: null,
      especialidadNombre: null,
      createdAt: null,
    });

    expect(result.success).toBe(true);

    const { id, nombre, correo, role, activo } = validCreatedUser;
    expect(CreatedUserSchema.safeParse({ id, nombre, correo, role, activo }).success).toBe(true);
  });

  it('rejects a role outside the UserRole enum', () => {
    expect(
      CreatedUserSchema.safeParse({ ...validCreatedUser, role: 'ADMIN' }).success
    ).toBe(false);
  });

  it('rejects a malformed correo', () => {
    expect(
      CreatedUserSchema.safeParse({ ...validCreatedUser, correo: 'invalid' }).success
    ).toBe(false);
  });
});
