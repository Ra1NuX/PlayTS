export interface EnvVar {
  id: string;
  key: string;
  value: string;
  isActive: boolean;
  createdAt: Date;
}

export interface NewEnvVar {
  key: string;
  value: string;
  isActive: boolean;
}
