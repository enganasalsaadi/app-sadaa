// Unicode isolates: the wrapped run takes its own direction and never decides the paragraph's.
const FIRST_STRONG_ISOLATE = '⁨';
const LTR_ISOLATE = '⁦';
const POP_ISOLATE = '⁩';

/**
 * A name or other user text dropped into a sentence. «Test Brand 10 يراجع…» would otherwise turn
 * the whole Arabic paragraph left-to-right, because its first strong letter is Latin.
 */
export const isolateText = (text: string): string =>
  text ? `${FIRST_STRONG_ISOLATE}${text}${POP_ISOLATE}` : text;

/** Always left-to-right inside any sentence (links, handles), so «?» and «/» stay in place. */
export const isolateLtr = (text: string): string => (text ? `${LTR_ISOLATE}${text}${POP_ISOLATE}` : text);
