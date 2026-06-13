import {
  LoginCredentialsSchema,
  UserRoleSchema,
  AuthUserSchema,
} from './schemas';

describe('LoginCredentialsSchema', () => {
  it('accepts a valid email and password', () => {
    // Arrange
    const input = { email: 'doctor@clinica.com', password: 'secret123' };

    // Act
    const result = LoginCredentialsSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(input);
    }
  });

  it('rejects an empty email with the required-field message', () => {
    const result = LoginCredentialsSchema.safeParse({ email: '', password: 'x' });

    expect(result.success).toBe(false);
    if (!result.success) {
      const emailIssue = result.error.issues.find((i) => i.path[0] === 'email');
      expect(emailIssue?.message).toBe('Este campo es obligatorio');
    }
  });

  it('rejects a malformed email with the invalid-format message', () => {
    const result = LoginCredentialsSchema.safeParse({
      email: 'not-an-email',
      password: 'x',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const emailIssue = result.error.issues.find((i) => i.path[0] === 'email');
      expect(emailIssue?.message).toBe('Formato de correo inválido');
    }
  });

  it('rejects an empty password with the required-field message', () => {
    const result = LoginCredentialsSchema.safeParse({
      email: 'doctor@clinica.com',
      password: '',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const passwordIssue = result.error.issues.find((i) => i.path[0] === 'password');
      expect(passwordIssue?.message).toBe('Este campo es obligatorio');
    }
  });

  it('reports issues for both fields when both are empty', () => {
    const result = LoginCredentialsSchema.safeParse({ email: '', password: '' });

    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain('email');
      expect(paths).toContain('password');
    }
  });

  it('rejects missing fields entirely', () => {
    const result = LoginCredentialsSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});

describe('UserRoleSchema', () => {
  it.each(['DOCTOR', 'COO', 'CMO'] as const)('accepts the %s role', (role) => {
    expect(UserRoleSchema.safeParse(role).success).toBe(true);
  });

  it('rejects lowercase or unknown roles', () => {
    expect(UserRoleSchema.safeParse('doctor').success).toBe(false);
    expect(UserRoleSchema.safeParse('ADMIN').success).toBe(false);
  });
});

describe('AuthUserSchema', () => {
  const baseUser = {
    id: 'user-1',
    email: 'doctor@clinica.com',
    name: 'Dra. Ana López',
    role: 'DOCTOR',
  };

  it('accepts a user without especialidadId (optional field)', () => {
    const result = AuthUserSchema.safeParse(baseUser);

    expect(result.success).toBe(true);
  });

  it('accepts a null especialidadId', () => {
    const result = AuthUserSchema.safeParse({ ...baseUser, especialidadId: null });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.especialidadId).toBeNull();
    }
  });

  it('accepts a string especialidadId', () => {
    const result = AuthUserSchema.safeParse({ ...baseUser, especialidadId: 'esp-1' });

    expect(result.success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = AuthUserSchema.safeParse({ ...baseUser, email: 'nope' });

    expect(result.success).toBe(false);
  });

  it('rejects an invalid role', () => {
    const result = AuthUserSchema.safeParse({ ...baseUser, role: 'NURSE' });

    expect(result.success).toBe(false);
  });
});
