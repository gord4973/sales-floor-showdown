/// <reference types="vite/client" />

declare module 'qrcode' {
  const QRCode: {
    toDataURL(text: string, options?: object): Promise<string>
  }
  export default QRCode
}
