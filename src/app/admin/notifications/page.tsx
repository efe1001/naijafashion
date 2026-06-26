"use client";

import { useState } from "react";
import { Bell, CheckCheck, Package, Users, ShoppingCart, AlertTriangle } from "lucide-react";

const NOTIFICATIONS = [
  { id: 1, type: "order", icon: ShoppingCart, title: "New order received", message: "Adaeze Okonkwo placed an order worth ₦52,000", time: "2 mins ago", read: false },
  { id: 2, type: "user", icon: Users, title: "New user registered", message: "Chukwuemeka Eze created an account", time: "15 mins ago", read: false },
  { id: 3, type: "order", icon: ShoppingCart, title: "Order #NF-RT5C1-W8H4 updated", message: "Status changed to Processing by admin", time: "1 hour ago", read: false },
  { id: 4, type: "alert", icon: AlertTriangle, title: "Low stock alert", message: "Igbo George Wrapper Set is out of stock", time: "3 hours ago", read: true },
  { id: 5, type: "order", icon: ShoppingCart, title: "Order delivered", message: "Order #NF-LX9A2-K3M1 was delivered to Adaeze Okonkwo", time: "1 day ago", read: true },
  { id: 6, type: "product", icon: Package, title: "New product added", message: "Classic Polo Shirt was added to the catalog", time: "2 days ago", read: true },
];

const typeColor: Record<string, string> = {
  order: "bg-blue-100 text-blue-600",
  user: "bg-purple-100 text-purple-600",
  alert: "bg-yellow-100 text-yellow-600",
  product: "bg-green-100 text-green-600",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: number) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Bell size={24} />
            Notifications
            {unread > 0 && <span className="text-sm bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">{unread}</span>}
          </h1>
          <p className="text-gray-500 text-sm">{unread} unread notifications</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-2 text-sm text-green-700 font-semibold hover:text-green-800">
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
        {notifications.map(({ id, icon: Icon, title, message, time, read, type }) => (
          <div
            key={id}
            onClick={() => markRead(id)}
            className={`flex items-start gap-4 p-5 cursor-pointer transition-colors hover:bg-gray-50 ${!read ? "bg-green-50/30" : ""}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColor[type]}`}>
              <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-semibold ${read ? "text-gray-700" : "text-gray-900"}`}>{title}</p>
                {!read && <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{message}</p>
              <p className="text-xs text-gray-400 mt-1">{time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
