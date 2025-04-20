const STORAGE_KEY = 'brandWizardForm';

export const saveToStorage = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const loadFromStorage = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
};

export const clearStorage = () => {
  localStorage.removeItem(STORAGE_KEY);
};
