import type { Db } from '@me/db';

/** Учитель ведёт этого ученика: есть связь, и роли у обоих правильные. */
export async function isTeacherOfStudent(
  db: Db,
  teacherId: string,
  studentId: string,
): Promise<boolean> {
  const count = await db.teacherStudent.count({
    where: { teacherId, studentId, teacher: { role: 'TEACHER' }, student: { role: 'STUDENT' } },
  });
  return count > 0;
}

export type StudentSummary = { id: string; name: string; email: string };

/** Ученики учителя по имени. */
export async function listStudents(db: Db, teacherId: string): Promise<StudentSummary[]> {
  const links = await db.teacherStudent.findMany({
    where: { teacherId },
    orderBy: { student: { name: 'asc' } },
    select: { student: { select: { id: true, name: true, email: true } } },
  });
  return links.map(({ student }) => student);
}
