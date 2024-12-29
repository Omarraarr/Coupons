import { FaFacebook,  FaInstagram } from 'react-icons/fa';
import { FaSquareXTwitter } from 'react-icons/fa6';
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <div className="footer w-full bg-main h-28 mt-5 rounded-t-3xl flex flex-col items-center justify-center text-white">
      {/* Social Media Icons */}
      <div className="flex  mb-2 gap-2">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-blue-500">
          <FaFacebook />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-black">
          <FaSquareXTwitter />  
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-2xl hover:text-pink-500">
          <FaInstagram />
        </a>
      </div>
      {/* Copyright Notice */}
      <p className="text-sm">&copy; {new Date().getFullYear()} {t("CopyRight")} </p>
    </div>
  );
};

export default Footer;
