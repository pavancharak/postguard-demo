import styles from "../styles/Hook.module.css";

export function HookScreen({ onNavigate }) {
  return (
    <div className="page">
      <div className={styles.wrap}>
        <h1 className={styles.headline}>Can AI cheat your policy?</h1>
        <p className={styles.answer}>NO</p>
        <p className={styles.sub}>
          PostGuard proves it. Every AI action is verified, signed, locked.
        </p>
        <button
          className={`btn primary large ${styles.cta}`}
          onClick={() => onNavigate("demo")}
        >
          See how it works
        </button>
      </div>
      <div className={styles.footer}>Powered by Parmana</div>
    </div>
  );
}
