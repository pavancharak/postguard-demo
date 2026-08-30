import { useMemo, useState } from "react";
import { PolicyEngine } from "./lib/auth";
import { SignatureService } from "./lib/crypto";
import { AuditStore } from "./lib/audit";
import { RULES, SIGNING_KEY } from "./lib/constants";
import { HookScreen } from "./components/HookScreen";
import { DemoScreen } from "./components/DemoScreen";
import { ProofScreen } from "./components/ProofScreen";
import "./styles/app.css";

function App() {
  const [screen, setScreen] = useState("hook");

  // Single shared instances for the whole app session. SIGNING_KEY is only
  // ever read here, to construct SignatureService.
  const policyEngine = useMemo(() => new PolicyEngine(RULES), []);
  const sigService = useMemo(() => new SignatureService(SIGNING_KEY), []);
  const auditStore = useMemo(() => new AuditStore(sigService), [sigService]);

  return (
    <div id="app-shell">
      {screen === "hook" && <HookScreen onNavigate={setScreen} />}

      {screen === "demo" && (
        <DemoScreen
          policyEngine={policyEngine}
          auditStore={auditStore}
          onNavigate={setScreen}
        />
      )}

      {screen === "proof" && (
        <ProofScreen policyEngine={policyEngine} onNavigate={setScreen} />
      )}
    </div>
  );
}

export default App;
