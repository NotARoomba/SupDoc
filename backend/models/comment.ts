export default interface Comment {
  _id: string;
  parent?: string;
  doctor: string;
  text: string;
  likes: number;
  reports: Report[];
  children: Comment[];
  timestamp: number;
}
