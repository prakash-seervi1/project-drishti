import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Menu as MenuIcon, X as CloseIcon } from "lucide-react"

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/Dashboard", label: "Dashboard" },
  { to: "/Incidents", label: "Incidents" },
  { to: "/Map", label: "Map" },
  { to: "/Report", label: "Report" },
  { to: "/Summary", label: "Summary" },
]

export default function MobileMenu() {
  const [open, setOpen] = useState(false)
  const accesscode = parseInt(localStorage.getItem('accesscode') || '0');
  const isAdmin = accesscode === 127;
  const navigate = useNavigate();

  // Filter nav links based on access level
  const filteredNavLinks = isAdmin 
    ? navLinks 
    : [];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <>
      {/* Hamburger/Close Icon - always top-right on mobile */}
      <button
        className="fixed top-4 right-4 z-[100] p-2 bg-white rounded-full shadow-lg md:hidden"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? (
          <CloseIcon className="w-7 h-7 text-gray-800" />
        ) : (
          <MenuIcon className="w-7 h-7 text-gray-800" />
        )}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sliding Sidebar */}
      <nav
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 md:hidden ${open ? "translate-x-0" : "translate-x-full"}`}
        aria-label="Mobile menu"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-bold text-lg text-gray-800">Menu</span>
        </div>
        <ul className="flex flex-col p-4 space-y-2">
          {filteredNavLinks.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className="block px-3 py-2 rounded text-gray-700 hover:bg-blue-100 text-base font-medium"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        {/* Logout button always visible if logged in */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>
    </>
  )
} 