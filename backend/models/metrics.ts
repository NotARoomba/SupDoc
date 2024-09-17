export interface PatientMetrics {
  age: number;
  height: number;
  weight: number;
  dob: string;
  sex: string;
  blood: string;
  pregnant: boolean;
  altSex?: string;
  hormones?: boolean;
  surgery?: boolean;
}

export interface DoctorMetrics {
  specialty: string;
  experience: string;
  about: string;
}
