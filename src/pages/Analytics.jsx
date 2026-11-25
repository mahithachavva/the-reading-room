import { useEffect, useState } from "react";
import {
  BookOpen,
  BookCheck,
  Clock,
  Flame,
  TrendingUp,
} from "lucide-react";

import {
  getAllBooks,
  getAllJournalEntries,
  getAllCompletions,
} from "../database/db";

function Analytics() {
  const [books, setBooks] = useState([]);
  const [entries, setEntries] = useState([]);
  const [completions, setCompletions] = useState([]);

  useEffect(() => {
    async function loadAnalytics() {
      const savedBooks = await getAllBooks();
      const savedEntries = await getAllJournalEntries();
      const savedCompletions = await getAllCompletions();

      setBooks(savedBooks);
      setEntries(savedEntries);
      setCompletions(savedCompletions);
    }

    loadAnalytics();
  }, []);

  const totalBooks = books.length;
  const completedBooks = completions.length;
  const totalSessions = entries.length;

  const totalPages = entries.reduce(
    (sum, entry) => sum + Number(entry.pagesRead || 0),
    0
  );

  const totalMinutes = entries.reduce(
    (sum, entry) =>
      sum +
      Number(entry.hours || 0) * 60 +
      Number(entry.minutes || 0),
    0
  );

  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  const genreCounts = {};

  completions.forEach((book) => {
    const genre = book.genre || "Other";
    genreCounts[genre] = (genreCounts[genre] || 0) + 1;
  });

  const genres = Object.entries(genreCounts).sort(
    (a, b) => b[1] - a[1]
  );

  const monthlyPages = {};

  entries.forEach((entry) => {
    const month = new Date(entry.date).toLocaleDateString(
      "en-US",
      { month: "short", year: "numeric" }
    );

    monthlyPages[month] =
      (monthlyPages[month] || 0) +
      Number(entry.pagesRead || 0);
  });

  const months = Object.entries(monthlyPages);

  const averagePages =
    totalSessions > 0
      ? (totalPages / totalSessions).toFixed(1)
      : 0;

  const readingDays = [
    ...new Set(entries.map((entry) => entry.date)),
  ];

  return (
    <div className="analytics-page">

      <div className="analytics-header">
        <span className="eyebrow">YOUR READING JOURNEY</span>
        <h1>Reading Analytics</h1>
        <p>Every page read is a little progress worth celebrating.</p>
      </div>

      <div className="analytics-stats">

        <div className="analytics-card">
          <BookOpen />
          <span>Total Books</span>
          <h2>{totalBooks}</h2>
        </div>

        <div className="analytics-card">
          <BookCheck />
          <span>Books Completed</span>
          <h2>{completedBooks}</h2>
        </div>

        <div className="analytics-card">
          <TrendingUp />
          <span>Pages Read</span>
          <h2>{totalPages}</h2>
        </div>

        <div className="analytics-card">
          <Clock />
          <span>Reading Time</span>
          <h2>{totalHours}h {remainingMinutes}m</h2>
        </div>

        <div className="analytics-card">
          <Flame />
          <span>Reading Days</span>
          <h2>{readingDays.length}</h2>
        </div>

        <div className="analytics-card">
          <BookOpen />
          <span>Reading Sessions</span>
          <h2>{totalSessions}</h2>
        </div>

      </div>

      <div className="analytics-section">
        <h2>Monthly Reading Activity</h2>

        {months.length > 0 ? (
          <div className="monthly-chart">
            {months.map(([month, pages]) => (
              <div className="month-bar" key={month}>
                <div className="bar-value">{pages}</div>
                <div
                  className="bar"
                  style={{
                    height: `${Math.max(
                      (pages / Math.max(...months.map((m) => m[1]))) * 180,
                      8
                    )}px`,
                  }}
                />
                <span>{month}</span>
              </div>
            ))}
          </div>
        ) : (
          <p>Your monthly reading activity will appear here.</p>
        )}
      </div>

      <div className="analytics-bottom">

        <div className="analytics-section">
          <h2>Your Favourite Genres</h2>

          {genres.length > 0 ? (
            genres.map(([genre, count]) => (
              <div className="genre-row" key={genre}>
                <span>{genre}</span>
                <strong>{count} books</strong>
              </div>
            ))
          ) : (
            <p>Complete a book to discover your favourite genres.</p>
          )}
        </div>

        <div className="analytics-section">
          <h2>Your Reading Pace</h2>

          <div className="pace-number">
            {averagePages}
          </div>

          <p>Average pages per reading session</p>
        </div>

      </div>

      <div className="analytics-section">
        <h2>Recently Completed</h2>

        {completions.length > 0 ? (
          completions
            .slice()
            .reverse()
            .slice(0, 5)
            .map((book) => (
              <div className="completed-row" key={book.id}>
                <BookCheck size={18} />
                <div>
                  <strong>{book.title}</strong>
                  <p>{book.author}</p>
                </div>
                <span>
                  {book.completedAt
                    ? new Date(book.completedAt).toLocaleDateString()
                    : ""}
                </span>
              </div>
            ))
        ) : (
          <p>Your completed books will appear here.</p>
        )}
      </div>

    </div>
  );
}

export default Analytics;