import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const testSections = [
  { code: "1", label: "LS1 – English" },
  { code: "2", label: "LS1 – Filipino" },
  { code: "3", label: "LS2 – Scientific & Critical Thinking" },
  { code: "4", label: "LS3 – Mathematical and Problem Solving Skills" },
  { code: "5", label: "LS4 – Life and Career Skills" },
  { code: "6", label: "LS5 – Understanding the Self and Society" },
  { code: "7", label: "LS6 – Digital Citizenship" }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 },
  },
};

export default function MockupTest() {
  const navigate = useNavigate();

  return (
    <motion.div
      className="p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="bg-white p-6 rounded-lg shadow-lg mb-5">
      <div className="flex items-center ">
      <h1 className="text-2xl font-bold">
        Question Bank
      </h1>
      </div>
        <p className="text-gray-500 font-bold">View or add A&E Mock up test in your database.</p>
      </div>

      <div className="space-y-4">
        {testSections.map((section) => (
          <motion.div
            key={section.code}
            onClick={() => navigate(`/mock-test/${section.code}`)}
            className="bg-white border border-gray-200 rounded-md shadow-md cursor-pointer p-5 hover:shadow-lg"
            variants={itemVariants}
            
          >
            <h2 className="text-xl font-semibold text-gray mb-2">
              {section.label}
            </h2>
            <p className="text-gray-600 text-sm">
              Code: <span className="font-medium">{section.code}</span>
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}