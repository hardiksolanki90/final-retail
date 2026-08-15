export interface SurveyQuestion {
  id: string;
  question: string;
  questionType: 'text' | 'rating' | 'multiple_choice' | 'yes_no';
  options?: string[];
  required: boolean;
}

export interface SurveyResponse {
  questionId: string;
  answer: string | number | boolean;
}

export interface ConsumerSurvey {
  id?: string;
  uuid?: string;
  surveyCode: string;
  surveyName: string;
  customerId: string;
  merchandiserId: string;
  date: string;
  questions: SurveyQuestion[];
  responses: SurveyResponse[];
  status?: 'draft' | 'completed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}

export interface ConsumerSurveyFormData {
  surveyCode: string;
  surveyName: string;
  customerId: string;
  merchandiserId: string;
  date: string;
  questions: SurveyQuestion[];
  status?: 'draft' | 'completed';
}

export interface SensorySurvey {
  id?: string;
  uuid?: string;
  surveyCode: string;
  surveyName: string;
  productId: string;
  customerId: string;
  merchandiserId: string;
  date: string;
  appearance: number;
  aroma: number;
  taste: number;
  texture: number;
  overallRating: number;
  comments?: string;
  status?: 'draft' | 'completed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}

export interface SensorySurveyFormData {
  surveyCode: string;
  surveyName: string;
  productId: string;
  customerId: string;
  merchandiserId: string;
  date: string;
  appearance: number;
  aroma: number;
  taste: number;
  texture: number;
  overallRating: number;
  comments?: string;
  status?: 'draft' | 'completed';
}

export interface SurveyListResponse {
  data: (ConsumerSurvey | SensorySurvey)[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}
