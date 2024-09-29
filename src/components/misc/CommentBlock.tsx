import Comment from "@/backend/models/comment";
import Icons from "@expo/vector-icons/Octicons";
import { usePosts } from "components/hooks/usePosts";
import { useUser } from "components/hooks/useUser";
import { CommentBlockProps } from "components/utils/Types";
import { router } from "expo-router";
import { ObjectId } from "mongodb";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
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
          liked: comment.likes.includes(user._id as ObjectId),
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
            className={`mb-4  rounded-xl px-4 py-2 
            ${isReplyingToThisComment ? " bg-oxford_blue transition-all duration-500" : "bg-transparent transition-all duration-500"}
            `}
          >
            <TouchableOpacity
              onPress={() => {
                setReplyingTo(comment._id == replyingTo ? null : comment._id);
              }}
            >
              <TouchableOpacity onPress={() => router.navigate({pathname: comment.commenter == user._id ? '/(tabs)/profile':"/User", params: {id: comment.commenter.toString() as string}})}>
              <Text className="text-powder_blue text-lg font-bold">
                {comment.name}{" "}{comment.commenter == user._id ? t("you") : ''}
              </Text></TouchableOpacity>
              <Text className="text-ivory text-md">{comment.text}</Text>

              <View className="flex flex-row mt-2 justify-between">
                <View className="flex flex-row space-x-6 align-middle">
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
                    <Text className="text-ivory text-center my-auto">
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
                      ? " bg-oxford_blue-500"
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
