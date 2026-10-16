import { CircleX } from 'lucide-react';

import { Icon } from '@/components/ui';

/** Общая ошибка формы: иконка и текст, не только цвет; озвучивается скринридером. */
export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-md border border-error bg-error-tint px-3 py-2 text-label text-error"
    >
      <Icon icon={CircleX} size={20} tone="error" className="mt-px shrink-0" />
      {message}
    </p>
  );
}
