import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
export interface Patient {
  id: string;
  [key: string]: any;
}
const DEFAULT_LABEL_TEMPLATE = 'Name: {{name}}\nDOB: {{dob}}\nGender: {{gender}}';
interface PatientState {
  patients: Patient[];
  selectedPatientIds: Set<string>;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  headers: string[];
  labelTemplate: string;
}
interface PatientActions {
  setData: (patients: Patient[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  toggleSelected: (patientId: string) => void;
  toggleSelectAll: () => void;
  clearData: () => void;
  getPrintablePatients: () => Patient[];
  setCurrentPage: (page: number) => void;
  setLabelTemplate: (template: string) => void;
  resetLabelTemplate: () => void;
}
export const usePatientStore = create<PatientState & PatientActions>()(
  immer((set, get) => ({
    patients: [],
    selectedPatientIds: new Set(),
    isLoading: false,
    error: null,
    currentPage: 1,
    headers: [],
    labelTemplate: DEFAULT_LABEL_TEMPLATE,
    setData: (patients) => {
      const cleanedPatients = patients.map(patient => {
        const cleanedPatient: Patient = { id: patient.id };
        Object.keys(patient).forEach(key => {
          cleanedPatient[key.trim()] = patient[key];
        });
        return cleanedPatient;
      });
      set((state) => {
        state.patients = cleanedPatients;
        state.selectedPatientIds.clear();
        state.isLoading = false;
        state.error = null;
        state.currentPage = 1; // Reset to first page on new data
        if (cleanedPatients.length > 0) {
          state.headers = Object.keys(cleanedPatients[0]).filter(h => h !== 'id');
        } else {
          state.headers = [];
        }
      });
    },
    setLoading: (isLoading) => {
      set({ isLoading });
    },
    setError: (error) => {
      set({ error, isLoading: false });
    },
    toggleSelected: (patientId) => {
      set((state) => {
        if (state.selectedPatientIds.has(patientId)) {
          state.selectedPatientIds.delete(patientId);
        } else {
          state.selectedPatientIds.add(patientId);
        }
      });
    },
    toggleSelectAll: () => {
      set((state) => {
        if (state.selectedPatientIds.size === state.patients.length) {
          state.selectedPatientIds.clear();
        } else {
          state.patients.forEach((p) => state.selectedPatientIds.add(p.id));
        }
      });
    },
    clearData: () => {
      set((state) => {
        state.patients = [];
        state.selectedPatientIds.clear();
        state.error = null;
        state.currentPage = 1; // Reset to first page
        state.headers = [];
      });
    },
    getPrintablePatients: () => {
      const { patients, selectedPatientIds } = get();
      return patients.filter(p => selectedPatientIds.has(p.id));
    },
    setCurrentPage: (page: number) => {
      set({ currentPage: page });
    },
    setLabelTemplate: (template: string) => {
      set({ labelTemplate: template });
    },
    resetLabelTemplate: () => {
      set({ labelTemplate: DEFAULT_LABEL_TEMPLATE });
    },
  }))
);