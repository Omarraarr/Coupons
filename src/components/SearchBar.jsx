/* eslint-disable react/prop-types */
import { useState } from "react";
import { useTranslation } from "react-i18next";

const SearchBar = ({ categories, onSearchChange, onCategoryChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearchChange(term);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    onCategoryChange(category);
  };

  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-2 py-4 w-full">
      <div className="search-bar flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-lg">
        {/* Search Input */}
        <div className="search-input flex items-center bg-text w-full md:w-6/12 border-2 border-main px-4 py-2 rounded-lg">
          <input
            type="text"
            className="outline-none bg-transparent w-full"
            placeholder={t("Search")}
            value={searchTerm}
            onChange={handleSearch}
          />
          <span className="text-gray-500 ml-2">
            <img src="./search1.png" className="w-6 h-6" alt="" />
          </span>
        </div>

        {/* Categories */}
        <div className="categories flex flex-wrap items-center gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-button px-4 py-2 rounded-lg ${
                selectedCategory === category.name
                  ? "bg-red-500 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
              onClick={() => handleCategoryChange(category.name)}
            >
              {t(`${category.name}`)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
