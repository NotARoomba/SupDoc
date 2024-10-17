import Comment from "@/backend/models/comment";
import Icons from "@expo/vector-icons/Octicons";
import { usePosts } from "components/hooks/usePosts";
import { useUser } from "components/hooks/useUser";
import { CommentBlockProps } from "components/utils/Types";
import { router } from "expo-router";
import { ObjectId } from "mongodb";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import Reanimated, {
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  FadeOutUp,
} from "react-native-reanimated";

export default function CommentBlock({
  comments,
  post,
  parent,
  replyingTo,
  setReplyingTo,
}: CommentBlockProps) {
  const { t } = useTranslation();
  const { user } = useUser();
  const [currentComments, setCurrentComments] = useState(comments);
  const [likesData, setLikesData] = useState<{
    [key: string]: { liked: boolean; likes: number };
  }>({});
  const { likeComment, reportComment } = usePosts();

  useEffect(() => {
    const initialLikesData = comments.reduce(
      (acc, comment) => {
        acc[comment._id.toString()] = {
          liked: comment.likes.includes(user?._id as ObjectId),
          likes: comment.likes.length,
        };
        return acc;
      },
      {} as { [key: string]: { liked: boolean; likes: number } },
    );

    setLikesData(initialLikesData);
    setCurrentComments(comments);
  }, [comments]);

  const handleLike = (commentID: ObjectId) => {
    setLikesData((prev) => ({
      ...prev,
      [commentID.toString()]: {
        liked: !prev[commentID.toString()].liked,
        likes:
          prev[commentID.toString()].likes +
          (prev[commentID.toString()].liked ? -1 : 1),
      },
    }));
    likeComment(post, commentID);
  };

  return (
    <Reanimated.View
      entering={FadeInUp.duration(500)}
      exiting={FadeOutDown.duration(500)}
      style={{ flex: 1 }}
    >
      {currentComments.map((comment) => {
        const isReplyingToThisComment = replyingTo === comment._id;
        const { liked, likes } = likesData[comment._id.toString()] || {
          liked: false,
          likes: 0,
        };

        return (
          <Reanimated.View
            key={comment._id?.toString()}
            entering={FadeInUp.delay(100 * (comments.indexOf(comment) + 1))}
            exiting={FadeOutDown.duration(300)}
            className={`mb-4  rounded-xl py-2 
            ${isReplyingToThisComment ? " dark:bg-oxford_blue bg-blue_munsell/50 transition-all duration-500" : "bg-transparent transition-all duration-500"}
            `}
          >
            <TouchableOpacity
              onPress={() => {
                setReplyingTo(comment._id == replyingTo ? null : comment._id);
              }}
              delayPressIn={150}
              className="flex flex-col"
            >
              <TouchableOpacity
                className="w-fit flex"
                onPress={() =>
                  router.navigate({
                    pathname:
                      comment.commenter == user?._id
                        ? "/(tabs)/profile"
                        : "/User",
                    params: { id: comment.commenter.toString() as string },
                  })
                }
              >
                <View className="w-fit mx-2">
                  <Text className="dark:text-powder_blue text-midnight_green text-lg min-w-fit max-w-fit font-bold">
                    {comment.name}{" "}
                    {comment.commenter == user?._id ? t("posts.you") : ""}
                  </Text>
                </View>
              </TouchableOpacity>
              <Text className="dark:text-ivory mx-2 text-oxford_blue text-md">
                {comment.text}
              </Text>

              <View className="flex flex-row mt-2 justify-end gap-x-8">
                <View className="flex flex-row">
                  {/* Grouped Like and Reply */}
                  <TouchableOpacity
                    className="flex flex-row gap-x-1"
                    onPress={() => {
                      handleLike(comment._id);
                    }}
                  >
                    <Icons
                      name="heart"
                      size={24}
                      color={liked ? "red" : "gray"}
                    />
                    <Text className="dark:text-ivory text-midnight_green text-center my-auto">
                      {likes}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Conditional Report Button */}
                {isReplyingToThisComment && (
                  <Reanimated.View
                    entering={FadeInUp.delay(200)}
                    exiting={FadeOutDown.duration(200)}
                  >
                    <TouchableOpacity
                      onPress={() => reportComment(post, comment._id)}
                    >
                      <Icons name="report" size={24} color="red" />
                    </TouchableOpacity>
                  </Reanimated.View>
                )}
              </View>

              {/* Nested Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <Reanimated.View
                  entering={FadeInDown.delay(200)}
                  exiting={FadeOutUp.duration(200)}
                  className={`pl-4 border-l border-gray-500 mt-2 rounded-xl rounded-l-none ${
                    isReplyingToThisComment
                      ? " dark:bg-oxford_blue "
                      : "bg-transparent"
                  }`}
                >
                  <CommentBlock
                    comments={comment.replies as unknown as Comment[]}
                    post={post}
                    parent={comment._id as ObjectId}
                    replyingTo={replyingTo}
                    setReplyingTo={setReplyingTo}
                  />
                </Reanimated.View>
              )}
            </TouchableOpacity>
          </Reanimated.View>
        );
      })}
    </Reanimated.View>
  );
}
