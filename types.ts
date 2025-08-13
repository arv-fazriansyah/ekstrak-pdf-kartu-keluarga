
export interface ChildData {
  'No.': string;
  Nama: string;
  NIK: string;
  'Tempat Lahir': string;
  'Tanggal Lahir': string;
  'Nama Ayah': string;
  'Tempat Lahir Ayah': string;
  'Tanggal Lahir Ayah': string;
  'Pendidikan Ayah': string;
  'Pekerjaan Ayah': string;
  'Nama Ibu': string;
  'Tempat Lahir Ibu': string;
  'Tanggal Lahir Ibu': string;
  'Pendidikan Ibu': string;
  'Pekerjaan Ibu': string;
  'Alamat Lengkap': string;
  'No. KK': string;
}

export const CHILD_DATA_COLUMNS: (keyof ChildData)[] = [
  "No.",
  "Nama",
  "NIK",
  "Tempat Lahir",
  "Tanggal Lahir",
  "Nama Ayah",
  "Tempat Lahir Ayah",
  "Tanggal Lahir Ayah",
  "Pendidikan Ayah",
  "Pekerjaan Ayah",
  "Nama Ibu",
  "Tempat Lahir Ibu",
  "Tanggal Lahir Ibu",
  "Pendidikan Ibu",
  "Pekerjaan Ibu",
  "Alamat Lengkap",
  "No. KK"
];


export interface ExtractedFile {
  fileName: string;
  data: ChildData[];
  error?: string;
}

export interface LoadingState {
  processed: number;
  total: number;
  currentFile: string;
}
