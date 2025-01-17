import styles from "./Banner.module.css";

const Banner = () => {
  return (
    <div className={styles.banner}>
      <img
        src="https://www.gstatic.com/travel-frontend/animation/hero/flights_nc_4.svg"
        alt="Gráfico animado relacionado con vuelos"
        className={styles.bannerImage}
      />
      <h2 className={styles.bannerText}>Flights</h2>
    </div>
  );
};

export default Banner;
