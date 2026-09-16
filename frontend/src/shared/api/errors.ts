import type { AxiosError } from "axios";

type ApiErrorBody =
  | {
      detail?: string;
      error?: string;
      message?: string;
    }
  | undefined;

export function getApiErrorMessage(error: unknown): string {
  const anyErr = error as AxiosError<ApiErrorBody> | Error | undefined;

  if (anyErr && typeof (anyErr as AxiosError).isAxiosError === "boolean") {
    const ax = anyErr as AxiosError<ApiErrorBody>;
    const detail = ax.response?.data?.detail;
    const message = ax.response?.data?.message;
    const errorText = ax.response?.data?.error;
    return detail || message || errorText || ax.message || "Unknown API error";
  }

  if (anyErr instanceof Error) return anyErr.message;
  return "Unknown error";
}

