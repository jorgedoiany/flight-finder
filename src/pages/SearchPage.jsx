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
      <section>
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
