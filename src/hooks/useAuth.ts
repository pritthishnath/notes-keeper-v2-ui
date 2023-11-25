import { useContext } from "react";
import { AsyncDispatcherReturnType, AuthAPI } from "../utils/api-helper";
import { AxiosResponse } from "axios";
import { AuthContext } from "../App";
import { AuthContextStateType } from "../types";

export type AuthDispatcherType = (
  fn: Function,
  data?: object,
  stage?: string
) => AsyncDispatcherReturnType;

export function useAuth() {
  const [{ isAuth, authLoading, authUserLoading }, setAuthContext] =
    useContext(AuthContext);

  const authDispatcher: AuthDispatcherType = async (fn, data, stage) => {
    setAuthContext((state: AuthContextStateType) => ({
      ...state,
      authLoading: true,
    }));

    const [res, err] = await fn(
      typeof data === "object" ? data : undefined,
      stage
    );

    // if (err instanceof AxiosError) {
    //   setAuthContext((state: AuthContextStateType) => ({
    //     ...state,
    //     authLoading: false,
    //   }));
    // } else {
    // if (res && !res.data?.error) {
    //   setAuthContext((state: AuthContextStateType) => ({
    //     ...state,
    //     isAuth: res.data.user !== undefined ? res.data.user : true,
    //     authLoading: false,
    //   }));
    // }

    setAuthContext((state: AuthContextStateType) => ({
      ...state,
      authLoading: false,
    }));
    return [res, err];
  };

  const logout = async () => {
    try {
      setAuthContext((state: AuthContextStateType) => ({
        ...state,
        authLoading: true,
      }));

      const res = await AuthAPI.logout();

      setAuthContext((state: AuthContextStateType) => ({
        ...state,
        isAuth: false,
        authLoading: false,
      }));

      return res;
    } catch (error) {
      throw error;
    }
  };

  return {
    isAuth,
    authLoading,
    authUserLoading,
    authDispatcher,
    logout,
  } as {
    isAuth: typeof isAuth;
    authLoading: typeof authLoading;
    authUserLoading: typeof authUserLoading;
    authDispatcher: AuthDispatcherType;
    logout: () => Promise<AxiosResponse<any, any>>;
  };
}
