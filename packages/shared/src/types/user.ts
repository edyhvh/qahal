export interface UserDto {
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
  languageCode?: string;
  city?: string;
  onboardingCompleted?: boolean;
}
