
// RunMigrationButton.jsx
import React from "react";
import { migrateProjects, migrateClients, migrateCreativeBriefs } from "../firebase/migrateTestData";
import { getAuth } from "firebase/auth";

export default function RunMigrationButton() {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    return null;
  }

  const handleMigrate = async () => {
    if (!window.confirm("Are you sure you want to run the migration? This will update your Firestore test data.")) {
      return;
    }

    try {
      console.log("Starting migration...");
      await migrateProjects();
      await migrateClients();
      await migrateCreativeBriefs();
      alert("Migration completed successfully! ✅");
    } catch (error) {
      console.error("Migration error:", error);
      alert("Migration failed. Check console for details.");
    }
  };

  return (
    <button onClick={handleMigrate} style={{ padding: "10px", backgroundColor: "#4caf50", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>
      Run Migration
    </button>
  );
}
