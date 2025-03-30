import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import educationTopics from '../../public/education/topics.json';

const Education = () => {
  // Initialize with first topic and section
  const [selectedTopic, setSelectedTopic] = useState<string>(educationTopics[0]?.title || '');
  const [selectedSection, setSelectedSection] = useState<any>(educationTopics[0]?.sections[0] || null);
  const [searchQuery, setSearchQuery] = useState("");

  // Set default selection when component mounts
  useEffect(() => {
    if (educationTopics.length > 0) {
      setSelectedTopic(educationTopics[0].title);
      if (educationTopics[0].sections?.length > 0) {
        setSelectedSection(educationTopics[0].sections[0]);
      }
    }
  }, []);

  // Function to render Python code block
  const renderPythonProgram = (pythonData: any) => {
    return (
      <div className="bg-gray-900 rounded-lg p-6 my-4">
        {/* Libraries and Installation */}
        <div className="mb-4">
          <h4 className="text-white font-semibold mb-2">Required Libraries:</h4>
          <div className="bg-gray-800 p-2 rounded">
            <code className="text-green-400">
              {pythonData.libraries.join(", ")}
            </code>
          </div>
          <div className="mt-2 bg-gray-800 p-2 rounded">
            <code className="text-yellow-400">
              {pythonData.install_command}
            </code>
          </div>
        </div>

        {/* Python Code */}
        <div className="mb-4">
          <h4 className="text-white font-semibold mb-2">Code:</h4>
          <pre className="bg-gray-800 p-4 rounded overflow-x-auto">
            <code className="text-blue-400 whitespace-pre">
              {pythonData.code}
            </code>
          </pre>
        </div>

        {/* Explanation */}
        {pythonData.explanation && (
          <div className="text-white">
            <h4 className="font-semibold mb-2">Explanation:</h4>
            <ul className="list-disc pl-4 space-y-2">
              {Object.entries(pythonData.explanation).map(([key, value]: [string, any]) => (
                <li key={key} className="text-gray-300">
                  <span className="font-medium text-white">
                    {key.replace(/_/g, ' ').toUpperCase()}: 
                  </span>
                  {typeof value === 'string' ? value : (
                    Array.isArray(value) && (
                      <div className="mt-2">
                        <table className="w-full text-sm">
                          <thead>
                            <tr>
                              {Object.keys(value[0]).map(header => (
                                <th key={header} className="text-left p-2 bg-gray-800">
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {value.map((item: any, index: number) => (
                              <tr key={index}>
                                {Object.values(item).map((cell: any, cellIndex: number) => (
                                  <td key={cellIndex} className="p-2 border-t border-gray-700">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderContent = (content: any) => {
    if (typeof content === 'string') {
      return <p className="text-gray-600 mb-6">{content}</p>;
    }
    
    if (Array.isArray(content)) {
      return content.map((item, index) => (
        <div key={index} className="mb-4">
          {item.note && <h4 className="font-semibold mb-2">{item.note}</h4>}
          {item.explanation && <p className="text-gray-600">{item.explanation}</p>}
          {item.metric && (
            <div className="mb-4">
              <h4 className="font-semibold">{item.metric}</h4>
              <p className="text-gray-600">{item.definition}</p>
              {item.formula && (
                <div className="bg-black p-3 rounded-lg my-2 font-mono text-white font-bold">
                {item.formula}
              </div>
              
              )}
              {item.interpretation && (
                <p className="text-gray-600 mt-2">{item.interpretation}</p>
              )}
            </div>
          )}
        </div>
      ));
    }
    
    return null;
  };

  const filteredTopics = educationTopics.filter(topic =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.sections?.some(section =>
      section.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="col-span-4 border rounded-lg p-4">
            {educationTopics.map((topic) => (
              <div key={topic.title} className="mb-4">
                <button
                  onClick={() => {
                    setSelectedTopic(topic.title);
                    // When selecting a topic, automatically select its first section
                    setSelectedSection(topic.sections?.[0] || null);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg font-medium ${
                    selectedTopic === topic.title ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"
                  }`}
                >
                  {topic.title}
                </button>
                
                {selectedTopic === topic.title && topic.sections && (
                  <div className="ml-4 mt-2 border-l-2 border-gray-200">
                    {topic.sections.map((section: any) => (
                      <button
                        key={section.title}
                        onClick={() => setSelectedSection(section)}
                        className={`w-full text-left px-4 py-2 text-sm ${
                          selectedSection?.title === section.title 
                            ? "text-blue-600" 
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        {section.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Content Area */}
          <div className="col-span-8 border rounded-lg p-6">
            {selectedSection ? (
              <div>
                <h2 className="text-2xl font-bold mb-4">{selectedSection.title}</h2>
                
                {renderContent(selectedSection.content)}
                
                {selectedSection.subtopics && (
                  <div className="space-y-6">
                    {selectedSection.subtopics.map((subtopic: any, index: number) => (
                      <div key={index} className="border-b pb-6 last:border-0">
                        <h3 className="text-xl font-semibold mb-3">{subtopic.title}</h3>
                        {renderContent(subtopic.content)}
                        
                        {subtopic.formula && (
  <div className="bg-black p-3 rounded-lg mb-3 font-mono text-green-700 font-bold">
    {subtopic.formula}
  </div>
)}

                        
                        {subtopic.example && (
                          <div className="bg-black p-3 rounded-lg mb-3 font-mono text-yellow-600 font-bold">
                            <span className="font-medium">Example: </span>
                            {subtopic.example}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Render Python program if it exists */}
                {selectedSection.python_program && renderPythonProgram(selectedSection.python_program)}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                Select a section to view its content
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Education;
