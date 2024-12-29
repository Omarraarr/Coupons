import { useState, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Ensure the correct Firebase setup
import { useTranslation } from "react-i18next";

const AddCouponButton = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [categories, setCategories] = useState([]); // State to store categories
  const [formData, setFormData] = useState({
    title_en: "",
    title_ar: "",
    code_en: "",
    code_ar: "",
    codeVal_en: "",
    codeVal_ar: "",
    logo: "",
    approved: false,
    order: "",
    category: "",
  });

  const { t } = useTranslation();

  useEffect(() => {
    // Fetch categories from Firestore
    const fetchCategories = async () => {
      try {
        const categoriesCollection = collection(db, "categories");
        const categoriesSnapshot = await getDocs(categoriesCollection);
        const categoriesData = categoriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const toggleForm = () => {
    setIsFormOpen(!isFormOpen);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const productsCollection = collection(db, "products");

      await addDoc(productsCollection, formData);
      setFormData({
        title_en: "",
        title_ar: "",
        code: "",
        codeVal_en: "",
        codeVal_ar: "",
        logo: "",
        approved: false,
        order: "",
        category_en: "",
        category_ar: "",
      });
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error adding coupon:", error);
      alert("Failed to add coupon. Please try again.");
    }
  };

  return (
    <div>
      <button
        onClick={toggleForm}
        className="px-4 py-2 bg-button text-main font-medium rounded-lg transition-all duration-100 ease-in-out hover:bg-main hover:text-button hover:border-text hover:border-2 shadow-md"
      >
        {t("AddCoupon")}
      </button>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl"
          >
            <h2 className="text-2xl font-bold mb-4 text-main text-center">
              {t("AddCoupon")}
            </h2>
            <div className="couponinfo flex flex-row gap-4">
              <div className="englishData w-6/12">
                <div className="mb-4">
                  <label
                    htmlFor="title_en"
                    className="block text-sm font-medium text-main"
                  >
                    {t("formTitleen")}
                  </label>
                  <input
                    type="text"
                    id="title_en"
                    name="title_en"
                    value={formData.title_en}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-main focus:border-main sm:text-sm"
                    placeholder={t("EnterTitle")}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="codeVal_en"
                    className="block text-sm font-medium text-main"
                  >
                    {t("formValueen")}
                  </label>
                  <input
                    type="text"
                    id="codeVal_en"
                    name="codeVal_en"
                    value={formData.codeVal_en}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-main focus:border-main sm:text-sm"
                    placeholder={t("EnterValue")}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-main"
                  >
                    {t("formCaten")}
                  </label>
                  <select
                    id="category_en"
                    name="category_en"
                    value={formData.category_en}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-main focus:border-main sm:text-sm"
                    required
                  >
                    <option value="" disabled>
                      {t("SelectCategory")}
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name_en}>
                        {t(category.name_en)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="arabicData w-6/12">
                <div className="mb-4">
                  <label
                    htmlFor="title_ar"
                    className="block text-sm font-medium text-main"
                  >
                    {t("formTitlear")}
                  </label>
                  <input
                    type="text"
                    id="title_ar"
                    name="title_ar"
                    value={formData.title_ar}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-main focus:border-main sm:text-sm"
                    placeholder={t("EnterTitle_ar")}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="codeVal_ar"
                    className="block text-sm font-medium text-main"
                  >
                    {t("formValuear")}
                  </label>
                  <input
                    type="text"
                    id="codeVal_ar"
                    name="codeVal_ar"
                    value={formData.codeVal_ar}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-main focus:border-main sm:text-sm"
                    placeholder={t("EnterValue_ar")}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="category_ar"
                    className="block text-sm font-medium text-main"
                  >
                    {t("formCatar")}
                  </label>
                  <select
                    id="category_ar"
                    name="category_ar"
                    value={formData.category_ar}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-main focus:border-main sm:text-sm"
                    required
                  >
                    <option value="" disabled>
                      Category Arabic
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name_ar}>
                        {t(category.name_ar)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <label
                htmlFor="code"
                className="block text-sm font-medium text-main"
              >
                {t("CouponCode")}
              </label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-main focus:border-main sm:text-sm"
                placeholder={t("EnterCode")}
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="logo"
                className="block text-sm font-medium text-main"
              >
                {t("LogoURL")}
              </label>
              <input
                type="url"
                id="logo"
                name="logo"
                value={formData.logo}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-main focus:border-main sm:text-sm"
                placeholder={t("EnterLogoURL")}
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-text text-main border border-main font-medium rounded-lg transition-all duration-100 hover:bg-main hover:text-text"
              >
                {t("AddCoupon")}
              </button>
              <button
                type="button"
                onClick={toggleForm}
                className="mr-2 px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg transition-all duration-100 hover:bg-gray-300"
              >
                {t("Cancel")}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddCouponButton;
