import { useContext, useEffect } from "react";
import { AuthContext } from "../App";
import { AuthContextStateType } from "../types";
import { AuthAPI } from "../utils/api-helper";

export function useAuthCheck() {
  const [, setAuthContext] = useContext(AuthContext);

  useEffect(() => {
    getUser();
  }, []);

  async function getUser() {
    try {
      setAuthContext((state: AuthContextStateType) => ({
        ...state,
        authUserLoading: true,
      }));

      const res = await AuthAPI.getUser();

      if (res?.data && !res.data?.error && res.data?.user) {
        setAuthContext((state: AuthContextStateType) => ({
          ...state,
          isAuth: res.data.user !== undefined ? res.data.user : true,
          authUserLoading: false,
        }));
      } else {
        setAuthContext((state: AuthContextStateType) => ({
          ...state,
          authUserLoading: false,
        }));
      }
    } catch (error) {
      setAuthContext((state: AuthContextStateType) => ({
        ...state,
        authUserLoading: false,
      }));
    }
  }
}
