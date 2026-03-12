export const REQUIRED_PROFILE_FIELDS = [
  "nome",
  "sobrenome",
  "escolaridade",
  "data_nascimento",
  "cidade",
  "estado",
  "area_forte",
  "area_fraca",
] as const;

export type RequiredProfileField = (typeof REQUIRED_PROFILE_FIELDS)[number];

export type ProfileCompletionShape = Partial<Record<RequiredProfileField, string | null | undefined>>;

export function isProfileComplete(profile: ProfileCompletionShape | null | undefined) {
  if (!profile) {
    return false;
  }

  return REQUIRED_PROFILE_FIELDS.every((field) => {
    const value = profile[field];
    return typeof value === "string" && value.trim().length > 0;
  });
}
