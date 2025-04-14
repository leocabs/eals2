import React from "react";
import Table from "./components/Table";

function Test() {
  const products = [
    {
      id: 1,
      name: 'Apple MacBook Pro 17"',
      color: 'Silver',
      category: 'Laptop',
      accessories: 'Yes',
      available: 'Yes',
      price: '$2999',
      weight: '3.0 lb.',
      progress: 80, // Add progress here
    },
    {
      id: 2,
      name: "Microsoft Surface Pro",
      color: "White",
      category: "Laptop PC",
      accessories: "No",
      available: "Yes",
      price: "$1999",
      weight: "1.0 lb.",
      progress: 45,
    },
    // Add more...
  ];

  return <Table products={products} />;
}

export default Test;
