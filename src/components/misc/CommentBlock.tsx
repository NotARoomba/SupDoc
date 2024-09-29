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

  const { addComment, likeComment, reportComment, setUpdateComments, updateComments } = usePosts();

  useEffect(() => {
    setCurrentComments(comments); // Update current comments when props change
    if (updateComments) setUpdateComments(false);
  }, [comments, updateComments]);

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
            const [likes, setLikes] = useState(0);
            useEffect(() => {
              setLiked(comment.likes.includes(user._id as ObjectId));
              setLikes(comment.likes.length);
            }, [comment, user._id, comments]);

            const isReplyingToThisComment = replyingTo === comment._id;

            return (
              <Reanimated.View
                key={comment._id?.toString()}
                entering={FadeInUp.delay(100 * (comments.indexOf(comment) + 1))} // Slight stagger for each comment
                exiting={FadeOutDown.duration(300)}
                className={`mb-4  rounded-xl px-4 py-2 
                ${isReplyingToThisComment ? " bg-oxford_blue transition-all duration-500" : "bg-transparent transition-all duration-500"}
                `}
              >
                <TouchableOpacity
                  onPress={() => {
                    setReplyingTo(
                      comment._id == replyingTo ? null : comment._id
                    ); // Set the reply state
                  }}
                >
                  <Text 
                className="text-ivory text-lg font-bold">
                    {comment.name}
                  </Text>
                  <Text className="text-ivory text-md">{comment.text}</Text>

                  <View className="flex flex-row mt-2 justify-between">
                    <View className="flex flex-row space-x-6 align-middle">
                      {/* Grouped Like and Reply */}
                      <TouchableOpacity
                      className="flex flex-row gap-x-1"
                        onPress={() => {
                          setLikes(likes + (liked ? -1 : 1));
                          setLiked(!liked);
                          likeComment(post, comment._id);
                        }}
                      >
                        <Icons
                          name="heart"
                          size={24}
                          color={liked ? "red" : "gray"}
                        />
                        <Text className="text-ivory text-center my-auto">{likes}</Text>
                      </TouchableOpacity>

                      {/* Reply Button - Toggles the Report Button */}
                      {/* {isReplyingToThisComment && <Reanimated.View
                        exiting={FadeOut.duration(250)}
                        entering={FadeIn.duration(250)}
                        className={"my-auto"}
                      >
                        <TouchableOpacity
                          onPress={() => {
                            setReplyingTo(
                              comment._id == replyingTo ? null : comment._id
                            ); // Set the reply state
                          }}
                        >
                          <Text className="text-blue-500">Replying</Text>
                        </TouchableOpacity>
                      </Reanimated.View>} */}
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
                      entering={FadeInDown.delay(200)} // Enter with delay
                      exiting={FadeOutUp.duration(200)} // Exit with upward motion
                      className={`pl-4 border-l border-gray-500 mt-2 rounded-xl rounded-l-none ${
                        isReplyingToThisComment
                          ? " bg-oxford_blue-500" // Darker background for child comments when parent is selected
                          : "bg-transparent"
                      }`}
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
                </TouchableOpacity>
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
                <Reanimated.Text
                  entering={FadeIn.duration(500)}
                  exiting={FadeOut.duration(500)}
                  className="text-ivory text-center font-bold"
                >
                  {replyingTo ? "Post Reply" : "Post Comment"}
                </Reanimated.Text>
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
