/* eslint-disable react/prop-types */
import { useEffect, useState, useMemo, useCallback, memo } from "react";
import styled from "styled-components";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import SearchBar from "./SearchBar";
import Loading from "./Loading";
import { useTranslation } from "react-i18next";
import i18n from "i18next";

// Memoized Coupon Card Component
const CouponCard = memo(({ coupon, onCardClick, t }) => {
  return (
    <div
      key={coupon.id}
      className="bg-white border-2 border-main shadow-md rounded-lg flex flex-col items-center text-center p-4 w-64 
hover:shadow-lg hover:-translate-y-2 transition-transform duration-300 ease-in-out card wallet"
      onClick={() => onCardClick(coupon)}
    >
      <div className="overlay2" />
      {/* Logo */}
      <div className="w-20 h-20 flex items-center justify-center mb-4 z-50">
        <img
          src={coupon.logo}
          alt={i18n.language === "ar" ? coupon.title_ar : coupon.title_en} // Use translated title for alt text
          className="w-full h-full object-contain rounded-md z-50"
          loading="lazy" // Lazy load images
        />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-main mb-1 z-50">
        {i18n.language === "ar" ? coupon.title_ar : coupon.title_en}
      </h3>

      {/* Discount Text */}
      <p className="text-main text-sm mb-4 z-50">
        {i18n.language === "ar" ? coupon.codeVal_ar : coupon.codeVal_en}
      </p>

      {/* CTA Button */}
      <button className="bg-main text-white text-sm font-medium py-2 px-6 rounded-full hover:bg-main transition-colors duration-200 z-50 mt-8">
        {t("Code")}
      </button>
    </div>
  );
});
CouponCard.displayName = "CouponCard"; // Add display name for better debugging

const Coupons = () => {
  const [allCoupons, setAllCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [copyMessage, setCopyMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState([]); // Dynamic categories
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [couponSnap, categorySnap] = await Promise.all([
          getDocs(
            query(
              collection(db, "products"),
              where("approved", "==", true),
              orderBy("order", "asc")
            )
          ),
          getDocs(collection(db, "categories")),
        ]);

        const fetchedCoupons = couponSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const fetchedCategories = categorySnap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            // Ensure consistent name property for filtering and display
            name:
              i18n.language === "ar"
                ? data.name_ar || data.name_en
                : data.name_en || data.name_ar,
            name_en: data.name_en,
            name_ar: data.name_ar,
          };
        });
        setAllCoupons(fetchedCoupons);
        // Update categories to use the current language for display name, but keep original names for filtering if needed
        setCategories([
          { id: "all", name: t("All") },
          ...fetchedCategories.map((cat) => ({
            ...cat,
            name:
              i18n.language === "ar"
                ? cat.name_ar || cat.name_en
                : cat.name_en || cat.name_ar,
          })),
        ]);
      } catch (error) {
        console.error("Error fetching data: ", error);
        // Handle error state appropriately, e.g., show an error message to the user
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Consider if i18n.language is truly needed here. If category names are fetched with both ar/en versions,
    // the translation can happen at render time, or categories state can be updated without re-fetching coupons.
    // For now, keeping it to ensure category names are updated in the dropdown.
  }, [i18n.language, t]); // Added t to dependencies as it's used in 'All' category name

  const filteredCoupons = useMemo(() => {
    let filtered = [...allCoupons];
    if (selectedCategory !== "All") {
      // Assuming category object in selectedCategory has id and name properties
      // And coupon has category_en or category_ar that matches the name from fetchedCategories
      filtered = filtered.filter((coupon) => {
        // Find the category object that matches selectedCategory (which is a string name)
        const categoryObject = categories.find(
          (c) => c.name === selectedCategory
        );
        if (categoryObject && categoryObject.id !== "all") {
          // Assuming coupon.category is an ID or a direct name that matches categoryObject.id or specific language name
          // This part might need adjustment based on how coupon.category is stored (ID vs name)
          // For now, let's assume coupon.category_en/ar stores the name that matches categoryObject.name_en/ar
          return (
            coupon.category_en === categoryObject.name_en ||
            coupon.category_ar === categoryObject.name_ar ||
            coupon.category_en === selectedCategory ||
            coupon.category_ar === selectedCategory
          );
        }
        return true; // If 'All' or category not found, don't filter by category yet
      });
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (coupon) =>
          (coupon.title_en &&
            coupon.title_en.toLowerCase().includes(lowerSearchTerm)) ||
          (coupon.title_ar &&
            coupon.title_ar.toLowerCase().includes(lowerSearchTerm))
      );
    }
    return filtered;
  }, [allCoupons, searchTerm, selectedCategory, categories]);

  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const handleCategoryChange = useCallback((categoryName) => {
    // categoryName is the display name from the dropdown
    setSelectedCategory(categoryName);
  }, []);

  const handleCardClick = useCallback((coupon) => {
    setSelectedCoupon(coupon);
  }, []);

  const closePopup = useCallback(() => {
    setSelectedCoupon(null);
    setCopyMessage("");
  }, []);

  const handleCopy = useCallback(() => {
    if (selectedCoupon && selectedCoupon.code) {
      navigator.clipboard
        .writeText(selectedCoupon.code)
        .then(() => {
          setCopyMessage(t("Copied to clipboard!")); // Use t function for translation
          setTimeout(() => setCopyMessage(""), 2000);
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
          setCopyMessage(t("Failed to copy. Try again!")); // Use t function for translation
        });
    }
  }, [selectedCoupon, t]); // Added t to dependencies

  if (loading) {
    return (
      <div>
        <Loading />
      </div>
    );
  }

  return (
    <StyledWrapper>
      <SearchBar
        categories={categories.map((c) => ({
          ...c,
          name:
            i18n.language === "ar"
              ? c.name_ar || c.name_en || c.name
              : c.name_en || c.name_ar || c.name,
        }))} // Ensure category names are translated for SearchBar
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange} // Pass the name string
        placeholder={t("Search...")} // Use t function for translation
        selectedCategory={selectedCategory}
      />

      {/* Coupon List */}
      <div className="container mx-auto flex flex-wrap justify-center md:justify-start gap-7 lg:gap-8 px-6 py-4">
        {filteredCoupons.map((coupon) => (
          <CouponCard
            key={coupon.id} // Key should be on the actual component being mapped
            coupon={coupon}
            onCardClick={handleCardClick}
            t={t} // Pass t function for translations inside CouponCard
          />
        ))}
      </div>

      {/* Pop Up */}
      {selectedCoupon && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 backdrop-blur-md z-[999999]">
          <div className="relative bg-white text-main border-2 border-main text-center p-10 rounded-lg shadow-lg w-10/12 md:w-6/12 lg:w-6/12 xl:w-4/12">
            <span
              onClick={closePopup}
              className="absolute top-3 right-3 border border-main rounded p-1 hover:bg-main hover:text-white text-2xl cursor-pointer"
            >
              &#10008;
            </span>
            <img
              src={selectedCoupon.logo}
              alt={
                i18n.language === "ar"
                  ? selectedCoupon.title_ar
                  : selectedCoupon.title_en
              } // Translated alt text
              className="w-20 rounded-lg mb-5 mx-auto"
              loading="lazy" // Lazy load image in popup as well
            />
            <h3 className="text-xl font-medium leading-8 mb-5">
              {i18n.language === "ar"
                ? selectedCoupon.title_ar
                : selectedCoupon.title_en}
              <br />
              {i18n.language === "ar"
                ? selectedCoupon.codeVal_ar
                : selectedCoupon.codeVal_en}
            </h3>
            <div className="relative bg-main text-white text-center p-10 rounded-lg shadow-lg">
              <div className="flex items-center justify-center mt-6 mb-4">
                <span className="border border-dashed border-white py-2 px-4 border-r-0">
                  {selectedCoupon.code}
                </span>
                <button
                  onClick={handleCopy}
                  className="border border-white bg-white text-main py-2 px-4 cursor-pointer"
                >
                  {t("Copy")} {/* Use t function for translation */}
                </button>
              </div>
              {copyMessage && (
                <p className="text-white mt-2 text-sm">{copyMessage}</p>
              )}
              <div className="absolute w-12 h-12 bg-white rounded-full top-1/2 -translate-y-1/2 left-[-25px]"></div>
              <div className="absolute w-12 h-12 bg-white rounded-full top-1/2 -translate-y-1/2 right-[-25px]"></div>
            </div>
          </div>
        </div>
      )}
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  margin-top: 20px;

  .search-bar {
    margin: 20px auto;
  }

  /* Retained original card styles */
  .wallet {
    --bg-color: #cd3232;
    --bg-color-light: #cd3232;
    --text-color-hover: #fff;
    --box-shadow-color: rgba(255, 105, 97, 0.48);
  }

  .card {
    width: 220px;
    height: 321px;
    background: #fff;
    border-radius: 10px;
    border: 2px solid #cd3232;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    box-shadow: 0 14px 26px rgba(0, 0, 0, 0.04);
    transition: all 0.3s ease-out;
    text-decoration: none;
    cursor: pointer;
  }

  .card:hover {
    transform: translateY(-5px) scale(1.005) translateZ(0);
    box-shadow: 0 24px 36px rgba(0, 0, 0, 0.11),
      0 24px 46px var(--box-shadow-color);
  }

  .card:hover .overlay {
    transform: scale(4) translateZ(0);
  }

  .card:hover .circle {
    border-color: var(--bg-color-light);
    background: var(--bg-color);
  }

  .card:hover .circle:after {
    background: var(--bg-color-light);
  }

  .card:hover p {
    color: var(--text-color-hover);
  }
  .card:hover h3 {
    color: var(--text-color-hover);
  }
  .card:hover button {
    border: 2px solid #fff;
  }

  .card p {
    font-size: 17px;
    color: #cd3232;
    font-weight: 700;
    margin-top: 10px;
    z-index: 1000;
    transition: color 0.3s ease-out;
  }

  .card span {
    z-index: 1000;
    color: #cd3232;
  }

  .card:hover span {
    color: var(--text-color-hover);
  }

  .circle {
    width: 131px;
    height: 131px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid var(--bg-color);
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    z-index: 1;
    transition: all 0.3s ease-out;
  }

  .circle:after {
    content: "";
    width: 118px;
    height: 118px;
    display: block;
    position: absolute;
    background: var(--bg-color);
    border-radius: 50%;
    top: 7px;
    left: 7px;
    transition: opacity 0.3s ease-out;
  }

  .circle img {
    z-index: 10000;
    transform: translateZ(0);
  }

  .overlay {
    width: 118px;
    position: absolute;
    height: 118px;
    border-radius: 50%;
    background: var(--bg-color);
    top: 70px;
    left: 50px;
    z-index: 0;
    transition: transform 0.3s ease-out;
  }

  .card:hover .overlay2 {
    transform: scale(4) translateZ(0);
    background: #cd3232;
  }
  .overlay2 {
    width: 118px;
    position: absolute;
    height: 118px;
    border-radius: 50%;
    background: #ffffff;
    top: 70px;
    left: 50px;
    z-index: 0;
    transition: transform 0.3s ease-out;
  }

  .overlay2L::hover {
    background: #cd3232;
  }

  /* Popup styles */

  .code {
    font-weight: bold;
    color: #333;
    margin-right: 10px;
  }

  .close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #333;
  }
`;

export default Coupons;
