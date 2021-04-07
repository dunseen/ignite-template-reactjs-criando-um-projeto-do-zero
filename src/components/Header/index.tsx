import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={styles.headerContainer}>
      <img src="/images/Logo.svg" alt="logo" />
    </header>
  );
}
