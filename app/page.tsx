"use client";

import { useState, useEffect } from "react";

const API_BASE_URL = "https://questionapp-hr5v.onrender.com"; // Centralized API base URL
//const API_BASE_URL = "http://localhost:8000"; // Centralized API base URL

export default function QuestionsDashboard() {
  const [topics, setTopics] = useState<string[]>([]);
  const [questions, setQuestions] = useState<{ id: number; topic: string; text: string }[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [newTopic, setNewTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadingAnswers, setLoadingAnswers] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    if (selectedTopic) {
      fetchQuestions(selectedTopic);
    }
  }, [selectedTopic]);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/topics`);
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      const data = await response.json();

      setTopics(data.map((t: { name: string }) => t.name));
    } catch (error) {
      console.error("Failed to fetch topics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (topic: string) => {
    try {
      setLoadingQuestions(true);
      const response = await fetch(`${API_BASE_URL}/api/questions?topic=${encodeURIComponent(topic)}`);
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setQuestions(Array.isArray(data) ? data.map(q => ({ id: q.id, topic: q.topic, text: q.text })) : data.data || []);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const fetchNewQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/fetch-questions/${encodeURIComponent(newTopic)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      await response.json();
      fetchTopics(); // Refresh topics after fetching
    } catch (error) {
      console.error("Failed to fetch new questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnswer = async (questionId: number, questionText: string) => {
    setLoadingAnswers((prev) => ({ ...prev, [questionId]: true })); // Set loading state

    try {
      const response = await fetch(`${API_BASE_URL}/api/get-answer/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_id: questionId, question_text: questionText }),
      });

      const data = await response.json();
      setAnswers((prev) => ({ ...prev, [questionId]: data.answer }));
    } catch (error) {
      console.error("Error fetching answer:", error);
    }

    setLoadingAnswers((prev) => ({ ...prev, [questionId]: false })); // Remove loading state
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/4 p-4 bg-gray-900 text-white overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Topics</h2>
        {loading ? (
          <p className="text-gray-400">Loading topics...</p>
        ) : (
          <div className="space-y-2">
            {topics.length === 0 ? (
              <p className="text-gray-400">No topics available</p>
            ) : (
              topics.map((topic) => (
                <button
                  key={topic}
                  className={`w-full p-3 text-left rounded-md transition duration-200 ${selectedTopic === topic ? "bg-blue-500 text-white" : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  onClick={() => setSelectedTopic(topic)}
                >
                  {topic}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="w-3/4 p-6 bg-gray-100 overflow-y-auto">
        <div className="flex mb-4">
          <input
            placeholder="Enter new topic"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            className="border p-2 rounded w-full text-black"
          />
          <button className="ml-2 p-2 bg-blue-500 text-white rounded" onClick={fetchNewQuestions} disabled={loading}>
            {loading ? "Fetching..." : "Fetch Questions"}
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-4 text-black">
          {selectedTopic ? `Questions on: ${selectedTopic}` : "Select a topic"}
        </h2>

        {loadingQuestions ? (
          <p className="text-gray-500">Loading questions...</p>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <div key={question.id} className="border-b pb-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg text-black">{question.text}</span>
                  <button
                    onClick={() => fetchAnswer(question.id, question.text)}
                    className="text-sm px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                    disabled={loadingAnswers[question.id]} // Disable button when loading
                  >
                    {loadingAnswers[question.id] ? "Loading..." : "Answer"}
                  </button>
                </div>
                {answers[question.id] && (
                  <div className="mt-2 p-2 bg-gray-200 text-black rounded">
                    {answers[question.id]}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
