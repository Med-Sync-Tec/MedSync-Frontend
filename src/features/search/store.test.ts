import { useSearchStore } from './store';

beforeEach(() => {
  // Reset the singleton store between tests
  useSearchStore.setState({ query: '' });
});

describe('useSearchStore', () => {
  it('starts with an empty query', () => {
    // Assert
    expect(useSearchStore.getState().query).toBe('');
  });

  it('setQuery updates the query', () => {
    // Act
    useSearchStore.getState().setQuery('hipertensión');

    // Assert
    expect(useSearchStore.getState().query).toBe('hipertensión');
  });

  it('setQuery replaces a previous query', () => {
    // Arrange
    useSearchStore.getState().setQuery('primera');

    // Act
    useSearchStore.getState().setQuery('segunda');

    // Assert
    expect(useSearchStore.getState().query).toBe('segunda');
  });

  it('setQuery accepts an empty string', () => {
    // Arrange
    useSearchStore.getState().setQuery('algo');

    // Act
    useSearchStore.getState().setQuery('');

    // Assert
    expect(useSearchStore.getState().query).toBe('');
  });

  it('clearQuery resets the query to an empty string', () => {
    // Arrange
    useSearchStore.getState().setQuery('cardiología');

    // Act
    useSearchStore.getState().clearQuery();

    // Assert
    expect(useSearchStore.getState().query).toBe('');
  });

  it('notifies subscribers on state transitions', () => {
    // Arrange
    const seen: string[] = [];
    const unsubscribe = useSearchStore.subscribe((state) => {
      seen.push(state.query);
    });

    // Act
    useSearchStore.getState().setQuery('a');
    useSearchStore.getState().setQuery('b');
    useSearchStore.getState().clearQuery();
    unsubscribe();
    useSearchStore.getState().setQuery('after-unsubscribe');

    // Assert
    expect(seen).toEqual(['a', 'b', '']);
  });

  it('keeps action references stable across updates', () => {
    // Arrange
    const { setQuery, clearQuery } = useSearchStore.getState();

    // Act
    setQuery('x');

    // Assert
    expect(useSearchStore.getState().setQuery).toBe(setQuery);
    expect(useSearchStore.getState().clearQuery).toBe(clearQuery);
  });
});
