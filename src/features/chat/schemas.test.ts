import { ChatRequestSchema, ChatResponseSchema } from './schemas';

describe('ChatRequestSchema', () => {
  it('accepts a valid message', () => {
    expect(() => ChatRequestSchema.parse({ message: 'hola' })).not.toThrow();
  });

  it('rejects an empty string', () => {
    expect(() => ChatRequestSchema.parse({ message: '' })).toThrow();
  });

  it('rejects a message over 1000 chars', () => {
    expect(() => ChatRequestSchema.parse({ message: 'a'.repeat(1001) })).toThrow();
  });

  it('accepts a message of exactly 1000 chars', () => {
    expect(() => ChatRequestSchema.parse({ message: 'a'.repeat(1000) })).not.toThrow();
  });
});

describe('ChatResponseSchema', () => {
  it('accepts valid response object', () => {
    expect(() =>
      ChatResponseSchema.parse({ response: 'respuesta', isCritical: false })
    ).not.toThrow();
  });

  it('accepts isCritical=true', () => {
    expect(() =>
      ChatResponseSchema.parse({ response: 'emergencia', isCritical: true })
    ).not.toThrow();
  });

  it('rejects missing response field', () => {
    expect(() => ChatResponseSchema.parse({ isCritical: false })).toThrow();
  });
});
