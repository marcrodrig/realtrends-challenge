import * as React from "react";
import logo from "~/assets/logo.svg";
import finger from "~/assets/pointing-up-finger.svg";
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from "./Home.module.scss";
import Button from 'react-bootstrap/Button';
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <div id="root">
      <main className={styles.container}>
        <header className={styles.header}>
          <h1>
            <img alt="RealTrends" src={logo} width={180} />
          </h1>
          <h3>Lets get this party started</h3>
          <Link to="/votes">
            <Button variant="info mt-2 mb-3">Votación Real-time</Button>
          </Link>
          <br />
          <img className={styles.finger} src={finger} alt="Finger" width={40} />
        </header>
      </main>
    </div>
  );
};

export default Home;
