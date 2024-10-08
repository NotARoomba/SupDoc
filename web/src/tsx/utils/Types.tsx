export interface PersonSectionProps {
  name: string;
  role: string;
  image: string;
  quote: string;
  github?: string;
  linkedin?: string;
  insta: string;
  rotate?: boolean;
  delay: number;
}

export interface AdvancementCardProps {
  title: string;
  subtitle: string;
  link: string;
  imagePath: string;
  textColor: string;
  linkColor: string;
  bgColor?: string;
}
