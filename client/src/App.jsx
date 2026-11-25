import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Cart from './pages/Cart.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Checkout from './pages/Checkout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Forgot from './pages/Forgot.jsx';
import Reset from './pages/Reset.jsx';
import Account from './pages/Account.jsx';
import MyOrders from './pages/MyOrders.jsx';
import OrderDetails from './pages/OrderDetails.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import FAQ from './pages/FAQ.jsx';
import Privacy from './pages/Privacy.jsx';
import Terms from './pages/Terms.jsx';
import ReturnPolicy from './pages/ReturnPolicy.jsx';
import ShippingPolicy from './pages/ShippingPolicy.jsx';
import NotFound from './pages/NotFound.jsx';
import AdminLayout from './pages/Admin/AdminLayout.jsx';
import AdminDashboard from './pages/Admin/Dashboard.jsx';
import AdminProducts from './pages/Admin/Products.jsx';
import AdminCategories from './pages/Admin/Categories.jsx';
import AdminOrders from './pages/Admin/Orders.jsx';
import AdminCoupons from './pages/Admin/Coupons.jsx';
import AdminReviews from './pages/Admin/Reviews.jsx';
import AdminSettings from './pages/Admin/Settings.jsx';
import AdminLogin from './pages/Admin/Login.jsx';
import NewArrivals from './pages/NewArivals.jsx';
import Sale from './pages/Sale.jsx';
import MyAccount from './pages/MyAccount';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-center">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}
function AdminProtected({ children }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!user) return <Navigate to="/admin/login" />;
  if (!isAdmin) return <div className="p-20 text-center text-red-600">403 - Admin Only</div>;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/category/:slug" element={<Products />} />
        <Route path="/new-arivals" element={<NewArrivals />} />
        <Route path="/featured" element={<Products />} />
        <Route path="/trending" element={<Products />} />
        <Route path="/sale" element={<Sale />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<Forgot />} />
        <Route path="/reset-password/:token" element={<Reset />} />
        <Route path="/account" element={<Protected><Account /></Protected>} />
        <Route path="/my-orders" element={<Protected><MyOrders /></Protected>} />
        <Route path="/order/:id" element={<Protected><OrderDetails /></Protected>} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/return-policy" element={<ReturnPolicy />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/my-account" element={<MyAccount />} />
<Route path="/my-orders" element={<MyAccount />} />
      </Route>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminProtected><AdminLayout /></AdminProtected>}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
}