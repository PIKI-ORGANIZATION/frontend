import { create } from 'zustand';

export interface RegistrasiData {
  // Step 1
  nik: string;
  isOcrValid: boolean;
  namaLengkap: string;
  tanggalLahir: string;
  email: string;
  confirmEmail: string;
  noWa: string;
  alamatDomisili: string;
  
  // Step 2
  tingkatPendidikan: string;
  pekerjaan: string;
  minatBidang: string;
  motivasiBergabung: string;
  
  // Step 3
  dpp: string;
  dpc: string;
  kode_provinsi?: string;
  kode_kabupaten?: string;
  
  // Step 4
  ktpFile: File | null;
  password: string;
  setujuKebenaranData: boolean;
  setujuPengelolaanData: boolean;
  setujuKerahasiaanData: boolean;
}

interface RegistrasiStore {
  data: Partial<RegistrasiData>;
  updateData: (stepData: Partial<RegistrasiData>) => void;
  resetData: () => void;
}

export const useRegistrasiStore = create<RegistrasiStore>((set) => ({
  data: {},
  updateData: (stepData) => set((state) => ({ data: { ...state.data, ...stepData } })),
  resetData: () => set({ data: {} }),
}));
