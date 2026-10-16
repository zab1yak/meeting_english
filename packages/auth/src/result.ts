// Результат операции: ожидаемые отказы — значения, а не исключения.

/** Ok<undefined> — успех без данных. */
export type Ok<T extends object | undefined = undefined> = T extends object
  ? { ok: true } & T
  : { ok: true };
export type Err<E extends string> = { ok: false; code: E };
export type Result<T extends object | undefined, E extends string> = Ok<T> | Err<E>;

export function err<E extends string>(code: E): Err<E> {
  return { ok: false, code };
}
