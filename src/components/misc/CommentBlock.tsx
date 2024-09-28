import { CommentBlockProps } from "components/utils/Types";
import { useEffect, useState } from "react";
import {
  Alert,
  TextInput,
  TouchableOpacity,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import Reanimated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useUser } from "components/hooks/useUser";
import { callAPI } from "components/utils/Functions";
import Icons from "@expo/vector-icons/Octicons";
import Comment from "@/backend/models/comment";

export default function CommentBlock({ comments, postID }: CommentBlockProps) {
  const { user } = useUser();
  const [commentText, setCommentText] = useState("");
  const [currentComments, setCurrentComments] = useState(comments);

  useEffect(() => {
    setCurrentComments(comments);
  }, [comments]);

  // Function to handle adding a new comment
  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      const res = await callAPI(`/posts/${postID}/comments`, "POST", {
        text: commentText,
      });
      if (res.status === 200) {
        setCurrentComments([...currentComments, res.comment]);
        setCommentText("");
      } else {
        Alert.alert("Error", "Failed to add comment.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while adding the comment.");
    }
  };

  // Function to handle liking a comment
  const handleLikeComment = async (commentId: string) => {
    try {
      const res = await callAPI(`/comments/${commentId}/like`, "POST");
      if (res.status === 200) {
        setCurrentComments(
          currentComments.map((comment) =>
            comment._id?.toString() === commentId
              ? { ...comment, likes: res.likes }
              : comment
          )
        );
      } else {
        Alert.alert("Error", "Failed to like the comment.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while liking the comment.");
    }
  };

  // Function to handle reporting a comment
  const handleReportComment = (commentId: string) => {
    Alert.alert(
      "Report Comment",
      "Are you sure you want to report this comment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Report",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await callAPI(`/comments/${commentId}/report`, "POST");
              if (res.status === 200) {
                Alert.alert("Success", "Comment reported.");
              } else {
                Alert.alert("Error", "Failed to report comment.");
              }
            } catch (error) {
              Alert.alert("Error", "An error occurred while reporting the comment.");
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <Reanimated.View
          entering={FadeIn.duration(500)}
          exiting={FadeOut.duration(500)}
          style={{ flex: 1 }}
        >
          <ScrollView>
            {currentComments.map((comment, index) => (
              <View key={comment._id?.toString()} className="mb-4 px-4">
                <Text className="text-ivory text-lg font-bold">
                  {comment.doctor}
                </Text>
                <Text className="text-ivory text-md">{comment.text}</Text>
                <View className="flex flex-row mt-2 space-x-3">
                  <TouchableOpacity
                    onPress={() =>
                      handleLikeComment(comment._id?.toString() as string)
                    }
                  >
                    <Icons
                      name="heart"
                      size={24}
                      color={
                        comment.likes.includes(user._id?.toString() as string)
                          ? "red"
                          : "gray"
                      }
                    />
                    <Text className="text-ivory">{comment.likes.length}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      handleReportComment(comment._id?.toString() as string)
                    }
                  >
                    <Icons name="alert" size={24} color="yellow" />
                  </TouchableOpacity>
                </View>
                {/* Nested Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <View className="pl-4 border-l border-gray-500 mt-2">
                    <CommentBlock
                      comments={comment.replies as unknown as Comment[]}
                      postID={postID}
                    />
                  </View>
                )}
              </View>
            ))}

            {/* Add Comment Input */}
            <View className="mt-4 px-4">
              <TextInput
                placeholder="Add a comment..."
                value={commentText}
                onChangeText={setCommentText}
                className="bg-gray-700 text-ivory p-3 rounded-lg"
                onFocus={() => {}}
              />
              <TouchableOpacity
                onPress={handleAddComment}
                className="mt-2 bg-midnight_green p-3 rounded-lg"
              >
                <Text className="text-ivory text-center font-bold">
                  Post Comment
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Reanimated.View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
