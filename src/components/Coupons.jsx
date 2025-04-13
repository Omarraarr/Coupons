import { useEffect, useState } from "react";
import styled from "styled-components";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import SearchBar from "./SearchBar";
import Loading from "./Loading";
import { useTranslation } from "react-i18next";
import i18n from "i18next";

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [copyMessage, setCopyMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState([]); // Dynamic categories
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      const [couponSnap, categorySnap] = await Promise.all([
        getDocs(
          query(
            collection(db, "products"),
            where("approved", "==", true),
            orderBy("order","asc") // Add ordering here
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
          name: i18n.language === 'ar' ? (data.name_ar || data.name_en) : (data.name_en || data.name_ar),
        };
      });
      setCoupons(fetchedCoupons);
      setFilteredCoupons(fetchedCoupons);
      setCategories([{ id: "all", name: "All" }, ...fetchedCategories]);
      setLoading(false);
    };
  
    fetchData();
  },[i18n.language]);
  

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    filterCoupons(term, selectedCategory);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    console.log("Selected category:", category);
    filterCoupons(searchTerm, category);
  };

  const filterCoupons = (term, category) => {
    let filtered = [...coupons];
    if (category !== "All") {
      filtered = filtered.filter((coupon) => {
        console.log(
          "Checking coupon category:",
          (
            coupon.category_ar === category || 
            coupon.category_en === category
          ),
          "against",
          category
        );
        return (
          coupon.category_ar === category || 
          coupon.category_en === category
        );
      });
    }
    if (term) {
      filtered = filtered.filter((coupon) =>
        (coupon.title_en && coupon.title_en.toLowerCase().includes(term.toLowerCase())) ||
        (coupon.title_ar && coupon.title_ar.toLowerCase().includes(term.toLowerCase()))
      );
    }
    setFilteredCoupons(filtered);
  };

  const handleCardClick = (coupon) => {
    setSelectedCoupon(coupon);
  };

  const closePopup = () => {
    setSelectedCoupon(null);
    setCopyMessage("");
  };

  const handleCopy = () => {
    if (selectedCoupon && selectedCoupon.code) {
      navigator.clipboard
        .writeText(selectedCoupon.code)
        .then(() => {
          setCopyMessage("Copied to clipboard!");
          setTimeout(() => setCopyMessage(""), 2000);
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
          setCopyMessage("Failed to copy. Try again!");
        });
    }
  };

if (loading) {
    return (
      <StyledWrapper>
        <SearchBar
          categories={[]}
          onSearchChange={() => {}}
          onCategoryChange={() => {}}
        />
        <div className="flex justify-center items-center h-96">
          <Loading />
        </div>
      </StyledWrapper>
    );
  }

  return (
    <StyledWrapper>
      <SearchBar
        categories={categories}
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
        placeholder="Search..."
      />

      {/* Coupon List */}
      <div className="container mx-auto flex flex-wrap justify-center md:justify-start gap-7 lg:gap-8 px-6 py-4">
        {filteredCoupons
        
        .map((coupon) => (
          <div
            key={coupon.id}
            className="bg-white border-2 border-main shadow-md rounded-lg flex flex-col items-center text-center p-4 w-64 
      hover:shadow-lg hover:-translate-y-2 transition-transform duration-300 ease-in-out card wallet"
            onClick={() => handleCardClick(coupon)}
          >
            <div className="overlay2" />
            {/* Logo */}
            <div className="w-20 h-20 flex items-center justify-center mb-4 z-50">
              <img
                src={coupon.logo}
                alt={coupon.title}
                className="w-full h-full object-contain rounded-md z-50"
              />
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-main mb-1 z-50">
              {i18n.language === "ar" ? coupon.title_ar: coupon.title_en}
            </h3>

            {/* Discount Text */}
            <p className="text-main text-sm mb-4 z-50">
              {i18n.language === "ar" ? coupon.codeVal_ar :  coupon.codeVal_en}
            </p>

            {/* CTA Button */}
            <button className="bg-main text-white text-sm font-medium py-2 px-6 rounded-full hover:bg-main transition-colors duration-200 z-50 mt-8">
              {t("Code")}
            </button>
          </div>
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
              alt="Logo"
              className="w-20 rounded-lg mb-5 mx-auto"
            />
            <h3 className="text-xl font-medium leading-8 mb-5">
              {i18n.language === "ar" ? selectedCoupon.title_ar : selectedCoupon.title_en}
              <br />
              {i18n.language === "ar" ? selectedCoupon.codeVal_ar : selectedCoupon.codeVal_en}
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
                  Copy
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
