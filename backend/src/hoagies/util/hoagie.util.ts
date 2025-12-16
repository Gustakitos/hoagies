import { HoagieCollaborator } from '../../common/interfaces/hoagies.interface';
import { HoagieDocument } from '../schemas/hoagie.schema';

export const isValidCollaborator = (c: HoagieCollaborator) =>
  c != null && c?.id != null;

export const isCollaborator = (hoagie: HoagieDocument, userId: string) => {
  return (
    hoagie.collaborators?.some(
      (collaboratorId) => collaboratorId.toString() === userId,
    ) || false
  );
};
