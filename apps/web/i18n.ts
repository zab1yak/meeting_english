import ru from './messages/ru.json';

type Messages = typeof ru;
type Section = keyof Messages;
/** Ключи раздела, значения которых — строки (вложенные объекты исключены). */
type StringKey<S extends Section> = {
  [K in keyof Messages[S]]: Messages[S][K] extends string ? K : never;
}[keyof Messages[S]] &
  string;

/**
 * Простой i18n: строка из messages/ru.json с подстановкой {параметров}.
 * Язык пока один; при добавлении второго здесь появится выбор локали.
 */
export function t<S extends Section>(
  section: S,
  key: StringKey<S>,
  params: Readonly<Record<string, string | number>> = {},
): string {
  const template = ru[section][key] as string;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = Object.hasOwn(params, name) ? params[name] : undefined;
    return value === undefined ? match : String(value);
  });
}
