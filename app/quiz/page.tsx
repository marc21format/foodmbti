"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { FOOD_MBTI_SCALES } from "@/app/food-mbti-data";
import DesktopFrame from "@/app/_components/DesktopFrame";
import MacintoshArt from "@/app/_components/MacintoshArt";
import { supabase } from "@/lib/supabase/client";

type QuizQuestion = {
  question_id: number;
  question_text: string;
  category_name: string;
};

type ArchetypePersona = {
  archetype_name: string;
  archetype_desc: string | null;
};

const CATEGORY_PAIR_BY_NAME: Record<string, { left: string; right: string }> = {
  Financial: { left: "B", right: "V" },
  Personal: { left: "W", right: "E" },
  "Effort-based": { left: "C", right: "A" },
  "Trait-driven": { left: "I", right: "H" },
};

function getTaggedLetter(questionText: string) {
  const match = questionText.match(/\(([A-Z])\)\s*$/);
  return match?.[1] ?? null;
}

function getDisplayQuestionText(questionText: string) {
  return questionText.replace(/\s*\([A-Z]\)\s*$/, "").trim();
}

function getOppositeLetter(categoryName: string, taggedLetter: string) {
  const pair = CATEGORY_PAIR_BY_NAME[categoryName];
  if (!pair) return taggedLetter;
  return pair.left === taggedLetter ? pair.right : pair.left;
}

function buildResultCode(letterScores: Record<string, number>) {
  return FOOD_MBTI_SCALES.map((scale) => {
    const leftScore = letterScores[scale.left.letter] ?? 0;
    const rightScore = letterScores[scale.right.letter] ?? 0;
    return rightScore > leftScore ? scale.right.letter : scale.left.letter;
  }).join("");
}

export default function QuizPage() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [username, setUsername] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, 0 | 1 | undefined>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultCode, setResultCode] = useState<string | null>(null);
  const [resultPersona, setResultPersona] = useState<ArchetypePersona | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [adminTabVisible, setAdminTabVisible] = useState(false);
  const [adminTabMinimized, setAdminTabMinimized] = useState(false);
  const [adminTabPath, setAdminTabPath] = useState("/admin");
  const [adminTabPos, setAdminTabPos] = useState({ x: 360, y: 16 });
  const [adminTabSize, setAdminTabSize] = useState({ width: 520, height: 420 });
  const [windowPos, setWindowPos] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 920, height: 560 });
  const [draggingWindow, setDraggingWindow] = useState(false);
  const [resizingWindow, setResizingWindow] = useState(false);
  const [draggingAdminTab, setDraggingAdminTab] = useState(false);
  const [resizingAdminTab, setResizingAdminTab] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const adminDragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({
    pointerX: 0,
    pointerY: 0,
    width: 920,
    height: 560,
  });
  const adminResizeStart = useRef({
    pointerX: 0,
    pointerY: 0,
    width: 520,
    height: 420,
  });

  useEffect(() => {
    if (!draggingWindow && !resizingWindow && !draggingAdminTab && !resizingAdminTab) return;

    const host = hostRef.current;
    if (!host) return;

    const hostRect = host.getBoundingClientRect();

    const minWidth = 620;
    const minHeight = 360;
    const minAdminWidth = 360;
    const minAdminHeight = 260;

    const handleMove = (event: PointerEvent) => {
      if (draggingWindow) {
        const maxX = Math.max(0, hostRect.width - windowSize.width);
        const maxY = Math.max(0, hostRect.height - windowSize.height);

        const nextX = Math.max(0, Math.min(maxX, event.clientX - hostRect.left - dragOffset.current.x));
        const nextY = Math.max(0, Math.min(maxY, event.clientY - hostRect.top - dragOffset.current.y));
        setWindowPos({ x: nextX, y: nextY });
        return;
      }

      if (draggingAdminTab) {
        const maxX = Math.max(0, hostRect.width - adminTabSize.width);
        const maxY = Math.max(0, hostRect.height - adminTabSize.height);

        const nextX = Math.max(0, Math.min(maxX, event.clientX - hostRect.left - adminDragOffset.current.x));
        const nextY = Math.max(0, Math.min(maxY, event.clientY - hostRect.top - adminDragOffset.current.y));
        setAdminTabPos({ x: nextX, y: nextY });
        return;
      }

      if (resizingWindow) {
        const deltaX = event.clientX - resizeStart.current.pointerX;
        const deltaY = event.clientY - resizeStart.current.pointerY;

        const maxWidth = Math.max(minWidth, hostRect.width - windowPos.x);
        const maxHeight = Math.max(minHeight, hostRect.height - windowPos.y);

        setWindowSize({
          width: Math.max(minWidth, Math.min(maxWidth, resizeStart.current.width + deltaX)),
          height: Math.max(minHeight, Math.min(maxHeight, resizeStart.current.height + deltaY)),
        });
        return;
      }

      if (resizingAdminTab) {
        const deltaX = event.clientX - adminResizeStart.current.pointerX;
        const deltaY = event.clientY - adminResizeStart.current.pointerY;

        const maxWidth = Math.max(minAdminWidth, hostRect.width - adminTabPos.x);
        const maxHeight = Math.max(minAdminHeight, hostRect.height - adminTabPos.y);

        setAdminTabSize({
          width: Math.max(minAdminWidth, Math.min(maxWidth, adminResizeStart.current.width + deltaX)),
          height: Math.max(minAdminHeight, Math.min(maxHeight, adminResizeStart.current.height + deltaY)),
        });
      }
    };

    const handleUp = () => {
      setDraggingWindow(false);
      setResizingWindow(false);
      setDraggingAdminTab(false);
      setResizingAdminTab(false);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [
    draggingWindow,
    resizingWindow,
    draggingAdminTab,
    resizingAdminTab,
    windowPos.x,
    windowPos.y,
    windowSize.width,
    windowSize.height,
    adminTabPos.x,
    adminTabPos.y,
    adminTabSize.width,
    adminTabSize.height,
  ]);

  useEffect(() => {
    async function loadQuestions() {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("questions")
        .select("question_id, question_text, categories(category_name)")
        .order("question_id", { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      const normalized = (data ?? []).map((row: any) => ({
        question_id: row.question_id,
        question_text: row.question_text,
        category_name: row.categories?.category_name ?? "",
      }));

      setQuestions(normalized);
      setCurrentIndex(0);
      setAnswers({});
      setResultCode(null);
      setResultPersona(null);
      setLoading(false);
    }

    loadQuestions();
  }, []);

  const currentQuestion = useMemo(() => questions[currentIndex] ?? null, [questions, currentIndex]);

  const answeredCount = useMemo(
    () => questions.filter((question) => answers[question.question_id] !== undefined).length,
    [questions, answers]
  );

  const canSubmit = questions.length > 0 && answeredCount === questions.length;
  const isCurrentAnswered = currentQuestion
    ? answers[currentQuestion.question_id] !== undefined
    : false;

  const handleStart = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setUsername(trimmed);
  };

  const handleChoose = (questionId: number, value: 0 | 1) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!canSubmit || !username) {
      setError("Please answer all questions first.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const { data: examineeRows, error: examineeError } = await supabase
      .from("examinees")
      .insert({ examinee_name: username })
      .select("examinee_id")
      .limit(1);

    if (examineeError || !examineeRows?.length) {
      setError(examineeError?.message ?? "Failed to create examinee record.");
      setSubmitting(false);
      return;
    }

    const examineeId = examineeRows[0].examinee_id;

    const answerRows = questions.map((question) => ({
      examinee_id: examineeId,
      question_id: question.question_id,
      answer_value: answers[question.question_id] ?? 0,
    }));

    const { error: answerError } = await supabase.from("answers").insert(answerRows);

    if (answerError) {
      setError(answerError.message);
      setSubmitting(false);
      return;
    }

    const letterScores: Record<string, number> = {
      B: 0,
      V: 0,
      W: 0,
      E: 0,
      C: 0,
      A: 0,
      I: 0,
      H: 0,
    };

    questions.forEach((question) => {
      const tagged = getTaggedLetter(question.question_text);
      if (!tagged) return;

      const isAgree = answers[question.question_id] === 1;
      const chosenLetter = isAgree ? tagged : getOppositeLetter(question.category_name, tagged);
      letterScores[chosenLetter] = (letterScores[chosenLetter] ?? 0) + 1;
    });

    const code = buildResultCode(letterScores);
    setResultCode(code);

    const { data: personaRows, error: personaError } = await supabase
      .from("archetype_personas")
      .select("archetype_name, archetype_desc")
      .ilike("archetype_name", `${code}%`)
      .limit(1);

    if (!personaError && personaRows?.length) {
      setResultPersona(personaRows[0]);
    } else {
      setResultPersona(null);
    }

    setSubmitting(false);
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setAnswers({});
    setResultCode(null);
    setResultPersona(null);
    setError(null);
  };

  const handleWindowDragStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("button")) return;

    const host = hostRef.current;
    if (!host) return;

    const hostRect = host.getBoundingClientRect();
    dragOffset.current = {
      x: event.clientX - hostRect.left - windowPos.x,
      y: event.clientY - hostRect.top - windowPos.y,
    };
    setDraggingWindow(true);
  };

  const handleWindowResizeStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    resizeStart.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      width: windowSize.width,
      height: windowSize.height,
    };
    setResizingWindow(true);
  };

  const handleAdminTabDragStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("button")) return;

    const host = hostRef.current;
    if (!host) return;

    const hostRect = host.getBoundingClientRect();
    adminDragOffset.current = {
      x: event.clientX - hostRect.left - adminTabPos.x,
      y: event.clientY - hostRect.top - adminTabPos.y,
    };
    setDraggingAdminTab(true);
  };

  const handleAdminTabResizeStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    adminResizeStart.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      width: adminTabSize.width,
      height: adminTabSize.height,
    };
    setResizingAdminTab(true);
  };

  const openAdminTab = (path: "/admin") => {
    setAdminTabPath(`${path}?embed=1`);
    setAdminTabVisible(true);
    setAdminTabMinimized(false);
  };

  return (
    <DesktopFrame
      activeTab="quiz"
      onOpenAdminDashboard={() => openAdminTab("/admin")}
    >
      <div className="window-host" ref={hostRef}>
      {adminTabVisible ? (
      adminTabMinimized ? (
      <div className="window admin-tab-minimized">
        <div className="title-bar">
          <button aria-label="Restore Admin" className="close" onClick={() => setAdminTabMinimized(false)} />
          <h1 className="title" onDoubleClick={() => setAdminTabMinimized(false)}>Admin Dashboard</h1>
          <button aria-label="Close Admin" className="resize" onClick={() => setAdminTabVisible(false)} />
        </div>
      </div>
      ) : (
      <div className="window admin-tab-window" style={{ width: `${adminTabSize.width}px`, height: `${adminTabSize.height}px`, left: `${adminTabPos.x}px`, top: `${adminTabPos.y}px` }}>
        <div className="title-bar" onPointerDown={handleAdminTabDragStart}>
          <button aria-label="Minimize Admin" className="close" onClick={() => setAdminTabMinimized(true)} />
          <h1 className="title">Admin Dashboard</h1>
          <button aria-label="Close Admin" className="resize" onClick={() => setAdminTabVisible(false)} />
        </div>
        <div className="separator" />
        <div className="window-pane admin-tab-body">
          <iframe title="Admin Dashboard" src={adminTabPath} className="admin-tab-iframe" />
        </div>
        <div className="admin-tab-resize-grip" onPointerDown={handleAdminTabResizeStart} aria-hidden="true" />
      </div>
      )
      ) : null}

      {isMinimized ? (
      <div className="window minimized-window">
        <div className="title-bar">
          <button aria-label="Restore" className="close" onClick={() => setIsMinimized(false)} />
          <h1 className="title" onDoubleClick={() => setIsMinimized(false)}>FoodDecisionERin</h1>
          <button aria-label="Resize" className="resize" disabled />
        </div>
      </div>
      ) : (
      <div className="window resizable-window" style={{ width: `${windowSize.width}px`, height: `${windowSize.height}px`, left: `${windowPos.x}px`, top: `${windowPos.y}px` }}>
        <div className="title-bar" onPointerDown={handleWindowDragStart}>
          <button aria-label="Minimize" className="close" onClick={() => setIsMinimized(true)} />
          <h1 className="title">Food DecisionERin</h1>
          <button aria-label="Resize" className="resize" />
        </div>
        <div className="separator" />

        <div className="window-pane quiz-pane" style={{ display: "grid", gap: "0.9rem", alignContent: "start", alignItems: "start" }}>
          {!username ? (
            <>
              <div className="mac-prompt-shell">
                <div className="mac-chat-row">
                  <MacintoshArt />
                  <div className="chatbox-mac chatbox-mac-plain">
                    <span className="chatbox-legend">Macintosh</span>
                    <p className="alert-text" style={{ margin: 0 }}>
                      Hi there. Enter your name to begin the quiz.
                    </p>
                  </div>
                </div>
              </div>

              <section className="field-row" style={{ justifyContent: "space-between", gap: "0.6rem" }}>
                <label htmlFor="quiz-username">Name:</label>
                <input
                  id="quiz-username"
                  value={nameInput}
                  onChange={(event) => setNameInput(event.target.value)}
                  placeholder="Type your name"
                  style={{ flex: 1 }}
                />
              </section>
              <section className="field-row" style={{ justifyContent: "flex-end", flexWrap: "wrap" }}>
                <button className="btn" onClick={handleStart} disabled={!nameInput.trim()}>
                  Start Quiz
                </button>
              </section>
            </>
          ) : (
            <>

              {loading ? <p style={{ margin: 0 }}>Loading questions...</p> : null}
              {error ? <p style={{ margin: 0, color: "#900" }}>Error: {error}</p> : null}

              {!loading && !resultCode && currentQuestion ? (
                <div className="modeless-dialog" style={{ display: "grid", gap: "0.75rem" }}>
                  <h2 className="dialog-text" style={{ margin: 0 }}>
                    Question {currentIndex + 1} of {questions.length}
                  </h2>

                  <div className="mac-prompt-shell" style={{ width: "100%" }}>
                    <div className="mac-chat-row">
                      <MacintoshArt />

                      <div className="chatbox-mac">
                        <span className="chatbox-legend">Macintosh</span>
                        <p className="alert-text" style={{ margin: 0 }}>
                          {getDisplayQuestionText(currentQuestion.question_text)}
                        </p>

                        <section className="field-row chatbox-actions" style={{ gap: "0.8rem", flexWrap: "wrap" }}>
                          <button
                            type="button"
                            className={`answer-link ${answers[currentQuestion.question_id] === 1 ? "answer-link-active" : ""}`}
                            onClick={() => handleChoose(currentQuestion.question_id, 1)}
                            aria-pressed={answers[currentQuestion.question_id] === 1}
                          >
                            Agree
                          </button>
                          <button
                            type="button"
                            className={`answer-link ${answers[currentQuestion.question_id] === 0 ? "answer-link-active" : ""}`}
                            onClick={() => handleChoose(currentQuestion.question_id, 0)}
                            aria-pressed={answers[currentQuestion.question_id] === 0}
                          >
                            Disagree
                          </button>
                        </section>
                      </div>
                    </div>
                  </div>

                  <section className="field-row" style={{ justifyContent: "space-between", gap: "0.5rem", flexWrap: "wrap" }}>
                    <span>{answeredCount}/{questions.length} answered</span>
                    <div className="quiz-actions-row" style={{ display: "inline-flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      <button
                        className="btn"
                        onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                        disabled={currentIndex === 0}
                      >
                        Previous
                      </button>
                      <button
                        className="btn"
                        onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                        disabled={currentIndex === questions.length - 1 || !isCurrentAnswered}
                      >
                        Next
                      </button>
                      <button className="btn" onClick={handleSubmit} disabled={!canSubmit || submitting}>
                        {submitting ? "Submitting..." : "Finish Quiz"}
                      </button>
                    </div>
                  </section>

                </div>
              ) : null}

              {!loading && resultCode ? (
                <div className="modeless-dialog" style={{ display: "grid", gap: "0.8rem" }}>
                  <h2 className="dialog-text" style={{ margin: 0 }}>Your Result</h2>

                  <div className="mac-prompt-shell">
                    <div className="mac-chat-row">
                      <MacintoshArt />
                      <div className="chatbox-mac chatbox-mac-plain">
                        <span className="chatbox-legend">Macintosh</span>
                        <p className="alert-text" style={{ margin: 0 }}>
                          Great job, {username}. Your Food MBTI code is {resultCode}.
                        </p>
                      </div>
                    </div>
                  </div>

                  <p style={{ margin: 0 }}>
                    Food MBTI Code: <strong>{resultCode}</strong>
                  </p>
                  {resultPersona ? (
                    <>
                      <p style={{ margin: 0 }}>
                        Archetype: <strong>{resultPersona.archetype_name}</strong>
                      </p>
                      <p style={{ margin: 0 }}>{resultPersona.archetype_desc ?? "No archetype description available."}</p>
                    </>
                  ) : (
                    <p style={{ margin: 0 }}>No matching archetype found yet.</p>
                  )}

                  <section className="field-row" style={{ justifyContent: "flex-end", gap: "0.5rem", flexWrap: "wrap" }}>
                    <button className="btn" onClick={resetQuiz}>Retake Quiz</button>
                    <a className="btn" href="/" style={{ textDecoration: "none" }}>Back Home</a>
                  </section>
                </div>
              ) : null}
            </>
          )}
        </div>
        <div className="window-resize-grip" onPointerDown={handleWindowResizeStart} aria-hidden="true" />
      </div>
      )}
      </div>

      <style jsx>{`
        .window-host {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .minimized-window {
          position: absolute;
          left: 10px;
          bottom: 10px;
          width: 360px;
          z-index: 12;
        }

        .admin-tab-minimized {
          position: absolute;
          left: 392px;
          bottom: 10px;
          width: 360px;
          z-index: 13;
        }

        .admin-tab-window {
          position: absolute;
          min-width: 360px;
          min-height: 260px;
          z-index: 13;
          overflow: hidden;
          display: grid;
          grid-template-rows: auto auto minmax(0, 1fr);
        }

        .admin-tab-body {
          min-height: 0;
          height: auto;
          padding: 0;
          overflow: hidden !important;
        }

        .admin-tab-iframe {
          width: 100%;
          height: 100%;
          display: block;
          border: 0;
          background: #fff;
        }

        .admin-tab-resize-grip {
          position: absolute;
          right: 2px;
          bottom: 2px;
          width: 18px;
          height: 18px;
          border-left: 2px solid #000;
          border-top: 2px solid #000;
          background:
            linear-gradient(135deg, transparent 0 40%, #000 40% 44%, transparent 44% 60%, #000 60% 64%, transparent 64% 100%);
          cursor: nwse-resize;
        }

        .resizable-window {
          position: absolute;
          overflow: hidden;
          min-width: 620px;
          min-height: 360px;
          max-width: 100%;
          max-height: 100%;
        }

        .quiz-pane {
          overflow-y: auto;
          padding-bottom: 0.5rem;
        }

        .quiz-actions-row {
          justify-content: flex-end;
        }

        .window-resize-grip {
          position: absolute;
          right: 2px;
          bottom: 2px;
          width: 18px;
          height: 18px;
          border-left: 2px solid #000;
          border-top: 2px solid #000;
          background:
            linear-gradient(135deg, transparent 0 40%, #000 40% 44%, transparent 44% 60%, #000 60% 64%, transparent 64% 100%);
          cursor: nwse-resize;
        }

        .mac-chat-row {
          display: grid;
          grid-template-columns: 140px minmax(0, 1fr);
          gap: 1rem;
          align-items: start;
          border: 3px solid #000;
          background: #efefef;
          padding: 8px 10px 10px;
          overflow: visible;
        }

        .mac-prompt-shell {
          border: 3px solid #000;
          background: #d8d8d8;
          padding: 6px;
          overflow: visible;
          align-self: start;
          height: fit-content;
        }

        .chatbox-mac {
          position: relative;
          display: grid;
          gap: 0.75rem;
          background: #fff;
          border: 6px double #000;
          padding: 1rem 0.9rem 0.75rem;
          min-height: 134px;
          overflow: visible;
        }

        .chatbox-mac-plain {
          min-height: 120px;
        }

        .chatbox-legend {
          position: absolute;
          left: 16px;
          top: -10px;
          background: #fff;
          padding: 0.05rem 0.45rem 0;
          font-weight: 600;
          line-height: 1;
          z-index: 3;
        }

        .chatbox-actions {
          justify-content: flex-end;
          margin-top: auto;
        }

        .answer-link {
          border: 0;
          background: transparent;
          padding: 0;
          margin: 0;
          cursor: pointer;
          font: inherit;
          color: inherit;
          text-decoration: none;
        }

        .answer-link:hover {
          text-decoration: underline;
        }

        .answer-link-active {
          text-decoration: underline;
        }

        @media screen and (max-width: 700px) {
          .resizable-window {
            min-width: 0;
            width: 100% !important;
            left: 0 !important;
            top: 0 !important;
          }

          .mac-chat-row {
            grid-template-columns: 1fr;
          }

          .chatbox-mac {
            min-height: 0;
          }

          .quiz-actions-row {
            width: 100%;
            justify-content: flex-start;
          }
        }
      `}</style>
    </DesktopFrame>
  );
}
