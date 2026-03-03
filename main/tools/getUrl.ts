
import path from 'path'
import isDev from './isDev'


export const getURL = (pathname: string) => {
  if (isDev) {
    return path.join("http://localhost:5173", pathname)
  } else {
    return `app://-${pathname}`
  }
}