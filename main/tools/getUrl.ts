
import path from 'path'
import isDev from './isDev'

export const domain = isDev
    ? `http://localhost:5173`
    : 'app://'

export const getURL = (pathname: string) => {
  if (isDev) {
    return path.join(domain, pathname)
  } else {
    // En producción, usar app:// protocol
    return `app://${pathname}`
  }
}