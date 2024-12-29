import Coupons from "../components/Coupons";
import { useTranslation } from "react-i18next";
const Home = () => {
  const { t } = useTranslation();
  return (
    <>
      <div className="home min-h-screen ">
        <div className="title container mx-auto flex flex-col items-center justify-center text-center px-6 py-4 mt-8">
          <h1 className="text-lg sm:text-3xl md:text-4xl font-bold text-main">
            {t("Title")}
          </h1>
          <p className="text-sm sm:text-md md:text-xl font-medium mt-4">
            {t("Subtitle")}
          </p>
        </div>
        <Coupons />
      </div>
    </>
  );
};

export default Home;
