import { useEffect, useState } from "react";
import { BookOpen, Clock, PenLine, Plus, Trash2 } from "lucide-react";
import {
  getAllBooks,
  addJournalEntry,
  getAllJournalEntries,
  deleteJournalEntry,
  updateBook,
} from "../database/db";
function Journal() {
  const [showForm, setShowForm] = useState(false);
  const [books, setBooks] = useState([]);
const [entries, setEntries] = useState([]);

const [form, setForm] = useState({
  bookId: "",
  date: new Date().toISOString().split("T")[0],
  startPage: "",
  endPage: "",
  hours: "",
  minutes: "",
  quote: "",
  thoughts: "",
  vocabulary: "",
});
useEffect(() => {
  async function loadData() {
    const savedBooks = await getAllBooks();
    const savedEntries = await getAllJournalEntries();

    setBooks(savedBooks);
    setEntries(savedEntries);
  }

  loadData().catch(console.error);
}, []);
function handleChange(e) {
  setForm({
    ...form,
    [e.target.name]: e.target.value,
  });
}

async function saveEntry() {
  if (!form.bookId || !form.startPage || !form.endPage) {
    alert("Please select a book and enter the pages.");
    return;
  }

  const start = Number(form.startPage);
  const end = Number(form.endPage);

  if (start < 1 || end < start) {
    alert("Please enter valid page numbers.");
    return;
  }

  const book = books.find(
    item => item.id === Number(form.bookId)
  );

  if (book.pages > 0 && end > book.pages) {
    alert("The ending page exceeds the book's total pages.");
    return;
  }

  const entry = {
    ...form,
    bookId: Number(form.bookId),
    bookTitle: book.title,
    pagesRead: end - start + 1,
    hours: Number(form.hours || 0),
    minutes: Number(form.minutes || 0),
    date: form.date,
  };

  await addJournalEntry(entry);
  const updatedBook = {
  ...book,
  currentPage: Math.max(book.currentPage || 0, end),
  progress: book.pages > 0
    ? Math.round((Math.max(book.currentPage || 0, end) / book.pages) * 100)
    : 0,
  status: "Currently Reading",
};

await updateBook(updatedBook);

setBooks(prev =>
  prev.map(item =>
    item.id === book.id ? updatedBook : item
  )
);

  const savedEntries = await getAllJournalEntries();
  setEntries(savedEntries);

  setForm({
    bookId: "",
    date: new Date().toISOString().split("T")[0],
    startPage: "",
    endPage: "",
    hours: "",
    minutes: "",
    quote: "",
    thoughts: "",
    vocabulary: "",
  });

  setShowForm(false);
}
const totalSessions = entries.length;

const totalMinutes = entries.reduce(
  (sum, entry) => sum + entry.hours * 60 + entry.minutes,
  0
);

const totalHours = Math.floor(totalMinutes / 60);
const remainingMinutes = totalMinutes % 60;

async function removeEntry(id) {
  await deleteJournalEntry(id);

  setEntries(prev =>
    prev.filter(entry => entry.id !== id)
  );
}
  return (
    <div className="journal-page">

      <header className="journal-header">
        <div>
          <p className="journal-subtitle">A LITTLE SPACE FOR YOUR THOUGHTS</p>
          <h1>Reading Journal 🍒</h1>
          <p>Every book leaves a little something behind.</p>
        </div>

        <button
          className="journal-add-button"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={18} />
          New Entry
        </button>
      </header>

      <div className="journal-stats">
  <div className="journal-stat-card">
    <BookOpen />
    <h2>{totalSessions}</h2>
    <p>Reading Sessions</p>
  </div>

  <div className="journal-stat-card">
    <Clock />
    <h2>{totalHours}h {remainingMinutes}m</h2>
    <p>Time Spent Reading</p>
  </div>

  <div className="journal-stat-card">
    <PenLine />
    <h2>{entries.length}</h2>
    <p>Journal Entries</p>
  </div>
</div>

      {showForm && (
  <div className="journal-form-card">
    <h2>Capture a Reading Moment</h2>
    <p>Some thoughts deserve to be remembered.</p>

    <div className="journal-form">

      <label>Choose a Book</label>
      <select name="bookId" value={form.bookId} onChange={handleChange}>
        <option value="">Select a book</option>
        {books.map(book => (
          <option key={book.id} value={book.id}>
            {book.title}
          </option>
        ))}
      </select>

      <label>Date</label>
      <input
        type="date"
        name="date"
        value={form.date}
        onChange={handleChange}
      />

      <div className="journal-input-row">
        <div>
          <label>Starting Page</label>
          <input type="number" name="startPage" value={form.startPage} onChange={handleChange} />
        </div>

        <div>
          <label>Ending Page</label>
          <input type="number" name="endPage" value={form.endPage} onChange={handleChange} />
        </div>
      </div>

      <label>Time Spent</label>
      <div className="journal-input-row">
        <input type="number" name="hours" placeholder="Hours" min="0" value={form.hours} onChange={handleChange} />
        <input type="number" name="minutes" placeholder="Minutes" min="0" max="59" value={form.minutes} onChange={handleChange} />
      </div>

      <label>Favourite Lines</label>
      <textarea name="quote" value={form.quote} onChange={handleChange} placeholder="A beautiful line worth remembering..." />

      <label>Thoughts & Reflections</label>
      <textarea name="thoughts" value={form.thoughts} onChange={handleChange} placeholder="What did you think about today's reading?" />

      <label>New Vocabulary</label>
      <textarea name="vocabulary" value={form.vocabulary} onChange={handleChange} placeholder="New words and their meanings..." />

      <button className="journal-add-button" onClick={saveEntry}>
        Save Entry
      </button>

    </div>
  </div>
)}

      <section className="journal-entries">
  <h2>Your Reading Memories</h2>
  <p>Every session tells a story.</p>

  {entries.length === 0 ? (
    <p className="empty-message">
      No entries yet. Start recording your reading journey!
    </p>
  ) : (
    entries
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(entry => (
        <div className="journal-entry-card" key={entry.id}>

          <div className="journal-entry-top">
            <div>
              <h3>{entry.bookTitle}</h3>
              <span>{entry.date}</span>
            </div>

            <button onClick={() => removeEntry(entry.id)}>
              <Trash2 size={18} />
            </button>
          </div>

          <p>
            📖 Pages {entry.startPage}–{entry.endPage}
            ({entry.pagesRead} pages)
          </p>

          <p>
            ⏱️ {entry.hours}h {entry.minutes}m
          </p>

          {entry.quote && (
            <blockquote>{entry.quote}</blockquote>
          )}

          {entry.thoughts && (
            <p>{entry.thoughts}</p>
          )}

          {entry.vocabulary && (
            <p><strong>Vocabulary:</strong> {entry.vocabulary}</p>
          )}

        </div>
      ))
  )}
</section>

    </div>
  );
}

export default Journal;