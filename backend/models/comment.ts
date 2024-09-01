export default interface Comment {
  _id: string;
  parent?: string; // D
  doctor: string; // D
  text: string; // R
  likes: number; // D
  reports: Report[]; 
  children: Comment[];
  timestamp: number; // D
}
