declare module 'heic-convert' {
  interface ConvertOptions {
    buffer: Buffer | ArrayBuffer;
    format: 'JPEG' | 'PNG';
    quality: number; // 0-1
  }

  function convert(options: ConvertOptions): Promise<ArrayBuffer>;

  export default convert;
}
