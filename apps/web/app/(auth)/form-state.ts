/** Состояние формы, которое Server Action возвращает в useActionState. */
export type FormState = {
  /** Общая ошибка формы. */
  error?: string;
  /** Ошибки отдельных полей по имени поля. */
  fieldErrors?: Partial<
    Record<'name' | 'email' | 'password' | 'currentPassword' | 'newPassword', string>
  >;
  /** Введённые значения (кроме паролей), чтобы не стирать форму при ошибке. */
  values?: { name?: string; email?: string };
};

export const initialFormState: FormState = {};
