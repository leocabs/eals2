import { useParams, useNavigate } from "react-router-dom";

const subjectsByFolder = {
  ls1: ["ENGLISH", "FILIPINO"],
};

export default function SubjectSelector() {
  const { folderName } = useParams();
  const navigate = useNavigate();

  const subjects = subjectsByFolder[folderName] || [];

  const handleClick = (subject) => {
    const slug = subject.toLowerCase().replace(/\s+/g, "-");
    navigate(`/reading-materials/${folderName}/${slug}`);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Choose a subject for {folderName.toUpperCase()}</h2>
      <div className="grid grid-cols-2 gap-4">
        {subjects.map((subject, idx) => (
          <button
            key={idx}
            onClick={() => handleClick(subject)}
            className="p-4 bg-white rounded-lg shadow hover:bg-gray-100"
          >
            {subject}
          </button>
        ))}
      </div>
    </div>
  );
}
