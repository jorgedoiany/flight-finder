import Header from "../components/Header";
import Banner from "../components/Banner";
import SearchBox from "../components/SearchBox";

const SearchPage = () => {
  return (
    <>
      {/* Header */}
      <header>
        <Header />
      </header>

      {/* Banner */}
      <section aria-labelledby="banner-title">
        <Banner />
      </section>

      {/* Search Bar */}
      <main>
        <SearchBox />
      </main>
    </>
  );
};

export default SearchPage;
