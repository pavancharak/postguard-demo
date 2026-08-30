import { useMemo, useState } from "react";
import { PolicyEngine } from "./lib/auth";
import { SignatureService } from "./lib/crypto";
import { AuditStore } from "./lib/audit";
import { RULES, SIGNING_KEY } from "./lib/constants";
import { HomeScreen } from "./components/HomeScreen";
import { DraftsScreen } from "./components/DraftsScreen";
import { VerificationScreen } from "./components/VerificationScreen";
import { ReceiptScreen } from "./components/ReceiptScreen";
import { AuditTrailScreen } from "./components/AuditTrailScreen";
import "./styles/app.css";

function App() {
  const [screen, setScreen] = useState("home");
  const [selectedPost, setSelectedPost] = useState(null);
  // Bumping this forces AuditTrailScreen (and Home's stats) to re-read
  // AuditStore.getAll() after a new record is written.
  const [, forceRefresh] = useState(0);

  // Single shared instances for the whole app session. SIGNING_KEY is only
  // ever read here, to construct SignatureService — no component or agent
  // data ever holds a reference to the key itself.
  const policyEngine = useMemo(() => new PolicyEngine(RULES), []);
  const sigService = useMemo(() => new SignatureService(SIGNING_KEY), []);
  const auditStore = useMemo(() => new AuditStore(sigService), [sigService]);

  const handleSelectPost = (post) => {
    setSelectedPost(post);
    setScreen("verify");
  };

  const handleRunVerification = (post) => {
    setSelectedPost(post);
    setScreen("receipt");
  };

  const handleRecorded = () => {
    forceRefresh((n) => n + 1);
  };

  return (
    <div id="app-shell">
      {screen === "home" && (
        <HomeScreen auditStore={auditStore} onNavigate={setScreen} />
      )}

      {screen === "drafts" && (
        <DraftsScreen
          onNavigate={setScreen}
          onSelectPost={handleSelectPost}
        />
      )}

      {screen === "verify" && selectedPost && (
        <VerificationScreen
          post={selectedPost}
          onRunVerification={handleRunVerification}
        />
      )}

      {screen === "receipt" && selectedPost && (
        <ReceiptScreen
          post={selectedPost}
          policyEngine={policyEngine}
          auditStore={auditStore}
          onBack={() => setScreen("drafts")}
          onViewAudit={() => setScreen("audit")}
          onRecorded={handleRecorded}
        />
      )}

      {screen === "audit" && (
        <AuditTrailScreen auditStore={auditStore} onNavigate={setScreen} />
      )}
    </div>
  );
}

export default App;
