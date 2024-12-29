import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "./Button";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  // Switch language function
  const switchLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en"; // Toggle language
    i18n.changeLanguage(newLang);
    localStorage.setItem("language", newLang);
    document.documentElement.setAttribute(
      "dir",
      newLang === "ar" ? "rtl" : "ltr"
    );
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <nav className="w-full bg-main">
        <div className="container mx-auto flex flex-row flex-wrap items-center justify-between px-6 py-4">
          {/* Logo Section */}
          <Link to="/">
            <div className="flex items-center space-x-3 gap-2">
              <img src="./logo.svg" alt="Logo" className="h-14 w-14" />
              <h1 className="text-xl font-semibold text-text mx-1">
                {t("Couponk")}
              </h1>
            </div>
          </Link>

          {/* Hamburger Menu for Mobile */}
          <div className="block lg:hidden">
            <button
              onClick={toggleMenu}
              className="text-text hover:text-button focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16m-7 6h7"
                ></path>
              </svg>
            </button>
          </div>

          {/* Button Section (Desktop) */}
          <div className="hidden lg:flex items-center space-x-4 flex-row gap-2">
            <Link to="/dashboard">
              <button className="px-4 py-2 bg-button text-main font-medium rounded-lg transition-all duration-100 ease-in-out hover:bg-main hover:text-button hover:border-text hover:border-2 shadow-md">
                Dashboard
              </button>
            </Link>
            <Button />
            <button
              onClick={switchLanguage}
              className="px-4 py-2 rounded-lg bg-transparent text-button hover:bg-button hover:text-main"
            >
              {i18n.language === "en" ? "Ar" : "En"}
            </button>
          </div>
        </div>

        {/* Mobile Menu (Full Page) */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[999999999999999]  flex items-center justify-center">
            <div className="bg-main w-full h-full flex flex-col gap-4 items-center justify-center text-white">
              <button
                onClick={toggleMenu}
                className="absolute top-6 right-6 text-3xl text-white"
              >
                &times;
              </button>
              <Link to="/dashboard">
                <button className="px-4 py-2 bg-button text-main font-medium rounded-lg transition-all duration-100 ease-in-out hover:bg-main hover:text-button hover:border-text hover:border-2 shadow-md">
                  Dashboard
                </button>
              </Link>
              <Button />

              <button
                onClick={switchLanguage}
                className="block px-4 py-2 rounded-lg bg-transparent text-button hover:bg-button hover:text-main"
              >
                {i18n.language === "en" ? "Ar" : "En"}
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
