/// <reference types="vite/client" />

type ScreenSource = {
  id: string;
  name: string;
  thumbnail: string;
};

interface Window {
  frontendHan2?: {
    appName: string;
    version: string;
    getScreenSources: () => Promise<ScreenSource[]>;
  };
}
