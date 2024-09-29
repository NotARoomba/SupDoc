import Comment from "@/backend/models/comment";
import { PatientMetrics } from "@/backend/models/metrics";
import Post from "@/backend/models/post";
import { STATUS_CODES, UserType } from "@/backend/models/util";
import { FlashList } from "@shopify/flash-list";
import { callAPI, handleReport, logout, uploadImages } from "components/utils/Functions";
import { Image } from "expo-image";
import { SplashScreen, router } from "expo-router";
import { ObjectId } from "mongodb";
import React, {
  MutableRefObject,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Alert, LayoutAnimation } from "react-native";
import { useLoading } from "./useLoading";
import { useUser } from "./useUser";

// Define the types for the context
interface PostsContextType {
  posts: Post[];
  postEdit: Post | undefined;
  savedPosts: Post[];
  listRef: MutableRefObject<FlashList<Post> | null>;
  updateComments: boolean,
  setUpdateComments: (u: boolean) => void;
  setPostEdit: (post: Post) => void;
  resetPostEdit: () => void;
  fetchPosts: () => Promise<void>;
  savePost: (post: Post) => Promise<boolean>;
  deletePost: (id: string) => Promise<void>;
  reportPost: (id: string) => Promise<void>;
  addComment: (
    post: ObjectId,
    text: string,
    parent: ObjectId | null,
  ) => Promise<void>;
  likeComment: (post: ObjectId, commentID: ObjectId) => Promise<void>;
  reportComment: (post: ObjectId, commentID: ObjectId) => Promise<void>;
  createPost: () => Promise<void>;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

// Create a provider component
interface PostsProviderProps {
  children: ReactNode;
}

export const PostsProvider: React.FC<PostsProviderProps> = ({ children }) => {
  const { t } = useTranslation();
  const { setLoading } = useLoading();
  const [posts, setPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [postEdit, setPostEdit] = useState<Post>();
  const [updateComments, setUpdateComments] = useState(false);
  const { userType, user } = useUser();
  const listRef = useRef<FlashList<Post> | null>(null);
  const fetchPosts = async () => {
    setLoading(true);
    if (!userType) return;
    const res = await callAPI(
      `/${userType == UserType.DOCTOR ? "doctors" : "patients"}/posts/${userType == UserType.DOCTOR ? (posts.length == 0 ? 0 : posts[posts.length - 1].timestamp) : ""}`,
      "GET",
    );
    if (res.status !== STATUS_CODES.SUCCESS)
      return res.status == STATUS_CODES.UNAUTHORIZED
        ? await logout()
        : Alert.alert(t("error"), t(`errors.${STATUS_CODES[res.status]}`));
    setPosts(res.posts);
    Image.prefetch((res.posts as Post[]).map((v: Post) => v.images).flat());
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
        : Alert.alert(t("error"), t(`errors.${STATUS_CODES[res.status]}`));
    setSavedPosts(res.posts);
    setLoading(false);
  };
  const savePost = async (post: Post) => {
    const res = await callAPI(`/posts/${post._id?.toString()}/save`, "GET");
    if (res.status !== STATUS_CODES.SUCCESS) {
      Alert.alert(t("error"), t(`errors.${STATUS_CODES[res.status]}`));
      return false;
    }

    const updatedSavedPosts = savedPosts.find((v) => v._id === post._id)
      ? savedPosts.filter((v) => v._id !== post._id)
      : [...savedPosts, post];
    setSavedPosts(updatedSavedPosts); // Only call setSavedPosts once
    return true;
  };

  const deletePost = async (id: string) => {
    setLoading(true);
    const res = await callAPI(`/posts/${id}/delete`, "GET");
    if (res.status !== STATUS_CODES.SUCCESS)
      return Alert.alert(t("error"), t(`errors.${STATUS_CODES[res.status]}`));
    else {
      Alert.alert(t("success"), t("sucesses.deletePost"));
      setLoading(false);
      listRef.current?.prepareForLayoutAnimationRender();
      // After removing the item, we can start the animation.
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setPosts(posts.filter((v) => v._id?.toString() !== id));
      setSavedPosts(savedPosts.filter((v) => v._id?.toString() !== id));
      // return router.navigate({ pathname: "/(tabs)", params: { refresh: 1 } });
    }
  };

  const updatePostComments = (
    postList: Post[],
    postID: ObjectId,
    updatedComments: Comment[],
  ): Post[] => {
    return postList.map((post) =>
      post._id == postID ? { ...post, comments: updatedComments } : post,
    );
  };

  const addComment = async (
    post: ObjectId,
    text: string,
    parent: ObjectId | null,
  ) => {
    const res = await callAPI(`/posts/${post}/comment`, "POST", {
      text,
      parent,
      commenter: user._id,
    });
    if (res.status !== STATUS_CODES.SUCCESS) {
      return Alert.alert(t("error"), t(`errors.${STATUS_CODES[res.status]}`));
    }
    console.log(res.comments);

    // Update posts
    setPosts((prevPosts) =>
      prevPosts.map((p) =>
        post == (p._id)
          ? { ...p, comments: res.comments } // Make sure to update the comments array
          : p
      )
    );

    // Update saved posts, if necessary
    setSavedPosts((prevSavedPosts) =>
      prevSavedPosts.map((p) =>
      post == (p._id)
          ? { ...p, comments: res.comments } // Update saved posts' comments array
          : p
      )
    );
    setUpdateComments(true);
    // await fetchPosts(); // Re-fetch posts to include the new comment
  };

  // Liking a comment
  const likeComment = async (post: ObjectId, commentID: ObjectId) => {
    const res = await callAPI(
      `/posts/${post}/comments/${commentID}/like`,
      "POST",
    );
    if (res.status !== STATUS_CODES.SUCCESS) {
      return Alert.alert(t("error"), t(`errors.${STATUS_CODES[res.status]}`));
    }
    // setPosts(updatePostComments(posts, post, res.comments));

    // // Update saved posts, if needed
    // setSavedPosts(updatePostComments(savedPosts, post, res.comments));
    // await fetchPosts(); // Re-fetch posts to include the new comment
  };

  // Reporting a comment
  const reportComment = async (post: ObjectId, commentID: ObjectId) => {
    const {reason, evidence} = await handleReport(userType as UserType, false)
    if (!reason) return
    const res = await callAPI(
      `/posts/${post}/comments/${commentID}/report`,
      "POST",{
        reason,
        evidence
      }
    );
    if (res.status !== STATUS_CODES.SUCCESS) {
      return Alert.alert(t("error"), t(`errors.${STATUS_CODES[res.status]}`));
    }
    Alert.alert(t("success"), t("successes.reportComment"));
  };
  const reportPost = async (id: string) => {
    const {reason, evidence} = await handleReport(userType as UserType, false)
    if (!reason) return
    const res = await callAPI(`/posts/${id}/report`, "POST", {reason, evidence});
    if (res.status !== STATUS_CODES.SUCCESS)
      return Alert.alert(t("error"), t(`errors.${STATUS_CODES[res.status]}`));
    
    
    Alert.alert(t("success"), t("successes.submitReport"));
  }
  const resetPostEdit = () => {
    setPostEdit({
      title: "",
      description: "",
      images: [],
      patient: 0,
      reports: [],
      info: {} as PatientMetrics,
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
      return Alert.alert(t("error"), t(`errors.${STATUS_CODES[imgRes.status]}`));
    }
    const res = await callAPI(`/posts/create`, "POST", {
      ...postEdit,
      images: imgRes.urls,
    });
    if (res.status !== STATUS_CODES.SUCCESS)
      return Alert.alert(t("error"), t("errors.postUploading"));
    else {
      setPosts([...posts, res.post]);
      resetPostEdit();
      setLoading(false);
      router.navigate({ pathname: "/(tabs)/", params: { refresh: 1 } });
      Alert.alert(t("success"), t("successes.postUploading"));
    }
  };
  useEffect(() => {
    if (userType) {
      fetchPosts().then(async () => await SplashScreen.hideAsync());
      if (userType == UserType.DOCTOR) fetchSavedPosts();
    }
  }, [userType]);
  const postsContextValue = useMemo(
    () => ({
      posts,
      postEdit,
      savedPosts,
      listRef,
      updateComments,
      setUpdateComments,
      setPostEdit,
      resetPostEdit,
      createPost,
      reportPost,
      addComment,
      likeComment,
      reportComment,
      deletePost,
      savePost,
      fetchPosts,
    }),
    [posts, postEdit, savedPosts, listRef], // Dependencies
  );
  return (
    <PostsContext.Provider value={postsContextValue}>
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
