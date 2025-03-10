/* eslint-disable @typescript-eslint/no-explicit-any */
// import axios from "axios";
import { AxiosError, AxiosResponse } from "axios";
import { axiosClient } from "../lib/axiosClient";

export type AsyncDispatcherReturnType = Promise<
  (AxiosResponse | AxiosError | string | null)[]
>;

export function debounce(fn: (...args: any[]) => void, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return function (...args: any[]) {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

async function asyncDispatcher(
  fn: (...args: any[]) => Promise<AxiosResponse | AxiosError>,
  ...args: any[]
): AsyncDispatcherReturnType {
  try {
    const res = await fn(...args);
    return [res, null];
  } catch (error) {
    console.log("Catching in asyncDispatcher ", error);
    return [null, error instanceof AxiosError ? error : "Server error!"];
  }
}

export const AuthAPI = {
  login: async (data: object) => {
    // return await axiosClient.post("/auth/login", data);
    return await asyncDispatcher(axiosClient.post, "/auth/login", data);
  },
  logout: async () => {
    return await axiosClient.post("/auth/logout", {});
  },
  getUser: async () => {
    return await axiosClient.get("/auth/user");
  },
  serverKey: async () => {
    return await axiosClient.get("/auth/server-key");
  },
  register: async (data: object, stage: string) => {
    return await asyncDispatcher(
      axiosClient.post,
      `/auth/register/${stage}`,
      data
    );
  },
  getToken: async (code: string) => {
    return await axiosClient.get(`/auth/token?code=${code}`)
  }
};

// export const checkUniqueIdDebounce = async (
//   uniqueId: string,
//   type: string
// ) => {};

type QueryStringType = {
  userId: string;
};

type KeeperNoteResourceMethodsType = {
  sync: (
    data: object,
    query: QueryStringType
  ) => Promise<AxiosResponse<any, any>>;
  fetch: (query: QueryStringType) => Promise<AxiosResponse<any, any>>;
  delete: (
    id: string,
    query: QueryStringType
  ) => Promise<AxiosResponse<any, any>>;
  syncOne: (
    data: object & { id: string },
    query: QueryStringType
  ) => Promise<AxiosResponse<any, any>>;
  share: (
    // data: object & { id: string },
    id: string,
    query: QueryStringType
  ) => Promise<AxiosResponse<any, any>>;
  revokeSharing: (
    id: string,
    query: QueryStringType
  ) => Promise<AxiosResponse<any, any>>;
  fetchShared: (permalink: string) => Promise<AxiosResponse<any, any>>;
};

type KeeperTagResourceMethodsType = {
  fetch: (query: QueryStringType) => Promise<AxiosResponse<any, any>>;
};

export type KeeperAPIType = {
  NOTES: KeeperNoteResourceMethodsType;
  TAGS: KeeperTagResourceMethodsType;
};

export const KeeperAPI: KeeperAPIType = {
  NOTES: {
    sync: async (data, { userId }) => {
      return await axiosClient.post(`/rs/keeper/note?userId=${userId}`, data);
    },
    fetch: async ({ userId }) => {
      return await axiosClient.get(`/rs/keeper/note?userId=${userId}`);
    },
    delete: async (id, { userId }) => {
      return await axiosClient.delete(`/rs/keeper/note/${id}?userId=${userId}`);
    },
    syncOne: async (data, { userId }) => {
      return await axiosClient.post(
        `/rs/keeper/note/${data.id}?userId=${userId}`,
        data
      );
    },
    share: async (id, { userId }) => {
      return await axiosClient.put(
        `/rs/keeper/note/${id}/share?userId=${userId}`
      );
    },
    revokeSharing: async (id, { userId }) => {
      return await axiosClient.delete(
        `/rs/keeper/note/${id}/share?userId=${userId}`
      );
    },
    fetchShared: async (permalink) => {
      return await axiosClient.get(`/rs/keeper/shared/${permalink}`);
    },
  },
  TAGS: {
    fetch: async ({ userId }) => {
      return await axiosClient.get(`/rs/keeper/tag?userId=${userId}`);
    },
  },
};

export const getKeeperResourceMethods = (key: keyof KeeperAPIType) => {
  return KeeperAPI[key];
};
