import { useState } from "react";
import { X, Upload, BookPlus } from "lucide-react";

function AddBookModal({ onClose, onAdd }) {
  const [book, setBook] = useState({
    title: "",
    author: "",
    language: "",
    genre: "",
    pages: "",
  });

  const [pdf, setPdf] = useState(null);
  const [cover, setCover] = useState(null);

  function handleChange(e) {
    setBook({ ...book, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const newBook = {
      ...book,
      id: Date.now(),
      pages: Number(book.pages) || 0,
      status: "To Read",
      progress: 0,
      currentPage: 0,
      pdf: pdf || null,
      cover: cover || null,
    };

    await onAdd(newBook);
  }

  return (
    <div className="modal-overlay">
      <div className="book-modal">

        <div className="modal-header">
          <div>
            <span className="eyebrow">EXPAND YOUR COLLECTION</span>
            <h2>Add a New Book</h2>
          </div>

          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>

          <label>Book Title *</label>
          <input
            name="title"
            value={book.title}
            onChange={handleChange}
            placeholder="Enter book title"
            required
          />

          <label>Author *</label>
          <input
            name="author"
            value={book.author}
            onChange={handleChange}
            placeholder="Enter author name"
            required
          />

          <div className="form-row">
            <div>
              <label>Original Language</label>
              <input
                name="language"
                value={book.language}
                onChange={handleChange}
                placeholder="e.g. English"
              />
            </div>

            <div>
              <label>Genre</label>
              <input
                name="genre"
                value={book.genre}
                onChange={handleChange}
                placeholder="e.g. Fiction"
              />
            </div>
          </div>

          <label>Total Pages</label>
          <input
            type="number"
            name="pages"
            value={book.pages}
            onChange={handleChange}
            placeholder="Enter number of pages"
            min="1"
          />

          <label>Book Cover (Optional)</label>
          <div className="upload-box">
            <Upload size={22} />
            <span>Choose a cover image</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCover(e.target.files[0])}
            />
            {cover && <small>{cover.name}</small>}
          </div>

          <label>Upload Book PDF (Optional)</label>
          <div className="upload-box">
            <BookPlus size={22} />
            <span>Select your book PDF</span>
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => setPdf(e.target.files[0])}
            />
            {pdf && <small>{pdf.name}</small>}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit" className="save-book-button">
              Add to Library
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default AddBookModal;