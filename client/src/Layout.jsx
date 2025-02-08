import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { Outlet, Link } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "./UserContext";

export default function Layout() {
  const { user } = useContext(UserContext);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
