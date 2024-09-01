enum IdentificationType {
  TI,
  CEDULA,
}
export interface Identification {
  type: IdentificationType;
  number: number;
  image: string;
}

export interface DoctorIdentification extends Identification {
  license: string;
  isVerified: boolean;
}
