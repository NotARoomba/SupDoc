export interface Identification {
  // type: number; // D
  number: number; // D
  // image: string; // R
}

export interface DoctorIdentification extends Identification {
  number: number;
  license: string[]; // R
  isVerified: boolean; // D
}
