import "./Footer.css";
import { FaGithub, FaLinkedin, FaHeart } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="footer">
      <p>
        Developed with <FaHeart className="heart" /> by
        <strong> Arpit Raj Katiyar</strong>
      </p>
    </footer>
  );
}