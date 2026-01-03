import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Camera,
  Share2,
  Trash2,
  LogOut,
  Moon,
  Sun,
  Bell,
  Shield,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/auth.store";
import { AppHeader } from "@/components/layout/AppHeader";
import { cn } from "@/shared/utils";
import { toast } from "sonner";

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();

  const [username, setUsername] = useState(user?.username || "");
  const [displayName, setDisplayName] = useState(user?.username || "");
  const [bio, setBio] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [tradeNotifications, setTradeNotifications] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="container py-20 text-center">
          <p className="text-muted-foreground mb-4">
            Please log in to access settings
          </p>
          <Link to="/auth" className="text-primary hover:underline">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSaving(false);
    toast.success("Profile updated successfully");
  };

  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}/trader/${user?.id}`;
    navigator.clipboard.writeText(profileUrl);
    toast.success("Profile link copied to clipboard");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Logged out successfully");
  };

  const handleDeleteAccount = () => {
    logout();
    navigate("/");
    toast.success("Account deleted");
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <div className="container py-6 max-w-2xl">
        {/* Back Link */}
        <Link
          to="/portfolio"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Wallet
        </Link>

        <h1 className="text-2xl font-bold text-foreground mb-8">Settings</h1>

        {/* Profile Section */}
        <section className="rounded-xl border border-border bg-card overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Profile</h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-2xl font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Profile picture</p>
                <button className="text-sm text-primary hover:text-primary/80 transition-colors mt-1">
                  Upload new photo
                </button>
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-10 px-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Enter username"
              />
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full h-10 px-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Enter display name"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                placeholder="Tell others about yourself..."
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full h-10 px-4 rounded-lg border border-border bg-surface text-muted-foreground cursor-not-allowed"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="rounded-xl border border-border bg-card overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">
              Preferences
            </h2>
          </div>

          <div className="divide-y divide-border">
            {/* Dark Mode */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <Moon className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Sun className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Dark Mode
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Toggle dark theme
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={cn(
                  "w-11 h-6 rounded-full transition-colors relative",
                  darkMode ? "bg-primary" : "bg-surface border border-border"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full bg-background border border-border absolute top-0.5 transition-transform",
                    darkMode ? "translate-x-5" : "translate-x-0.5"
                  )}
                />
              </button>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Email Notifications
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={cn(
                  "w-11 h-6 rounded-full transition-colors relative",
                  emailNotifications
                    ? "bg-primary"
                    : "bg-surface border border-border"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full bg-background border border-border absolute top-0.5 transition-transform",
                    emailNotifications ? "translate-x-5" : "translate-x-0.5"
                  )}
                />
              </button>
            </div>

            {/* Trade Notifications */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Trade Notifications
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Alerts when trades execute
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTradeNotifications(!tradeNotifications)}
                className={cn(
                  "w-11 h-6 rounded-full transition-colors relative",
                  tradeNotifications
                    ? "bg-primary"
                    : "bg-surface border border-border"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full bg-background border border-border absolute top-0.5 transition-transform",
                    tradeNotifications ? "translate-x-5" : "translate-x-0.5"
                  )}
                />
              </button>
            </div>

            {/* Price Alerts */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Price Alerts
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Notify when prices hit thresholds
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPriceAlerts(!priceAlerts)}
                className={cn(
                  "w-11 h-6 rounded-full transition-colors relative",
                  priceAlerts ? "bg-primary" : "bg-surface border border-border"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full bg-background border border-border absolute top-0.5 transition-transform",
                    priceAlerts ? "translate-x-5" : "translate-x-0.5"
                  )}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Actions Section */}
        <section className="rounded-xl border border-border bg-card overflow-hidden mb-6">
          <div className="divide-y divide-border">
            {/* Share Profile */}
            <button
              onClick={handleShareProfile}
              className="flex items-center justify-between w-full px-6 py-4 hover:bg-surface transition-colors"
            >
              <div className="flex items-center gap-3">
                <Share2 className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  Share Profile
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* Security */}
            <button className="flex items-center justify-between w-full px-6 py-4 hover:bg-surface transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  Security & Privacy
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="rounded-xl border border-no/30 bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-no/30">
            <h2 className="text-lg font-semibold text-no">Danger Zone</h2>
          </div>

          <div className="divide-y divide-border">
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-6 py-4 hover:bg-surface transition-colors"
            >
              <LogOut className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Log out
              </span>
            </button>

            {/* Delete Account */}
            <div className="px-6 py-4">
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-3 text-no hover:text-no/80 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                  <span className="text-sm font-medium">Delete account</span>
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Are you sure? This action cannot be undone. All your data
                    will be permanently deleted.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeleteAccount}
                      className="px-4 py-2 rounded-lg bg-no text-no-foreground text-sm font-medium hover:bg-no/90 transition-colors"
                    >
                      Yes, delete my account
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-surface transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
