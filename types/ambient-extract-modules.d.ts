declare module 'pdf-parse' {
  const pdfParse: (data: Buffer | Uint8Array | ArrayBuffer) => Promise<{ text?: string }>
  export default pdfParse
}

declare module 'mammoth' {
  export function extractRawText(input: { buffer: Buffer | Uint8Array | ArrayBuffer }): Promise<{ value?: string }>
}
