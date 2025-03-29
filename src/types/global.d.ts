
declare namespace NodeJS {
  interface Global {
    TextDecoder: typeof TextDecoder;
    TextEncoder: typeof TextEncoder;
  }
}

interface Window {
  global: Window;
}
