/**
 * Respuesta completa de la API de búsqueda de npm
 */
export interface NpmSearchResponse {
    objects: NpmSearchResult[];
    total: number;
    time: string;
  }
  
  /**
   * Resultado individual de búsqueda
   */
  export interface NpmSearchResult {
    package: NpmPackage;
    score: ScoreDetails;
    searchScore: number;
    flags?: PackageFlags;
  }
  
  /**
   * Detalles del paquete npm
   */
  export interface NpmPackage {
    name: string;
    scope: string;
    version: string;
    description?: string;
    keywords?: string[];
    date: string;
    links: {
      npm: string;
      homepage?: string;
      repository?: string;
      bugs?: string;
    };
    author?: NpmPerson;
    publisher?: NpmUser;
    maintainers?: NpmUser[];
    // Agregar más campos según necesidad
  }
  
  /**
   * Detalles de puntuación del paquete
   */
  export interface ScoreDetails {
    final: number;
    detail: {
      quality: number;
      popularity: number;
      maintenance: number;
    };
  }
  
  /**
   * Usuario de npm
   */
  export interface NpmUser {
    username: string;
    email: string;
  }
  
  /**
   * Información de persona (autor)
   */
  export interface NpmPerson {
    name?: string;
    email?: string;
    url?: string;
  }
  
  /**
   * Flags opcionales del paquete
   */
  export interface PackageFlags {
    unstable?: boolean;
    deprecated?: boolean;
    insecure?: boolean;
  }