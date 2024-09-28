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
import Icons from "@expo/vector-icons/Octicons";
import { usePosts } from "components/hooks/usePosts";
import Comment from "@/backend/models/comment";

export default function CommentBlock({ comments, postID, parent }: CommentBlockProps) {
  const { user } = useUser();
  const [commentText, setCommentText] = useState("");
  const [currentComments, setCurrentComments] = useState(comments);

  const { addComment, likeComment, reportComment } = usePosts();

  useEffect(() => {
    setCurrentComments(comments);
  }, [comments]);

  const handleAddComment = async () => {
    if (commentText.trim()) {
      await addComment(postID, commentText);
      setCommentText(""); // Clear input after posting
    } else {
      Alert.alert("Comment cannot be empty.");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                    likeComment(comment._id?.toString() as string)
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
                    reportComment(comment._id?.toString() as string)
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
                    parent={comment._id?.toString() as string}
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
    </TouchableWithoutFeedback>
  );
}
