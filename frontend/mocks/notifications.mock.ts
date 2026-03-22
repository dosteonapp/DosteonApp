/**
 * Mock data for Notifications.
 */

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: string;
  unread: boolean;
  actionLink?: {
    href: string;
    text: string;
  };
}

export const notifications: Notification[] = [
  {
    id: "1",
    title: "Low Stock Alert: Tomatoes",
    message:
      "Tomatoes are running low. Current stock: 2.5kg (below minimum threshold of 5kg).",
    time: "10 minutes ago",
    type: "alert",
    unread: true,
    actionLink: {
      href: "/dashboard/inventory",
      text: "Review Stock",
    },
  },
  {
    id: "2",
    title: "Order Confirmed",
    message: "Your order #ORD-7890 from Metro Meats has been confirmed.",
    time: "1 hour ago",
    type: "order",
    unread: true,
  },
  {
    id: "3",
    title: "Order Out for Delivery",
    message: "Your order #ORD-7889 from Global Grocers is out for delivery.",
    time: "3 hours ago",
    type: "order",
    unread: true,
  },
  {
    id: "4",
    title: "Low Stock Alert: Chicken Breast",
    message:
      "Chicken Breast is running low. Current stock: 8kg (below minimum threshold of 10kg).",
    time: "5 hours ago",
    type: "alert",
    unread: true,
    actionLink: {
      href: "/dashboard/inventory",
      text: "Review Stock",
    },
  },
  {
    id: "5",
    title: "Order Delivered",
    message:
      "Your order #ORD-7888 from Organic Supplies Co. has been delivered.",
    time: "Yesterday",
    type: "order",
    unread: true,
  },
  {
    id: "6",
    title: "Inventory Updated",
    message:
      "Your inventory has been updated based on the delivery of order #ORD-7888.",
    time: "Yesterday",
    type: "inventory",
    unread: true,
    actionLink: {
      href: "/dashboard/inventory",
      text: "View Inventory",
    },
  },
  {
    id: "7",
    title: "Low Stock Alert: Onions",
    message:
      "Onions are running low. Current stock: 5kg (below minimum threshold of 8kg).",
    time: "Yesterday",
    type: "alert",
    unread: true,
    actionLink: {
      href: "/dashboard/inventory",
      text: "Review Stock",
    },
  },
  {
    id: "8",
    title: "Order Delivered",
    message: "Your order #ORD-7887 from Dairy Delights has been delivered.",
    time: "2 days ago",
    type: "order",
    unread: false,
  },
  {
    id: "9",
    title: "Inventory Updated",
    message:
      "Your inventory has been updated based on the delivery of order #ORD-7887.",
    time: "2 days ago",
    type: "inventory",
    unread: false,
    actionLink: {
      href: "/dashboard/inventory",
      text: "View Inventory",
    },
  },
  {
    id: "10",
    title: "Order Placed",
    message:
      "Your order #ORD-7886 to Fresh Farms Inc. has been placed successfully.",
    time: "3 days ago",
    type: "order",
    unread: false,
  },
];
