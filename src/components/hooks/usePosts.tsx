import Comment from "@/backend/models/comment";
import SupDocEvents from "@/backend/models/events";
import Fact from "@/backend/models/fact";
import { PatientMetrics } from "@/backend/models/metrics";
import Post from "@/backend/models/post";
import STATUS_CODES from "@/backend/models/status";
import { UserType } from "@/backend/models/util";
import { FlashList } from "@shopify/flash-list";
import {
  callAPI,
  handleReport,
  logout,
  uploadImages,
} from "components/utils/Functions";
import { Image } from "expo-image";
import { router } from "expo-router";
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

interface PostsContextType {
  posts: Post[];
  facts: Fact[];
  feed: Array<Post | Fact>;
  postEdit: Post | undefined;
  savedPosts: Post[];
  listRef: MutableRefObject<FlashList<Post> | null>;
  fetchFacts: () => Promise<void>;
  likeFact: (id: ObjectId) => Promise<void>;
  dislikeFact: (id: ObjectId) => Promise<void>;
  refreshPosts: (saved?: boolean) => Promise<void>;
  addPosts: (newPosts: Post[]) => void;
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

interface PostsProviderProps {
  children: ReactNode;
}

export const PostsProvider: React.FC<PostsProviderProps> = ({ children }) => {
  const { t } = useTranslation();
  const { setLoading } = useLoading();
  const [posts, setPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [facts, setFacts] = useState<Fact[]>([]);
  const [feed, setFeed] = useState<Array<Post | Fact>>([]); // Feed contains both posts and facts
  const [postEdit, setPostEdit] = useState<Post>();
  const { userType, user, socket } = useUser();
  const listRef = useRef<FlashList<Post> | null>(null);

  const shuffleFactsIntoFeed = (posts: Post[], facts: Fact[]) => {
    let shuffledFeed: Array<Post | Fact> = [...posts];

    if (facts.length > 0) {
      let factIndex = 0;
      let postIndex = 0;

      // Randomly shuffle a fact between 3-10 posts
      while (factIndex < facts.length && postIndex < shuffledFeed.length) {
        const randomInterval = Math.floor(Math.random() * (4 - 3 + 1)) + 3; // Random between 3 to 10
        postIndex = Math.min(postIndex + randomInterval, shuffledFeed.length);
        shuffledFeed.splice(postIndex, 0, facts[factIndex]); // Insert fact at random interval
        factIndex++;
        postIndex++; // Increment to avoid endless loop
      }
    }

    return shuffledFeed;
  };

  const fetchFacts = async () => {
    // setLoading(true);
    if (!userType) return setLoading(false);

    const res = await callAPI("/facts", "GET");

    if (res.status !== STATUS_CODES.SUCCESS) {
      setLoading(false);
      return res.status == STATUS_CODES.UNAUTHORIZED
        ? await logout()
        : Alert.alert(t("error"), t(`errors.${STATUS_CODES[res.status]}`));
    }
    setFacts(res.facts);

    // Combine posts and facts into the feed, shuffling facts randomly between posts
    // const newFeed = shuffleFactsIntoFeed(posts, res.facts);
    // setFeed(newFeed);

    // setLoading(false);
    return res.facts;
  };

  const likeFact = async (id: ObjectId) => {
    const res = await callAPI(`/facts/${id.toString()}/like`, "GET");
    if (res.status !== STATUS_CODES.SUCCESS) {
      return res.status == STATUS_CODES.UNAUTHORIZED
        ? await logout()
        : Alert.alert(t("error"), t(`errors.${STATUS_CODES[res.status]}`));
    }
  };

  const dislikeFact = async (id: ObjectId) => {
    const res = await callAPI(`/facts/${id.toString()}/dislike`, "GET");
    if (res.status !== STATUS_CODES.SUCCESS) {
      return res.status == STATUS_CODES.UNAUTHORIZED
        ? await logout()
        : Alert.alert(t("error"), t(`errors.${STATUS_CODES[res.status]}`));
    }
  };

  const fetchPosts = async (refresh = false) => {
    // setLoading(true);
    if (!userType) return;
    const f = await fetchFacts();
    const update = async (res: { status: STATUS_CODES; posts: Post[] }) => {
      if (res.status !== STATUS_CODES.SUCCESS) {
        if (res.status == STATUS_CODES.UNAUTHORIZED) await logout();
        else {
          setTimeout(
            () =>
              Alert.alert(t("error"), t(`errors.${STATUS_CODES[res.status]}`)),
            300,
          );
          return;
        }
      }
      if (userType == UserType.DOCTOR) await fetchSavedPosts();
      setPosts((old) =>
        refresh
          ? res.posts
          : old.length == 0
            ? res.posts
            : [...old, ...res.posts],
      );
      Image.prefetch((res.posts as Post[]).map((v: Post) => v.images).flat());
      // After fetching posts, combine with facts into feed
      if (res.posts.length !== 0) {
        const newFeed = shuffleFactsIntoFeed(res.posts, f);
        setFeed(newFeed);
      }
      // listRef.current?.prepareForLayoutAnimationRender();
      // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setLoading(false);
    };
    if (socket) {
      socket.emit(
        SupDocEvents.FETCH_POSTS,
        refresh
          ? Date.now()
          : posts.length == 0
            ? Date.now()
            : posts[posts.length - 1].timestamp,
        async (res: { status: STATUS_CODES; posts: Post[] }) =>
          await update(res),
      );
    } else
      await update(
        await callAPI(
          `/${userType == UserType.DOCTOR ? "doctors" : "patients"}/posts/${userType == UserType.DOCTOR ? (refresh ? Date.now() : posts.length == 0 ? Date.now() : posts[posts.length - 1].timestamp) : ""}`,
          "GET",
        ),
      );
  };
  const fetchSavedPosts = async () => {
    // setLoading(true);
    const res = await callAPI(
      `/doctors/saved/${posts.length == 0 ? Date.now() : posts[posts.length - 1].timestamp}`,
      "GET",
    );
    if (res.status !== STATUS_CODES.SUCCESS) {
      // setLoading(false);
      return res.status == STATUS_CODES.UNAUTHORIZED
        ? await logout()
        : Alert.alert(t("error"), t(`errors.${STATUS_CODES[res.status]}`));
    }

    setSavedPosts(res.posts);
    // setLoading(false);
  };
  const savePost = async (post: Post) => {
    const res = await callAPI(`/posts/${post._id?.toString()}/save`, "GET");
    if (res.status !== STATUS_CODES.SUCCESS) {
      Alert.alert(t("error"), t(`errors.${STATUS_CODES[res.status]}`));
      return false;
    }

    setSavedPosts((old) =>
      old.find((v) => v._id === post._id)
        ? old.filter((v) => v._id !== post._id)
        : [...old, post],
    );
    return true;
  };

  const addPosts = (newPosts: Post[]) => {
    let finalPosts: Post[] = [];
    newPosts.forEach((v) =>
      !posts.find((z) => z._id == v._id) ? finalPosts.push(v) : 0,
    );
    if (userType == UserType.DOCTOR)
      setFeed(shuffleFactsIntoFeed([...posts, ...finalPosts], facts));
    setPosts((old) => [...old, ...finalPosts]);
  };

  const deletePost = async (id: string) => {
    setLoading(true);
    const res = await callAPI(`/posts/${id}/delete`, "GET");
    setLoading(false);
    if (res.status !== STATUS_CODES.SUCCESS)
      return Alert.alert(t("error"), t(`errors.${STATUS_CODES[res.status]}`));
    else {
      Alert.alert(t("success"), t("successes.deletePost"));
      listRef.current?.prepareForLayoutAnimationRender();
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setPosts((old) => old.filter((v) => v._id?.toString() !== id));
      setSavedPosts((old) => old.filter((v) => v._id?.toString() !== id));
      router.navigate("/(tabs)/");
    }
  };

  const addComment = async (
    post: ObjectId,
    text: string,
    parent: ObjectId | null,
  ) => {
    const update = (res: { status: STATUS_CODES; comments: Comment[] }) => {
      if (res.status !== STATUS_CODES.SUCCESS) {
        return Alert.alert(t("error"), t(`errors.${STATUS_CODES[res.status]}`));
      }

      setPosts((old) =>
        old.map((p) => (post == p._id ? { ...p, comments: res.comments } : p)),
      );

      if (userType == UserType.DOCTOR) {
        setFeed((old) =>
          old.map((p) =>
            post == p._id ? { ...p, comments: res.comments } : p,
          ),
        );

        setSavedPosts((old) =>
          old.map((p) =>
            post == p._id ? { ...p, comments: res.comments } : p,
          ),
        );
      }
    };
    if (socket) {
      socket.emit(
        SupDocEvents.POST_COMMENT,
        post,
        { text, parent, commenter: user?._id } as Comment,
        (res: { status: STATUS_CODES; comments: Comment[]; like?: boolean }) =>
          update(res),
      );
    } else
      update(
        await callAPI(`/posts/${post}/comment`, "POST", {
          text,
          parent,
          commenter: user?._id,
        }),
      );
  };

  const likeComment = async (post: ObjectId, commentID: ObjectId) => {
    const update = (res: { status: STATUS_CODES; comments: Comment[] }) => {
      if (res.status !== STATUS_CODES.SUCCESS) {
        return Alert.alert(t("error"), t(`errors.${STATUS_CODES[res.status]}`));
      }

      setPosts((old) =>
        old.map((p) => (post == p._id ? { ...p, comments: res.comments } : p)),
      );

      if (userType == UserType.DOCTOR) {
        setFeed((old) =>
          old.map((p) =>
            post == p._id ? { ...p, comments: res.comments } : p,
          ),
        );

        setSavedPosts((old) =>
          old.map((p) =>
            post == p._id ? { ...p, comments: res.comments } : p,
          ),
        );
      }
    };
    if (socket) {
      socket.emit(
        SupDocEvents.LIKE_COMMENT,
        post,
        commentID,
        (res: { status: STATUS_CODES; comments: Comment[] }) => update(res),
      );
    } else
      update(
        await callAPI(`/posts/${post}/comments/${commentID}/like`, "POST"),
      );
  };

  const reportComment = async (post: ObjectId, commentID: ObjectId) => {
    try {
      const { reason, evidence } = await handleReport(userType as UserType, t);
      const res = await callAPI(
        `/posts/${post}/comments/${commentID}/report`,
        "POST",
        {
          reason,
          evidence,
        },
      );
      if (res.status !== STATUS_CODES.SUCCESS) {
        return Alert.alert(t("error"), t(`errors.${STATUS_CODES[res.status]}`));
      }
      Alert.alert(t("success"), t("successes.reportComment"));
    } catch {}
  };
  const reportPost = async (id: string) => {
    try {
      const { reason, evidence } = await handleReport(
        userType as UserType,
        t,
        false,
      );
      if (!reason) return;
      const res = await callAPI(`/posts/${id}/report`, "POST", {
        reason,
        evidence,
      });
      if (res.status !== STATUS_CODES.SUCCESS)
        return Alert.alert(t("error"), t(`errors.${STATUS_CODES[res.status]}`));

      Alert.alert(t("success"), t("successes.submitReport"));
    } catch {}
  };
  const resetPostEdit = () => {
    setPostEdit({
      title: "",
      description: "",
      images: [],
      patient: "0" as unknown as ObjectId,
      reports: [],
      info: {} as PatientMetrics,
      timestamp: 0,
      comments: [],
    } as Post);
  };
  const refreshPosts = async (saved: boolean = false) => {
    if (saved) {
      setSavedPosts([]);
      await fetchSavedPosts();
    } else {
      setPosts([]);
      // setFeed([]);
      await fetchPosts(true);
    }
  };
  const createPost = async () => {
    setLoading(true);
    if (!postEdit) return;
    let imgRes = { status: STATUS_CODES.SUCCESS, urls: [] };
    if (postEdit.images.length !== 0) {
      imgRes = await uploadImages(postEdit.images);
      if (imgRes.status !== STATUS_CODES.SUCCESS) {
        setLoading(false);
        return Alert.alert(
          t("error"),
          t(`errors.${STATUS_CODES[imgRes.status]}`),
        );
      }
    }
    const res = await callAPI(`/posts/create`, "POST", {
      ...postEdit,
      images: imgRes.urls,
    });
    if (res.status !== STATUS_CODES.SUCCESS) {
      setLoading(false);
      return Alert.alert(t("error"), t("errors.postUploading"));
    } else {
      setPosts([...posts, res.post]);
      resetPostEdit();
      setLoading(false);
      router.navigate({ pathname: "/(tabs)/", params: { refresh: 1 } });
      Alert.alert(t("success"), t("successes.postUploading"));
    }
  };

  useEffect(() => {
    if (socket) {
      socket.emit(
        SupDocEvents.FETCH_POSTS,
        Date.now(),
        async (res: { status: STATUS_CODES; posts: Post[] }) => {
          if (res.status !== STATUS_CODES.SUCCESS) {
            if (res.status == STATUS_CODES.UNAUTHORIZED) return logout();
            else {
              setTimeout(
                () =>
                  Alert.alert(
                    t("error"),
                    t(`errors.${STATUS_CODES[res.status]}`),
                  ),
                300,
              );
              return;
            }
          }
          const f = await fetchFacts();
          if (userType == UserType.DOCTOR) await fetchSavedPosts();
          //   // After removing the item, we can start the animation.
          setPosts(res.posts);
          Image.prefetch(
            (res.posts as Post[]).map((v: Post) => v.images).flat(),
          );
          // After fetching posts, combine with facts into feed
          if (res.posts.length !== 0) {
            const newFeed = shuffleFactsIntoFeed(res.posts, f);
            setFeed(newFeed);
          }
          // listRef.current?.prepareForLayoutAnimationRender();
          // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          // setLoading(false);
        },
      );
      socket.on(
        SupDocEvents.UPDATE_COMMENTS,
        (data: { post: ObjectId; comments: Comment[] }) => {
          // console.log(data)
          // console.log("UPDATE COMMENTS"6);
          setPosts((old) =>
            old.map((p) =>
              data.post == p._id ? { ...p, comments: data.comments } : p,
            ),
          );

          if (userType == UserType.DOCTOR) {
            setFeed((old) =>
              old.map((p) =>
                data.post == p._id ? { ...p, comments: data.comments } : p,
              ),
            );

            setSavedPosts((old) =>
              old.map((p) =>
                data.post == p._id ? { ...p, comments: data.comments } : p,
              ),
            );
          }
        },
      );

      if (userType == UserType.DOCTOR)
        socket.on(
          SupDocEvents.UPDATE_FACT,
          (data: { fact: ObjectId; likes: string[] }) => {
            setFacts((old) =>
              old.map((f) =>
                data.fact == f._id ? { ...f, likes: data.likes } : f,
              ),
            );

            setFeed((old) =>
              old.map((p) =>
                data.fact == p._id ? { ...p, likes: data.likes } : p,
              ),
            );
          },
        );
    }
  }, [socket]);

  const postsContextValue = useMemo(
    () => ({
      posts,
      facts,
      postEdit,
      savedPosts,
      listRef,
      feed,
      fetchFacts,
      likeFact,
      dislikeFact,
      refreshPosts,
      addPosts,
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
    [posts, feed, userType, postEdit, savedPosts, listRef],
  );
  return (
    <PostsContext.Provider value={postsContextValue}>
      {children}
    </PostsContext.Provider>
  );
};

export const usePosts = (): PostsContextType => {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error("usePosts must be used within a PostsProvider");
  }
  return context;
};
