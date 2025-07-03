// This file is now simplified as parsing is handled by the backend
import { ParsedResumeData } from '../types/resume';

export const parseResumeContent = async (file: File): Promise<ParsedResumeData> => {
  // This function is no longer used as parsing is handled by the backend
  // Keeping it for compatibility but it won't be called
  throw new Error('Resume parsing is now handled by the backend');
};