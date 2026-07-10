// pdfmake dynamic import + Pretendard font registration (once per session)
let pdfMakePromise: Promise<any> | null = null

export function ensurePdfMake(): Promise<any> {
  if (!pdfMakePromise) {
    pdfMakePromise = import('pdfmake/build/pdfmake')
      .then((mod: any) => {
        const pdfMake = mod.default ?? mod
        const fonts = {
          Pretendard: {
            normal: `${location.origin}/fonts/Pretendard-Regular.otf`,
            bold: `${location.origin}/fonts/Pretendard-Bold.otf`,
            // Pretendard has no italic cut — fall back to upright
            italics: `${location.origin}/fonts/Pretendard-Regular.otf`,
            bolditalics: `${location.origin}/fonts/Pretendard-Bold.otf`,
          },
        }
        if (typeof pdfMake.addFonts === 'function') {
          pdfMake.addFonts(fonts)
        } else {
          pdfMake.fonts = fonts
        }
        return pdfMake
      })
      .catch((err) => {
        // allow retry on transient load failure
        pdfMakePromise = null
        throw err
      })
  }
  return pdfMakePromise
}
