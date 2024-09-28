import Comment from "@/backend/models/comment";
import Icons from "@expo/vector-icons/Octicons";
import { usePosts } from "components/hooks/usePosts";
import { useUser } from "components/hooks/useUser";
import { CommentBlockProps } from "components/utils/Types";
import { ObjectId } from "mongodb";
import { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Reanimated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  FadeOutDown,
  FadeOutUp,
} from "react-native-reanimated";

export default function CommentBlock({
  comments,
  post,
  parent,
  replyingTo, // Pass the replyingTo state from the parent component
  setReplyingTo, // Pass the setReplyingTo function from the parent component
}: CommentBlockProps) {
  const { user } = useUser();
  const [commentText, setCommentText] = useState("");
  const [currentComments, setCurrentComments] = useState(comments);

  const { addComment, likeComment, reportComment } = usePosts();

  useEffect(() => {
    setCurrentComments(comments); // Update current comments when props change
  }, [comments]);

  const handleAddComment = async () => {
    if (commentText.trim()) {
      await addComment(post, commentText, parent || replyingTo); // Add the reply to the specific parent
      setCommentText(""); // Clear input after posting
      setReplyingTo(null); // Reset replying state after posting
    } else {
      Alert.alert("Comment cannot be empty.");
    }
  };

  const handleStopReply = () => {
    setReplyingTo(null); // Stop replying and reset to root comment level
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Reanimated.View
        entering={FadeInUp.duration(500)}
        exiting={FadeOutDown.duration(500)}
        style={{ flex: 1 }}
      >
        <ScrollView>
          {currentComments.map((comment) => {
            const [liked, setLiked] = useState(false);

            useEffect(() => {
              setLiked(comment.likes.includes(user._id as ObjectId));
            }, [comment, user._id, comments]);

            const isReplyingToThisComment = replyingTo === comment._id;

            return (
              <Reanimated.View
                key={comment._id?.toString()}
                entering={FadeInUp.delay(100 * (comments.indexOf(comment) + 1))} // Slight stagger for each comment
                exiting={FadeOutDown.duration(300)}
                className={`mb-4 px-4 ${
                  isReplyingToThisComment ? "bg-highlight-color" : "bg-transparent"
                }`} // Highlight selected comment
              >
                <Text className="text-ivory text-lg font-bold">
                  {comment.name}
                </Text>
                <Text className="text-ivory text-md">{comment.text}</Text>

                <View className="flex flex-row mt-2 justify-between">
                  <View className="flex flex-row space-x-6">
                    {/* Grouped Like and Reply */}
                    <TouchableOpacity
                      onPress={() => {
                        setLiked(!liked);
                        likeComment(post, comment._id);
                      }}
                    >
                      <Icons
                        name="heart"
                        size={24}
                        color={liked ? "red" : "gray"}
                      />
                      <Text className="text-ivory text-center">
                        {comment.likes.length}
                      </Text>
                    </TouchableOpacity>

                    {/* Only show reply button if no other reply is selected */}
                    {!replyingTo && (
                      <TouchableOpacity
                        onPress={() => setReplyingTo(comment._id)}
                      >
                        <Text className="text-blue-500">Reply</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Report button */}
                  <TouchableOpacity
                    onPress={() => reportComment(post, comment._id)}
                  >
                    <Icons name="report" size={24} color="red" />
                  </TouchableOpacity>
                </View>

                {/* Nested Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <Reanimated.View
                    entering={FadeInDown.delay(200)} // Enter with delay
                    exiting={FadeOutUp.duration(200)} // Exit with upward motion
                    className="pl-4 border-l border-gray-500 mt-2"
                  >
                    <CommentBlock
                      comments={comment.replies as unknown as Comment[]}
                      post={post}
                      parent={comment._id as ObjectId}
                      replyingTo={replyingTo} // Pass down the current reply target
                      setReplyingTo={setReplyingTo} // Pass down the setter for replyingTo
                    />
                  </Reanimated.View>
                )}
              </Reanimated.View>
            );
          })}

          {/* Add Comment Input only for root or replying to a specific comment */}
          {parent === null && (
            <Reanimated.View
              entering={FadeInUp.delay(500)} // Stagger the input field appearance after comments
              exiting={FadeOutDown.duration(500)}
              className="mt-4 px-4"
            >
              <TextInput
                placeholder={
                  replyingTo ? "Reply to comment..." : "Add a comment..."
                }
                value={commentText}
                onChangeText={setCommentText}
                className="bg-gray-700 text-ivory p-3 rounded-lg"
              />
              <TouchableOpacity
                onPress={handleAddComment}
                className="mt-2 bg-midnight_green p-3 rounded-lg"
              >
                <Text className="text-ivory text-center font-bold">
                  {replyingTo ? "Post Reply" : "Post Comment"}
                </Text>
              </TouchableOpacity>

              {replyingTo && (
                <Reanimated.View
                  entering={FadeInUp.duration(300)}
                  exiting={FadeOutDown.duration(300)}
                  className="mb-2"
                >
                  <TouchableOpacity
                    onPress={handleStopReply}
                    className="mt-2 bg-red-500 p-3 rounded-lg"
                  >
                    <Text className="text-ivory text-center font-bold">
                      Cancel Reply
                    </Text>
                  </TouchableOpacity>
                </Reanimated.View>
              )}
            </Reanimated.View>
          )}
        </ScrollView>
      </Reanimated.View>
    </TouchableWithoutFeedback>
  );
}
