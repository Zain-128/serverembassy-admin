import { type ReactNode } from "react";
import { Provider } from "react-redux";
import { store, useAppDispatch, useAppSelector } from "./index";
import { logout as logoutAction } from "./authSlice";
import { adminApi, useGetMeQuery, useLoginMutation } from "./adminApi";

export function ReduxProvider({ children }: { children: ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}

export function useAuth() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);
  const user = useAppSelector((s) => s.auth.user);
  const { isLoading, isFetching } = useGetMeQuery(undefined, { skip: !token });
  const [loginMutation] = useLoginMutation();

  return {
    user,
    isLoading: Boolean(token) && (isLoading || isFetching) && !user,
    login: async (email: string, password: string) => {
      await loginMutation({ email, password }).unwrap();
    },
    logout: () => {
      dispatch(logoutAction());
      dispatch(adminApi.util.resetApiState());
    },
  };
}
