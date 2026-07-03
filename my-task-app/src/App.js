import { useState, useEffect, useRef, useCallback } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@400;600;700&display=swap');`;

const css = `
  ${FONTS}
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0d0d0f; font-family: 'Syne', sans-serif; }

  .app {
    min-height: 100vh;
    background: #0d0d0f;
    color: #f0ede8;
    max-width: 420px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }

  /* Clock Header */
  .clock-header {
    padding: 48px 28px 32px;
    background: #0d0d0f;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .clock-label {
    font-size: 11px;
    letter-spacing: 0.18em;
    color: #5a5a62;
    text-transform: uppercase;
    margin-bottom: 8px;
    font-family: 'DM Mono', monospace;
  }
  .clock-time {
    font-size: 64px;
    font-weight: 700;
    color: #f0ede8;
    line-height: 1;
    font-family: 'DM Mono', monospace;
    letter-spacing: -2px;
  }
  .clock-date {
    font-size: 13px;
    color: #5a5a62;
    margin-top: 8px;
    font-family: 'DM Mono', monospace;
    letter-spacing: 0.04em;
  }

  /* Input Panel */
  .input-panel {
    padding: 24px 28px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .input-row {
    display: flex;
    gap: 10px;
    margin-bottom: 12px;
  }
  .task-input {
    flex: 1;
    background: #18181c;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    padding: 12px 16px;
    color: #f0ede8;
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
  }
  .task-input::placeholder { color: #3a3a42; }
  .task-input:focus { border-color: rgba(234,179,8,0.4); }

  .time-controls {
    display: flex;
    gap: 10px;
    margin-bottom: 12px;
  }
  .datetime-input {
    flex: 1;
    background: #18181c;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    padding: 10px 14px;
    color: #f0ede8;
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s;
    cursor: pointer;
  }
  .datetime-input:focus { border-color: rgba(234,179,8,0.4); }
  .datetime-input::-webkit-calendar-picker-indicator { filter: invert(0.4); cursor: pointer; }

  .add-btn {
    width: 100%;
    background: #eab308;
    color: #0d0d0f;
    border: none;
    border-radius: 10px;
    padding: 13px;
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    letter-spacing: 0.04em;
    transition: opacity 0.15s, transform 0.1s;
  }
  .add-btn:hover { opacity: 0.9; }
  .add-btn:active { transform: scale(0.98); }
  .add-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  /* Task List */
  .task-list {
    flex: 1;
    padding: 24px 28px;
    overflow-y: auto;
  }
  .section-label {
    font-size: 11px;
    letter-spacing: 0.16em;
    color: #5a5a62;
    text-transform: uppercase;
    font-family: 'DM Mono', monospace;
    margin-bottom: 14px;
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,0.06);
  }

  /* Task Card */
  .task-card {
    background: #18181c;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    padding: 16px 18px;
    margin-bottom: 10px;
    display: flex;
    align-items: flex-start;
    gap: 14px;
    transition: border-color 0.2s, transform 0.15s;
    animation: slideIn 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards;
  }
  .task-card:hover {
    border-color: rgba(255,255,255,0.14);
    transform: translateX(2px);
  }
  .task-card.today-card {
    border-left: 2px solid #eab308;
    padding-left: 16px;
  }
  .task-card.completed {
    opacity: 0.4;
  }
  .task-card.completed .task-title {
    text-decoration: line-through;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .task-check {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1.5px solid rgba(255,255,255,0.2);
    background: transparent;
    cursor: pointer;
    flex-shrink: 0;
    margin-top: 2px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
  }
  .task-check.checked {
    background: #eab308;
    border-color: #eab308;
    color: #0d0d0f;
  }
  .task-check:hover:not(.checked) { border-color: #eab308; }

  .task-body { flex: 1; min-width: 0; }
  .task-title {
    font-size: 15px;
    font-weight: 600;
    color: #f0ede8;
    margin-bottom: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .task-meta {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .task-pill {
    font-size: 11px;
    font-family: 'DM Mono', monospace;
    color: #5a5a62;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 6px;
    padding: 3px 8px;
    letter-spacing: 0.04em;
  }
  .task-pill.time { color: #eab308; border-color: rgba(234,179,8,0.2); background: rgba(234,179,8,0.07); }

  .delete-btn {
    background: transparent;
    border: none;
    color: #3a3a42;
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    font-size: 16px;
    line-height: 1;
    transition: color 0.15s, background 0.15s;
    flex-shrink: 0;
  }
  .delete-btn:hover { color: #e74c3c; background: rgba(231,76,60,0.1); }

  .empty-state {
    text-align: center;
    padding: 40px 0;
    color: #3a3a42;
    font-size: 13px;
    font-family: 'DM Mono', monospace;
    letter-spacing: 0.04em;
  }
  .empty-state .icon { font-size: 28px; margin-bottom: 12px; opacity: 0.5; }
`;

function formatDay(date) {
  return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
function formatTime(date) {
  return date.getHours().toString().padStart(2, "0") + ":" + date.getMinutes().toString().padStart(2, "0");
}
function toDatetimeLocal(date) {
  const pad = (n) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function TaskCard({ task, onDelete, onToggle, isToday }) {
  return (
    <div className={`task-card ${isToday ? "today-card" : ""} ${task.completed ? "completed" : ""}`}>
      <button
        className={`task-check ${task.completed ? "checked" : ""}`}
        onClick={() => onToggle(task.id)}
        aria-label="Toggle complete"
      >
        {task.completed && "✓"}
      </button>
      <div className="task-body">
        <div className="task-title">{task.title}</div>
        <div className="task-meta">
          <span className="task-pill time">{task.hour}</span>
          <span className="task-pill">{task.day}</span>
        </div>
      </div>
      <button className="delete-btn" onClick={() => onDelete(task.id)} aria-label="Delete task">×</button>
    </div>
  );
}

export default function App() {
  const [taskTitle, setTaskTitle] = useState("");
  const [tasks, setTasks] = useState([]);
  const [currentTime, setCurrentTime] = useState(formatTime(new Date()));
  const [currentDate, setCurrentDate] = useState(formatDay(new Date()));
  const [taskDatetime, setTaskDatetime] = useState(toDatetimeLocal(new Date()));

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(formatTime(now));
      setCurrentDate(formatDay(now));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const addTask = useCallback(() => {
    if (!taskTitle.trim()) return;
    const date = new Date(taskDatetime);
    const newTask = {
      id: Date.now().toString(),
      title: taskTitle.trim(),
      hour: formatTime(date),
      day: formatDay(date),
      completed: false,
    };
    setTasks((prev) => [newTask, ...prev]);
    setTaskTitle("");
  }, [taskTitle, taskDatetime]);

  const deleteTask = useCallback((id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleTask = useCallback((id) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, completed: !t.completed } : t));
  }, []);

  const handleKeyDown = (e) => { if (e.key === "Enter") addTask(); };

  const todayString = formatDay(new Date());
  const todayTasks = tasks.filter((t) => t.day === todayString);
  const otherTasks = tasks.filter((t) => t.day !== todayString);

  return (
    <>
      <style>{css}</style>
      <div className="app">
        {/* Clock */}
        <div className="clock-header">
          <div className="clock-label">Current time</div>
          <div className="clock-time">{currentTime}</div>
          <div className="clock-date">{currentDate}</div>
        </div>

        {/* Input */}
        <div className="input-panel">
          <div className="input-row">
            <input
              className="task-input"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What needs to be done?"
            />
          </div>
          <div className="time-controls">
            <input
              type="datetime-local"
              className="datetime-input"
              value={taskDatetime}
              onChange={(e) => setTaskDatetime(e.target.value)}
            />
          </div>
          <button className="add-btn" onClick={addTask} disabled={!taskTitle.trim()}>
            Add Task
          </button>
        </div>

        {/* Task Lists */}
        <div className="task-list">
          <div className="section-label">Today</div>
          {todayTasks.length === 0 ? (
            <div className="empty-state">
              <div className="icon">○</div>
              No tasks for today
            </div>
          ) : (
            todayTasks.map((t) => (
              <TaskCard key={t.id} task={t} onDelete={deleteTask} onToggle={toggleTask} isToday />
            ))
          )}

          {otherTasks.length > 0 && (
            <>
              <div className="section-label" style={{ marginTop: "28px" }}>Upcoming & Past</div>
              {otherTasks.map((t) => (
                <TaskCard key={t.id} task={t} onDelete={deleteTask} onToggle={toggleTask} isToday={false} />
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}