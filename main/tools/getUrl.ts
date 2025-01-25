import isDev from './isDev'

export const domain =
    isDev
    ? `http://localhost:5173/`
    : `app://runts.com/`;


export const initialLocale = 'es-ES';

export const getURL = (pathname: string) =>
  `${domain}${initialLocale}${pathname}`;