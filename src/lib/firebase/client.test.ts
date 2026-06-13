
const mocks = (() => {
  const newApp = { name: 'new-app' };
  const existingApp = { name: 'existing-app' };
  const authInstance = { name: 'auth-instance' };
  return {
    newApp,
    existingApp,
    authInstance,
    initializeApp: jest.fn(),
    getApps: jest.fn(),
    getApp: jest.fn(),
    getAuth: jest.fn(),
  };
})();

jest.mock('firebase/app', () => ({
  initializeApp: mocks.initializeApp,
  getApps: mocks.getApps,
  getApp: mocks.getApp,
}));

jest.mock('firebase/auth', () => ({
  getAuth: mocks.getAuth,
}));

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  mocks.initializeApp.mockReturnValue(mocks.newApp);
  mocks.getApp.mockReturnValue(mocks.existingApp);
  mocks.getAuth.mockReturnValue(mocks.authInstance);
});

describe('firebase client', () => {
  it('initializes a new app with the env-derived config when none exists', async () => {
    // Arrange
    mocks.getApps.mockReturnValue([]);

    // Act
    const mod = await import('./client');

    // Assert
    expect(mocks.initializeApp).toHaveBeenCalledTimes(1);
    expect(mocks.initializeApp).toHaveBeenCalledWith({
      apiKey: 'test-api-key',
      authDomain: 'test.firebaseapp.com',
      projectId: 'test-project',
      appId: 'test-app-id',
    });
    expect(mocks.getApp).not.toHaveBeenCalled();
    expect(mocks.getAuth).toHaveBeenCalledWith(mocks.newApp);
    expect(mod.auth).toBe(mocks.authInstance);
  });

  it('reuses the existing app when one is already initialized', async () => {
    mocks.getApps.mockReturnValue([mocks.existingApp]);

    const mod = await import('./client');

    expect(mocks.initializeApp).not.toHaveBeenCalled();
    expect(mocks.getApp).toHaveBeenCalledTimes(1);
    expect(mocks.getAuth).toHaveBeenCalledWith(mocks.existingApp);
    expect(mod.auth).toBe(mocks.authInstance);
  });
});
