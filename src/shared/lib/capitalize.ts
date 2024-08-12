export function capitalize(
  str: string,
  locale = typeof window === 'undefined' ? 'en' : navigator.language,
) {
  return str.replace(/^\p{CWU}/u, (char) => char.toLocaleUpperCase(locale));
}
