
import path from 'path'
import isDev from './isDev'

export const domain = isDev
    ? `http://localhost:5173`
    : 'http://localhost:19293'

export const getURL = (pathname: string) => path.join(domain, pathname)