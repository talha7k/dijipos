import { Settings } from 'lucide-react';

export function SettingsHeader() {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Settings className="h-8 w-8" />
        Store Settings
      </h1>
    </div>
  );
}