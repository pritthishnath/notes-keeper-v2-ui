import { useEffect, useMemo, useState } from "react";
import { KeeperAPI, KeeperAPIType } from "../utils/api-helper";
import { useAuth } from "./useAuth";
import { useLocalStorage } from "./useLocalStorage";

type CommonDataType = {
  id: string;
  label?: string;
  _id?: string;
  synced: boolean;
  updatedAt?: Date;
  createdBy?: string;
  permalink?: string;
};

export function useSyncStore<T extends CommonDataType>(
  key: string,
  initialValue: T[] | (() => T[])
) {
  const [data, setData] = useLocalStorage<T[]>(key, initialValue);
  const [loading, setLoading] = useState(false);

  const { isAuth } = useAuth();

  const localData = useMemo(() => {
    return data;
  }, [data]);

  useEffect(() => {
    fetchFromServer();
  }, [isAuth]);

  async function fetchFromServer() {
    if (typeof isAuth !== "boolean") {
      setLoading(true);
      const res = await KeeperAPI[key as keyof KeeperAPIType].fetch({
        userId: isAuth._id,
      });

      if (res.data) {
        if (Array.isArray(localData) && Array.isArray(res.data)) {
          /**NOTE - If user logged in, mapping through fetched data to check if any local data overlaps,
           * if any of them overlap, unsynced and fetched data update time is later than local data update time then
           * prioritize the fetched data over local data and vice versa
           */

          const fetchedDataArranged = res.data.map((item: T) => {
            const updateDate = item.updatedAt && new Date(item.updatedAt);

            const serverDataTimeOffset =
              updateDate && updateDate.getTimezoneOffset() * 60000;

            const serverDataUpdatedTime =
              updateDate &&
              serverDataTimeOffset &&
              updateDate.getTime() + serverDataTimeOffset;

            for (let i = 0; i < localData.length; i++) {
              if (localData[i].updatedAt && serverDataUpdatedTime) {
                const localUpdateDate = new Date(
                  localData[i].updatedAt as Date
                );
                const localTimeOffset =
                  localUpdateDate.getTimezoneOffset() * 60000;
                const localUpdateTime =
                  localUpdateDate.getTime() + localTimeOffset;

                if (item.id == localData[i].id) {
                  if (localData[i].synced === true) {
                    return item;
                  } else if (localData[i].synced === false) {
                    if (serverDataUpdatedTime >= localUpdateTime) {
                      return { ...localData[i], ...item };
                    } else return { ...item, ...localData[i] };
                  }
                }
              } else if (localData[i].label === item.label) {
                return { ...localData[i], ...item };
              }
            }

            return item;
          });

          //NOTE - Filtering the remaining local data which does not overlap with the fetched data

          const localDataFiltered = localData.filter((localItem: T) => {
            return !fetchedDataArranged.some((item: T) => {
              return localItem.id === item.id;
            });
          });

          //NOTE - Meging the Modified fetched data and filtered local data

          const newData = [...fetchedDataArranged, ...localDataFiltered];

          setData(newData);
        }
      }
      setLoading(false);
    } else if (typeof isAuth === "boolean") {
      //NOTE - If user not logged in, unsyncing sync properties
      unsyncData();
    }
    setLoading(false);
  }

  function unsyncData() {
    setData((state) => {
      return state.map((item) => {
        const updatedData = {
          ...item,
          synced: false,
        };
        delete updatedData._id;
        delete updatedData.createdBy;
        delete updatedData.permalink;
        return updatedData;
      });
    });
  }

  return {
    data: localData,
    fetchFromServer,
    setData,
    unsyncData,
    dataLoading: loading,
  } as {
    data: T[];
    fetchFromServer: typeof fetchFromServer;
    setData: typeof setData;
    unsyncData: typeof unsyncData;
    dataLoading: typeof loading;
  };
}
