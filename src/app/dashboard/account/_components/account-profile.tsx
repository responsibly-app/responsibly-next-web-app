"use client";

// import { useLatestSession } from "@/lib/auth/hooks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DangerZoneCard } from "./danger-zone-card";
import { PersonalInfoCard } from "./personal-info-card";
import { TimezoneCard } from "./timezone-card";
import { ProfileHeader } from "./profile-header";
import { PasswordCard } from "./password-card";
import { SessionsCard } from "./sessions-card";

export function AccountProfile() {
  // useLatestSession();
  return (
    <div className="space-y-6">
      <ProfileHeader />
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-6 space-y-4">
          <PersonalInfoCard />
          <TimezoneCard />
        </TabsContent>
        <TabsContent value="security" className="mt-6 space-y-6">
          <PasswordCard />
          <SessionsCard />
        </TabsContent>
        <TabsContent value="account" className="mt-6">
          <DangerZoneCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
