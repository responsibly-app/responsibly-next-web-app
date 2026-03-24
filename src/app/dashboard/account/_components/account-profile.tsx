import { DangerZoneCard } from "./danger-zone-card";
import { PersonalInfoCard } from "./personal-info-card";
import { ProfileHeader } from "./profile-header";
import { SecurityCard } from "./security-card";

export function AccountProfile() {
  return (
    <div className="space-y-6">
      <ProfileHeader />
      <PersonalInfoCard />
      <SecurityCard />
      <DangerZoneCard />
    </div>
  );
}
