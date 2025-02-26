"use client";

import { useState, useEffect } from "react";

export default function QuestionsDashboard() {
  const [topics, setTopics] = useState<string[]>([]);
  const [questions, setQuestions] = useState<{ id: number; topic: string; question: string }[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [newTopic, setNewTopic] = useState("");

  // Fetch topics on initial load
  useEffect(() => {
    fetchTopics();
  }, []);

  // Fetch questions when topic is selected
  useEffect(() => {
    if (selectedTopic) {
      fetchQuestions(selectedTopic);
    }
  }, [selectedTopic]);

  const fetchTopics = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/topics");
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      const data = await response.json();
      
      // Ensure only topic names are stored
      setTopics(data.map((t: { name: string }) => t.name));
    } catch (error) {
      console.error("Failed to fetch topics:", error);
    }
  };
  
  const fetchQuestions = async (topic: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/questions?topic=${encodeURIComponent(topic)}`);
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      const data = await response.json();
      console.log("API Response:", data);
      setQuestions(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    }
  };

  const fetchNewQuestions = async () => {
    try {
      const response = await fetch(`http://localhost:8000/fetch-questions/${encodeURIComponent(newTopic)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log("Fetched new questions:", data);
      fetchQuestions(newTopic); // Refresh questions after fetching
    } catch (error) {
      console.error("Failed to fetch new questions:", error);
    }
  };
  

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 p-4 bg-gray-900 text-white overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Topics</h2>
        <div className="space-y-2">
          {topics.length === 0 ? (
            <p className="text-gray-400">No topics available</p>
          ) : (
            topics.map((topic) => (
              <button
                key={topic}
                className={`w-full p-3 text-left rounded-md transition duration-200 ${
                  selectedTopic === topic ? "bg-blue-500 text-white" : "bg-gray-700 hover:bg-gray-600"
                }`}
                onClick={() => setSelectedTopic(topic)}
              >
                {topic}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-6 bg-gray-100 overflow-y-auto">
        <div className="flex mb-4">
          <input
            placeholder="Enter new topic"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            className="border p-2 rounded w-full text-black"
          />
          <button className="ml-2 p-2 bg-blue-500 text-white rounded" onClick={fetchNewQuestions}>
            Fetch Questions
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-4">{selectedTopic ? `Questions on: ${selectedTopic}` : "Select a topic"}</h2>

        <div className="space-y-3">
          {selectedTopic && questions.length === 0 ? (
            <p className="text-gray-500">No questions available for this topic</p>
          ) : (
            questions.map((question) => (
              <div key={question.id} className="p-4 bg-white text-black rounded shadow-md">
                   {question.text}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
