export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Waimao Platform</h3>
            <p className="text-gray-400 text-sm">
              Your trusted partner for high-quality industrial fasteners and components. 
              Connecting global standards with precision manufacturing.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/products" className="hover:text-white">Products</a></li>
              <li><a href="/inquiries" className="hover:text-white">Track Order</a></li>
              <li><a href="/dashboard" className="hover:text-white">Dashboard</a></li>
              <li><a href="#" className="hover:text-white">About Us</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Email: sales@waimao-platform.com</li>
              <li>Phone: +86 571 8888 8888</li>
              <li>Add: No. 123 Industrial Park, Hangzhou, China</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Waimao Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
