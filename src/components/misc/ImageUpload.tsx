import { ImageUploadProps } from "components/utils/Types";
import { Image, TouchableOpacity, View } from "react-native";

export default function ImageUpload({ image, removeImage }: ImageUploadProps) {
  // need to add a square image that has a fixed height and on press there appears a
  // opacity with a trash icon to remove
  return (
    <TouchableOpacity className="w-64 mx-2 h-64 flex aspect-square border border-solid border-ivory/80 rounded-xl">
      <Image src={image} className=" aspect-square rounded-xl" />
    </TouchableOpacity>
  );
}
