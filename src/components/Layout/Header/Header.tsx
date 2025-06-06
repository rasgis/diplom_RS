import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../../reducers/authSlice";
import { RootState, AppDispatch } from "../../../store";
import { scrollToTop } from "../../../utils/scroll";
import { ROUTES } from "../../../constants/routes";
import ThemeToggle from "../../ThemeToggle/ThemeToggle";
import {
  FaShoppingCart,
  FaUser,
  FaBars,
  FaTimes,
  FaCog,
  FaUsers,
  FaListAlt,
  FaBoxes,
  FaArrowLeft,
} from "react-icons/fa";
import styles from "./Header.module.css";
import "./admin-fix.css";
import "./mobile-media.css";

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const user = useSelector((state: RootState) => state.auth.user);
  const cartItemCount = useSelector(
    (state: RootState) => state.cart.items.length
  );
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const [showBackButton, setShowBackButton] = useState(false);

  useEffect(() => {
    setShowBackButton(location.pathname !== "/");
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    setMobileMenuOpen(false);
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    scrollToTop();
  };

  const renderNavigationItems = () => {
    return (
      <>
        <nav className={styles.nav}>
          <Link
            to="/catalog"
            className={styles.navLink}
            onClick={closeMobileMenu}
          >
            <FaListAlt className={styles.navIcon} /> Каталог
          </Link>
          <Link
            to="/all-products"
            className={styles.navLink}
            onClick={closeMobileMenu}
          >
            <FaBoxes className={styles.navIcon} /> Все товары
          </Link>
        </nav>

        {isAuthenticated && user?.role === "admin" && (
          <nav className={isMobile ? `${styles.adminNav} admin-nav-fix` : styles.adminNav}>
            <Link
              to="/admin/products"
              className={isMobile ? `${styles.adminLink} admin-link-fix` : styles.adminLink}
              onClick={closeMobileMenu}
              title="Продукты"
            >
              <FaCog className={styles.adminIcon} />
              <span className={styles.adminLinkText}>Продукты</span>
            </Link>
            <Link
              to="/admin/categories"
              className={isMobile ? `${styles.adminLink} admin-link-fix` : styles.adminLink}
              onClick={closeMobileMenu}
              title="Категории"
            >
              <FaListAlt className={styles.adminIcon} />
              <span className={styles.adminLinkText}>Категории</span>
            </Link>
            <Link
              to="/admin/users"
              className={isMobile ? `${styles.adminLink} admin-link-fix` : styles.adminLink}
              onClick={closeMobileMenu}
              title="Пользователи"
            >
              <FaUsers className={styles.adminIcon} />
              <span className={styles.adminLinkText}>Пользователи</span>
            </Link>
          </nav>
        )}
      </>
    );
  };

  const renderUserMenuItems = () => {
    return (
      <>
        <ThemeToggle />
        {isAuthenticated && (
          <div className={styles.cart}>
            <Link
              to="/cart"
              className={styles.cartLink}
              onClick={closeMobileMenu}
            >
              <FaShoppingCart className={styles.cartIcon} /> ({cartItemCount})
            </Link>
          </div>
        )}
        <div className={styles.auth}>
          {isAuthenticated && user ? (
            <div className={styles.userInfo}>
              <Link
                to={ROUTES.PROFILE}
                className={styles.userLink}
                title="Перейти в профиль"
              >
                <FaUser className={styles.userIcon} />
                <span className={styles.userName}>
                  {user.name || user.login || "Профиль"}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className={styles.logoutButton}
                title="Выйти"
              >
                <FaTimes />
              </button>
            </div>
          ) : (
            <div className={styles.authLinks}>
              <Link
                to={ROUTES.LOGIN}
                className={styles.authLink}
                onClick={closeMobileMenu}
              >
                Вход
              </Link>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerWrapper}>
        <div className={styles.container}>
          <div className={styles.leftSection}>
            {showBackButton && (
              <button
                className={styles.backButton}
                onClick={handleGoBack}
                aria-label="Вернуться назад"
                title="Назад"
              >
                <FaArrowLeft />
              </button>
            )}
            <Link
              to="/"
              className={styles.logoContainer}
              onClick={closeMobileMenu}
            >
              <img
                src="/logo-stroy.png"
                alt="StroyCity Logo"
                className={styles.logo}
              />
              <span className={styles.logoText}>StroyCity</span>
            </Link>
            <div className={styles.mobileActions}>{renderUserMenuItems()}</div>
            <button
              className={styles.mobileMenuButton}
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>

          <div
            className={`${styles.rightSection} ${
              mobileMenuOpen ? styles.mobileMenuOpen : ""
            }`}
          >
            {renderNavigationItems()}
            <div className={styles.desktopActions}>{renderUserMenuItems()}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
