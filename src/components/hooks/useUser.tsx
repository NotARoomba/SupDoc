import { User } from "@/backend/models/user";
import { STATUS_CODES, UserType } from "@/backend/models/util";
import { callAPI, handleReport, logout } from "components/utils/Functions";
import { Image } from "expo-image";
import * as SecureStore from "expo-secure-store";
import { parsePhoneNumber } from "libphonenumber-js";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";
import { useLoading } from "./useLoading";

interface UserContextType {
  user: User | null;
  userEdit: User | null;
  userType: UserType | null;
  reportUser: (id: string, userType: UserType) => void;
  deleteUser: () => void;
  fetchUser: () => Promise<void>;
  setUser: (user: User) => void;
  setUserEdit: (user: User) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { t } = useTranslation();
  const { setLoading } = useLoading();
  const [user, setUser] = useState<User | null>(null);
  const [userEdit, setUserEdit] = useState<User | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const fetchUser = async () => {
    // setLoading(true);
    const ut = (await SecureStore.getItemAsync(
      process.env.EXPO_PUBLIC_KEY_NAME_TYPE,
    )) as UserType;
    if (!ut) return; //setLoading(false);
    setUserType(ut);
    const res = await callAPI(
      `/${ut == UserType.DOCTOR ? "doctors" : "patients"}`,
      "GET",
    );
    // setLoading(false);
    if (res.status !== STATUS_CODES.SUCCESS) return; // setLoading(false);
    if (res.status == STATUS_CODES.USER_NOT_FOUND) return await logout();
    else if (res.status == STATUS_CODES.GENERIC_ERROR)
      return Alert.alert(t("error"), t("errors.fetchData"));
    setUser(res.user);
    setUserEdit({
      ...res.user,
      number: parsePhoneNumber(res.user.number)?.nationalNumber,
    });
    if (ut == UserType.DOCTOR) await Image.prefetch(res.user.picture);
    // setLoading(false);
  };

  const updateUser = (user: User) => {};

  const reportUser = async (id: string, ut: UserType) => {
    try {
      const { reason, evidence } = await handleReport(
        userType as UserType,
        t,
        false,
      );
      const res = await callAPI(`/users/report`, "POST", {
        reported: id,
        userType: ut,
        reason,
        evidence,
      });
      if (res.status !== STATUS_CODES.SUCCESS) {
        return Alert.alert(t("error"), t(`errors.${STATUS_CODES[res.status]}`));
      }
      Alert.alert(t("success"), t("successes.reportComment"));
    } catch {}
  };

  const deleteUser = async () => {
    const res = await callAPI("/users/delete", "POST", { userType });
    if (res.status !== STATUS_CODES.SUCCESS) {
      return Alert.alert(t("error"), t(`errors.${STATUS_CODES[res.status]}`));
    }
    await logout();
  };

  useEffect(() => {
    fetchUser();
  }, []);
  return (
    <UserContext.Provider
      value={{
        user,
        userEdit,
        userType,
        reportUser,
        setUserEdit,
        setUser,
        fetchUser,
        deleteUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("usePosts must be used within a PostsProvider");
  }
  return context;
};
