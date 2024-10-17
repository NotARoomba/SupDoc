import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { LanguageButtonProps } from "../utils/Types";

export default function LanguageButton({
  language,
  index,
  currentIndex,
}: LanguageButtonProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const color = withTiming(index === currentIndex ? "#023c4d" : "#082540", {
      duration: 300,
    });
    return { backgroundColor: color };
  });

  return (
    <Animated.View
      style={animatedStyle}
      className={`snap-center mx-4 leading-10 transition-all duration-300 flex rounded-xl justify-center h-12 py-auto max-w-56 w-56 `}
    >
      <Animated.Text className="text-center bg-transparent text-ivory text-2xl font-medium">
        {language.name}
      </Animated.Text>
    </Animated.View>
  );
}
