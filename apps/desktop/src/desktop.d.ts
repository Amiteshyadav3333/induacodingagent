interface Window {
  indusDesktop?: {
    selectProjectFolder(): Promise<string | null>;
  };
}
