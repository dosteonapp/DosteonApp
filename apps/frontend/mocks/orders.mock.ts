/**
 * Mock data for the Orders domain.
 */

export const recentOrders = [
  {
    id: "ORD-7891",
    supplier: "Fresh Farms Inc.",
    date: "Today, 10:30 AM",
    status: "Pending",
  },
  {
    id: "ORD-7890",
    supplier: "Metro Meats",
    date: "Yesterday, 2:15 PM",
    status: "Confirmed",
  },
  {
    id: "ORD-7889",
    supplier: "Global Grocers",
    date: "May 2, 2023",
    status: "In Transit",
  },
  {
    id: "ORD-7888",
    supplier: "Organic Supplies Co.",
    date: "May 1, 2023",
    status: "Delivered",
  },
];

export const upcomingDeliveries = [
  {
    id: "ORD-7889",
    supplier: "Global Grocers",
    expectedDate: "Tomorrow, 9:00 AM - 12:00 PM",
  },
  {
    id: "ORD-7890",
    supplier: "Metro Meats",
    expectedDate: "May 5, 2023, 1:00 PM - 3:00 PM",
  },
  {
    id: "ORD-7892",
    supplier: "Dairy Delights",
    expectedDate: "May 6, 2023, 10:00 AM - 2:00 PM",
  },
];

export const orders = [
  {
    id: "ORD-7891",
    date: "May 3, 2023",
    status: "Pending",
    supplier: "Fresh Farms Inc.",
    supplierId: "supplier-1",
    supplierContact: "+250 78 123 4567",
    deliveryAddress: "123 Restaurant Row, Kigali, Rwanda",
    expectedDelivery: "May 4, 2023, 9:00 AM - 12:00 PM",
    estimatedArrival: "N/A",
    timeline: [
      {
        status: "Order Placed",
        date: "May 3, 2023, 10:30 AM",
      },
    ],
    items: [
      {
        id: "item-1",
        name: "Tomatoes",
        category: "Produce",
        unitPrice: 2500,
        quantity: 10,
        unit: "kg",
      },
      {
        id: "item-2",
        name: "Onions",
        category: "Produce",
        unitPrice: 1800,
        quantity: 8,
        unit: "kg",
      },
      {
        id: "item-3",
        name: "Potatoes",
        category: "Produce",
        unitPrice: 2200,
        quantity: 15,
        unit: "kg",
      },
      {
        id: "item-4",
        name: "Milk",
        category: "Dairy",
        unitPrice: 1500,
        quantity: 20,
        unit: "liter",
      },
    ],
    subtotal: 97900,
    deliveryFee: 5000,
    total: 102900,
    inventoryUpdateDate: "N/A",
  },
  {
    id: "ORD-7890",
    date: "May 2, 2023",
    status: "Confirmed",
    supplier: "Metro Meats",
    supplierId: "supplier-2",
    supplierContact: "+250 78 234 5678",
    deliveryAddress: "123 Restaurant Row, Kigali, Rwanda",
    expectedDelivery: "May 5, 2023, 1:00 PM - 3:00 PM",
    estimatedArrival: "N/A",
    timeline: [
      {
        status: "Order Placed",
        date: "May 2, 2023, 2:15 PM",
      },
      {
        status: "Order Confirmed",
        date: "May 2, 2023, 4:30 PM",
      },
    ],
    items: [
      {
        id: "item-1",
        name: "Chicken Breast",
        category: "Meat & Poultry",
        unitPrice: 9500,
        quantity: 15,
        unit: "kg",
      },
      {
        id: "item-2",
        name: "Ground Beef",
        category: "Meat & Poultry",
        unitPrice: 8200,
        quantity: 10,
        unit: "kg",
      },
    ],
    subtotal: 224500,
    deliveryFee: 5000,
    total: 229500,
    inventoryUpdateDate: "N/A",
  },
  {
    id: "ORD-7889",
    date: "May 1, 2023",
    status: "In Transit",
    supplier: "Global Grocers",
    supplierId: "supplier-3",
    supplierContact: "+250 78 345 6789",
    deliveryAddress: "123 Restaurant Row, Kigali, Rwanda",
    expectedDelivery: "May 3, 2023, 9:00 AM - 12:00 PM",
    estimatedArrival: "May 3, 2023, 10:30 AM",
    timeline: [
      {
        status: "Order Placed",
        date: "May 1, 2023, 11:00 AM",
      },
      {
        status: "Order Confirmed",
        date: "May 1, 2023, 1:30 PM",
      },
      {
        status: "In Transit",
        date: "May 3, 2023, 8:15 AM",
      },
    ],
    items: [
      {
        id: "item-1",
        name: "Rice",
        category: "Dry Goods",
        unitPrice: 2800,
        quantity: 25,
        unit: "kg",
      },
      {
        id: "item-2",
        name: "Pasta",
        category: "Dry Goods",
        unitPrice: 3200,
        quantity: 15,
        unit: "kg",
      },
      {
        id: "item-3",
        name: "Olive Oil",
        category: "Dry Goods",
        unitPrice: 12000,
        quantity: 5,
        unit: "liter",
      },
    ],
    subtotal: 178000,
    deliveryFee: 5000,
    total: 183000,
    inventoryUpdateDate: "N/A",
  },
  {
    id: "ORD-7888",
    date: "April 30, 2023",
    status: "Delivered",
    supplier: "Organic Supplies Co.",
    supplierId: "supplier-4",
    supplierContact: "+250 78 456 7890",
    deliveryAddress: "123 Restaurant Row, Kigali, Rwanda",
    expectedDelivery: "May 2, 2023, 9:00 AM - 12:00 PM",
    estimatedArrival: "Delivered",
    timeline: [
      {
        status: "Order Placed",
        date: "April 30, 2023, 9:45 AM",
      },
      {
        status: "Order Confirmed",
        date: "April 30, 2023, 10:30 AM",
      },
      {
        status: "In Transit",
        date: "May 2, 2023, 8:00 AM",
      },
      {
        status: "Delivered",
        date: "May 2, 2023, 11:15 AM",
      },
    ],
    items: [
      {
        id: "item-1",
        name: "Organic Tomatoes",
        category: "Produce",
        unitPrice: 3500,
        quantity: 8,
        unit: "kg",
      },
      {
        id: "item-2",
        name: "Organic Lettuce",
        category: "Produce",
        unitPrice: 2800,
        quantity: 10,
        unit: "kg",
      },
      {
        id: "item-3",
        name: "Organic Carrots",
        category: "Produce",
        unitPrice: 2200,
        quantity: 12,
        unit: "kg",
      },
    ],
    subtotal: 83600,
    deliveryFee: 5000,
    total: 88600,
    inventoryUpdateDate: "May 2, 2023, 11:30 AM",
  },
];
