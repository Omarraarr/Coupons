import { useEffect, useState } from "react";
import Loading from "../components/Loading";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "i18next";

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryNameEn, setCategoryNameEn] = useState("");
  const [categoryNameAr, setCategoryNameAr] = useState("");
  const [categories, setCategories] = useState([]);
  const [orderUpdates, setOrderUpdates] = useState({});

  const navigate = useNavigate();

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsData);
      setLoading(false);
      console.log(productsData);
    };
    fetchProducts();
    fetchCategories();
  }, []);

  // Fetch categories
  const fetchCategories = async () => {
    const querySnapshot = await getDocs(collection(db, "categories"));
    const categoriesData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCategories(categoriesData);
  };

  // Add a new category
  const addCategory = async () => {
    if (!categoryNameEn.trim() || !categoryNameAr.trim()) {
      console.error("Both English and Arabic names are required");
      return;
    }

    try {
      await addDoc(collection(db, "categories"), {
        name_en: categoryNameEn,
        name_ar: categoryNameAr,
      });
      fetchCategories();
      setCategoryNameEn("");
      setCategoryNameAr("");
      console.log("Category added successfully!");
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  // Delete a category
  const deleteCategory = async (categoryId) => {
    try {
      await deleteDoc(doc(db, "categories", categoryId));
      fetchCategories();
      console.log("Category deleted successfully!");
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const updateProductApproval = async (productId, approved) => {
    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, { approved });
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId ? { ...product, approved } : product
      )
    );
  };

  // Update Product Order
  const updateProductOrder = async (productId, newOrder) => {
    try {
      const productRef = doc(db, "products", productId);
      await updateDoc(productRef, { order: newOrder });
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === productId ? { ...product, order: newOrder } : product
        )
      );
      setOrderUpdates((prevUpdates) => {
        const updated = { ...prevUpdates };
        delete updated[productId];
        return updated;
      });
      console.log("Order updated successfully!");
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  // Delete a product
  const deleteProduct = async (productId) => {
    try {
      const productRef = doc(db, "products", productId);
      await deleteDoc(productRef);
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product.id !== productId)
      );
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const { t } = useTranslation();
  
  if (loading) {
    return (
      <Loading />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-6 py-8">
        {/* Product List */}
        <div className="mt-8">
          {/* Approved Coupons Section */}
          <h2 className="text-xl font-bold text-main mb-4">
            {t("ApprovedCoupons")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products
              .filter((product) => product.approved)
              .sort((a, b) => (a.order || Infinity) - (b.order || Infinity))
              .map((product) => (
                <div
                  key={product.id}
                  className="bg-white shadow rounded-lg p-4 border border-main hover:shadow-lg transition duration-300"
                >
                  <img
                    src={product.logo}
                    alt="Product logo"
                    className="w-20 h-20 mx-auto mb-4"
                  />
                  <h2 className="text-lg font-semibold text-main mb-2 text-center">
                    {t("dashCouponTitle")}:{" "}
                    {i18n.language === "ar"
                      ? product.title_ar
                      : product.title_en}
                  </h2>
                  <p className="text-main text-center mb-2">
                    {t("dashCouponValue")}:{" "}
                    {i18n.language === "ar"
                      ? product.codeVal_ar
                      : product.codeVal_en}
                  </p>
                  <p className="text-main text-center">
                    {t("Category")}: {i18n.language === "ar" ? product.category_ar : product.category_en}
                  </p>
                  <p className="text-main text-center">
                    {t("CouponCode")}: {product.code}
                  </p>
                  <p className="text-sm font-medium text-center text-main">
                    {t("Status")}: Approved
                  </p>
                  <div className="flex justify-center gap-2 mt-4">
                    <button
                      onClick={() => updateProductApproval(product.id, false)}
                      className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-200"
                    >
                      {t("Disapprove")}
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition duration-200"
                    >
                      {t("Delete")}
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <input
                      type="number"
                      placeholder={t("Order")}
                      value={orderUpdates[product.id] || product.order || ""}
                      onChange={(e) =>
                        setOrderUpdates({
                          ...orderUpdates,
                          [product.id]: parseInt(e.target.value, 10),
                        })
                      }
                      className="py-1 px-1 border rounded w-10 text-center focus:outline-none focus:border-main"
                    />

                    <button
                      onClick={() =>
                        updateProductOrder(
                          product.id,
                          orderUpdates[product.id] || product.order
                        )
                      }
                      className="bg-blue-500 text-white py-1 px-4 rounded hover:bg-blue-600 transition duration-200"
                    >
                      {t("UpdateOrder")}
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Unapproved Coupons Section */}
          <h2 className="text-xl font-bold text-main mb-4 mt-8">
            {t("UnapprovedCoupons")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products
              .filter((product) => !product.approved)
              .map((product) => (
                <div
                  key={product.id}
                  className="bg-white shadow rounded-lg p-4 border border-main hover:shadow-lg transition duration-300"
                >
                  <img
                    src={product.logo}
                    alt="Product logo"
                    className="w-20 h-20 mx-auto mb-4"
                  />
                  <h2 className="text-lg font-semibold text-main mb-2 text-center">
                    {t("dashCouponTitle")}:{" "}
                    {i18n.language === "ar"
                      ? product.title_ar
                      : product.title_en}
                  </h2>
                  <p className="text-main text-center mb-2">
                    {t("dashCouponValue")}:{" "}
                    {i18n.language === "ar"
                      ? product.codeVal_ar
                      : product.codeVal_en}
                  </p>
                  <p className="text-main text-center">
                    {t("Category")}: {product.category}
                  </p>
                  <p className="text-main text-center">
                    {t("CouponCode")}: {product.code}
                  </p>
                  <p className="text-sm font-medium text-center text-yellow-600">
                    {t("Status")}: Pending Approval
                  </p>
                  <div className="flex justify-center gap-2 mt-4">
                    <button
                      onClick={() => updateProductApproval(product.id, true)}
                      className="bg-green-500 text-white py-1 px-4 rounded hover:bg-green-600 transition duration-200"
                    >
                      {t("Approve")}
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="bg-gray-500 text-white py-1 px-4 rounded hover:bg-gray-600 transition duration-200"
                    >
                      {t("Delete")}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Add Category Form */}
        <div className="bg-white border border-main p-4 rounded-lg shadow mb-6 mt-10 ">
          <h2 className="text-xl font-semibold mb-4 text-main">
            {t("AddCategory")}
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-2">
            <input
              type="text"
              placeholder="Category Name in English"
              value={categoryNameEn}
              onChange={(e) => setCategoryNameEn(e.target.value)}
              className="py-2 px-4 border rounded w-full focus:outline-none focus:border-main"
            />
            <input
              type="text"
              placeholder="Category Name in Arabic"
              value={categoryNameAr}
              onChange={(e) => setCategoryNameAr(e.target.value)}
              className="py-2 px-4 border rounded w-full focus:outline-none focus:border-main"
            />
            <button
              onClick={addCategory}
              className="bg-text text-main border border-main py-2 px-4 rounded hover:border hover:bg-main hover:text-text transition"
            >
              {t("Add")}
            </button>
          </div>
        </div>
        {/* List Categories */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2 text-main">
            {t("Categories")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white shadow rounded-lg p-4 border border-main hover:shadow-lg transition duration-300"
              >
                <h4 className="text-gray-800 font-semibold text-center mb-2">
                  {i18n.language === "ar" ? category.name_ar : category.name_en}
                </h4>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => deleteCategory(category.id)}
                    className="bg-red-600 text-white py-1 px-4 rounded hover:bg-red-700 transition duration-200"
                  >
                    {t("Delete")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-red-700 transition duration-200"
          >
            {t("Logout")}
          </button>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
