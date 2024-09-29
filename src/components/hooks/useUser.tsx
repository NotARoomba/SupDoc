import { User } from "@/backend/models/user";
import { STATUS_CODES, UserType } from "@/backend/models/util";
import { callAPI, logout } from "components/utils/Functions";
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
  user: User;
  userEdit: User;
  userType: UserType | undefined;
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
  const [user, setUser] = useState<User>({} as User);
  const [userEdit, setUserEdit] = useState<User>({} as User);
  const [userType, setUserType] = useState<UserType>();
  const fetchUser = async () => {
    setLoading(true);
    const ut = (await SecureStore.getItemAsync(
      process.env.EXPO_PUBLIC_KEY_NAME_TYPE,
    )) as UserType;
    if (!ut) return setLoading(false);
    setUserType(ut);
    const res = await callAPI(
      `/${ut == UserType.DOCTOR ? "doctors" : "patients"}/`,
      "GET",
    );
    if (res.status == STATUS_CODES.USER_NOT_FOUND) return await logout();
    else if (res.status == STATUS_CODES.GENERIC_ERROR)
      return Alert.alert(t("error"), t("errors.fetchData"));
    setUser(res.user);
    setUserEdit({
      ...res.user,
      number: parsePhoneNumber(res.user.number)?.nationalNumber,
    });
    if (ut == UserType.DOCTOR) await Image.prefetch(res.user.picture);
    setLoading(false);
  };

  const updateUser = (user: User) => {};

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
