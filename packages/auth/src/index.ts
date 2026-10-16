// Серверная логика авторизации: общая для web и realtime. В клиентский код не импортировать.
export {
  authenticate,
  changePassword,
  registerTeacher,
  resetStudentPassword,
  type PublicUser,
} from './accounts';
export { sessionCookie, type SessionCookie } from './cookie';
export {
  INVITE_TTL_MS,
  acceptInviteAsExistingStudent,
  acceptInviteAsNewStudent,
  createInvite,
  findInvite,
} from './invites';
export { isTeacherOfStudent, listStudents, type StudentSummary } from './permissions';
export { SESSION_ABSOLUTE_TTL_MS, SESSION_IDLE_TTL_MS, safeRedirectPath } from './policy';
export type { Err, Ok, Result } from './result';
export {
  MAX_SESSIONS_PER_USER,
  createSession,
  revokeAllSessions,
  revokeSession,
  validateSession,
  type SessionMeta,
  type SessionUser,
} from './sessions';
