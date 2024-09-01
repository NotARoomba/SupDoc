import Comment from "./comment";
import Patient from "./patient";

export default interface Post {
  _id: string;
  title: string;
  images: string[];
  description: string;
  patient: Patient;
  timestamp: number;
  comments: Comment[];
}
