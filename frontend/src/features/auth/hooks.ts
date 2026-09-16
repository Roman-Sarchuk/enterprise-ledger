import { useMutation } from "@tanstack/react-query";
import { forgotPasswordApi, loginApi, registerApi, resetPasswordApi } from "@/features/auth/api";

export function useLoginMutation() {
  return useMutation({
    mutationFn: loginApi,
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: registerApi,
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: forgotPasswordApi,
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: resetPasswordApi,
  });
}

