// QuestionnaireBuilder.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DragDropContext } from "react-beautiful-dnd";
import EditQuestionList from "../components/EditQuestionList";
import { defaultQuestions } from "../data/defaultQuestions";

export default function QuestionnaireBuilder() {
  const [searchParams] = useSearchParams();
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    // Check for the different URL parameters
    const useDefaults = searchParams.get("useDefaults");
    const empty = searchParams.get("empty");
    const templateId = searchParams.get("templateId");

    if (useDefaults === "true") {
      // Load default questions
      setQuestions(defaultQuestions);
    } else if (empty === "true") {
      // Start with empty array
      setQuestions([]);
    } else if (templateId) {
      // Load specific template (to be implemented)
      // fetchTemplate(templateId);
    }
  }, [searchParams]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reordered = Array.from(questions);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    setQuestions(reordered);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Create New Questionnaire</h1>
      <DragDropContext onDragEnd={handleDragEnd}>
        <EditQuestionList questions={questions} setQuestions={setQuestions} />
      </DragDropContext>
    </div>
  );
}
