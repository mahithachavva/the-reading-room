import { useState } from "react";
import { Download, Upload, ShieldCheck } from "lucide-react";
import { createBackup, restoreBackup } from "../database/db";

function Settings() {
  const [lastBackup, setLastBackup] = useState(
    localStorage.getItem("lastBackup")
  );

  async function downloadBackup() {
    try {
      const data = await createBackup();

      const blob = new Blob(
        [JSON.stringify(data, null, 2)],
        { type: "application/json" }
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `reading-room-backup-${new Date()
        .toISOString()
        .split("T")[0]}.json`;

      link.click();
      URL.revokeObjectURL(url);

      const date = new Date().toLocaleString();
      localStorage.setItem("lastBackup", date);
      setLastBackup(date);

      alert("Your backup was downloaded successfully!");
    } catch (error) {
      console.error(error);
      alert("Could not create backup.");
    }
  }

  async function uploadBackup(event) {
    const file = event.target.files[0];

    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const valid =
        data.version === 1 &&
        ["books", "highlights", "journal", "completions", "collections"]
          .every((key) => Array.isArray(data[key]));

      if (!valid) {
        alert("Invalid backup file.");
        return;
      }

      const confirmed = window.confirm(
        "Restoring this backup will replace your current reading data. Continue?"
      );

      if (!confirmed) return;

      await restoreBackup(data);

      alert("Backup restored successfully! Please refresh the page.");
    } catch (error) {
      console.error(error);
      alert("Could not restore this backup.");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <span className="eyebrow">YOUR READING ROOM</span>
        <h1>Settings</h1>
        <p>Manage your library and keep your memories safe.</p>
      </div>

      <div className="settings-card">
        <div className="settings-icon">
          <ShieldCheck size={28} />
        </div>

        <div>
          <h2>Backup & Restore</h2>
          <p>
            Keep your books, highlights, journal entries and
            achievements safe.
          </p>
        </div>

        <div className="backup-actions">
          <button onClick={downloadBackup}>
            <Download size={18} />
            Download Backup
          </button>

          <label className="restore-button">
            <Upload size={18} />
            Restore Backup
            <input
              type="file"
              accept=".json,application/json"
              onChange={uploadBackup}
              hidden
            />
          </label>
        </div>

        <p className="last-backup">
          Last backup: {lastBackup || "No backup created yet"}
        </p>
      </div>
    </div>
  );
}

export default Settings;