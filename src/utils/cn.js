/** Tiny classname joiner — keeps conditional Tailwind readable. */
export const cn = (...classes) => classes.filter(Boolean).join(' ');

export default cn;
