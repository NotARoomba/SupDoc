import Post from "@/backend/models/post";
import { STATUS_CODES, UserType } from "@/backend/models/util";
import { callAPI, logout, uploadImages } from "components/utils/Functions";
import { Image } from "expo-image";
import { SplashScreen, router } from "expo-router";
import { t } from "i18next";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Alert } from "react-native";
import { useLoading } from "./useLoading";
import { useUser } from "./useUser";

// Define the types for the context
interface PostsContextType {
  posts: Post[];
  postEdit: Post | undefined;
  savedPosts: Post[];
  setPostEdit: (post: Post) => void;
  resetPostEdit: () => void;
  fetchPosts: () => void;
  savePost: (post: Post) => Promise<boolean>;
  deletePost: (id: string) => Promise<void>;
  addComment: (id: string, isParent?: boolean) => Promise<void>;
  createPost: () => Promise<void>;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

// Create a provider component
interface PostsProviderProps {
  children: ReactNode;
}

export const PostsProvider: React.FC<PostsProviderProps> = ({ children }) => {
  const { setLoading } = useLoading();
  const [posts, setPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [postEdit, setPostEdit] = useState<Post>();
  const { userType } = useUser();
  const fetchPosts = async () => {
    setLoading(true);
    const res = await callAPI(
      `/${userType == UserType.DOCTOR ? "doctors" : "patients"}/posts/${userType == UserType.DOCTOR ? (posts.length == 0 ? 0 : posts[posts.length - 1].timestamp) : ""}`,
      "GET",
    );
    if (res.status !== STATUS_CODES.SUCCESS)
      return res.status == STATUS_CODES.UNAUTHORIZED
        ? await logout()
        : Alert.alert(t("error"), t(STATUS_CODES[res.status]));
    setPosts(res.posts);
    await Image.prefetch(
      (res.posts as Post[]).map((v: Post) => v.images).flat(),
    );
    setLoading(false);
  };
  const fetchSavedPosts = async () => {
    setLoading(true);
    const res = await callAPI(
      `/doctors/saved/${posts.length == 0 ? 0 : posts[posts.length - 1].timestamp}`,
      "GET",
    );
    if (res.status !== STATUS_CODES.SUCCESS)
      return res.status == STATUS_CODES.UNAUTHORIZED
        ? await logout()
        : Alert.alert(t("error"), t(STATUS_CODES[res.status]));
    setSavedPosts(res.posts);
    setLoading(false);
  };
  const savePost = async (post: Post) => {
    const res = await callAPI(`/posts/${post._id?.toString()}/save`, "GET");
    if (res.status !== STATUS_CODES.SUCCESS) {
      Alert.alert(t("error"), t(STATUS_CODES[res.status]));
      return false;
    }
    const found = savedPosts.find((v) => v._id === post._id);
    if (found) setSavedPosts(savedPosts.filter((v) => v._id !== post._id));
    else setSavedPosts([...savedPosts, post]);
    return true;
  };

  const deletePost = async (id: string) => {};

  const addComment = async (id: string, isParent: boolean = false) => {};

  const resetPostEdit = () => {
    setPostEdit({
      title: "",
      description: "",
      images: [],
      patient: 0,
      reports: [],
      timestamp: 0,
      comments: [],
    } as Post);
  };

  const createPost = async () => {
    setLoading(true);
    if (!postEdit) return;
    // let images = [];
    // for (let i = 0; i < postData.images.length; i++)
    //   images[i] = `data:image/png;base64,${await FileSystem.readAsStringAsync(
    //     postData.images[i],
    //     {
    //       encoding: "base64",
    //     },
    //   )}`;
    const imgRes = await uploadImages(postEdit.images);
    if (imgRes.status !== STATUS_CODES.SUCCESS) {
      setLoading(false);
      return Alert.alert(t("error"), t(STATUS_CODES[imgRes.status]));
    }
    const res = await callAPI(`/posts/create`, "POST", {
      ...postEdit,
      images: imgRes.urls,
    });
    if (res.status !== STATUS_CODES.SUCCESS)
      return Alert.alert("Error", "There was an error uploading your post!");
    else {
      setPosts([...posts, postEdit]);
      resetPostEdit();
      setLoading(false);
      router.navigate({ pathname: "/(tabs)/", params: { refresh: 1 } });
      Alert.alert("Success", "Sucessfully uploaded your post!");
    }
  };
  useEffect(() => {
    fetchPosts().then(async () => await SplashScreen.hideAsync());
    if (userType == UserType.DOCTOR) fetchSavedPosts();
  }, []);
  return (
    <PostsContext.Provider
      value={{
        posts,
        postEdit,
        savedPosts,
        setPostEdit,
        resetPostEdit,
        createPost,
        addComment,
        deletePost,
        savePost,
        fetchPosts,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
};

// Custom hook to use the LoadingContext
export const usePosts = (): PostsContextType => {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error("usePosts must be used within a PostsProvider");
  }
  return context;
};
