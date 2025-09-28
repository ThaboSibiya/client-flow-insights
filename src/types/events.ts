// Event handler types for better TypeScript support

export type ButtonClickHandler = (event: React.MouseEvent<HTMLButtonElement>) => void;
export type FormSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => void;
export type InputChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => void;
export type SelectChangeHandler = (value: string) => void;
export type CheckboxChangeHandler = (checked: boolean) => void;

// Customer-specific event types
export interface CustomerSelectEvent {
  customerId: string;
  isSelected: boolean;
}

export interface CustomerStatusChangeEvent {
  customerId: string;
  newStatus: string;
  previousStatus: string;
}

export interface CustomerActionEvent {
  customerId: string;
  actionType: 'edit' | 'delete' | 'view' | 'contact';
  timestamp: Date;
}

// Generic async handler types
export type AsyncHandler<T = void> = () => Promise<T>;
export type AsyncHandlerWithParam<P, T = void> = (param: P) => Promise<T>;

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}