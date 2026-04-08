"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DangerZoneCard } from "./danger-zone-card";
import { PersonalInfoCard } from "./personal-info-card";
import { TimezoneCard } from "./timezone-card";
import { ProfileHeader } from "./profile-header";
import { PasswordCard } from "./password-card";
import { SessionsCard } from "./sessions-card";
import { useTabSearchParam } from "@/lib/hooks/use-tab-search-param";

export function SettingsTabs() {
  const [activeTab, setTab] = useTabSearchParam("profile");

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-6 space-y-4">
          <ProfileHeader />
          <PersonalInfoCard />
        </TabsContent>
        <TabsContent value="preferences" className="mt-6">
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
