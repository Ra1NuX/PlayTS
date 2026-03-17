export interface CallAIStreamCallbacks {
  onData: (data: { response: string }) => void;
  onFinally: (data: {
    response: string;
    id: string | null;
    error: boolean;
  }) => void;
}

export interface AIProviderConfig {
  buildRequest: (params: AIRequestParams) => { url: string; init: RequestInit };
  extractDelta: (json: unknown) => string;
}

export interface AIRequestParams {
  modelId: string;
  apiKey: string;
  messages: { role: string; content: string }[];
  systemContent: string;
}
