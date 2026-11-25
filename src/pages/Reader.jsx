import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Upload,
  BookOpen,
} from "lucide-react";

import * as pdfjsLib from "pdfjs-dist";
import { TextLayer } from "pdfjs-dist";

import CompletionCard from "./CompletionCard";

import {
  getBookById,
  updateBook,
  addHighlight,
  getBookHighlights,
  addCompletion,
  getAllCompletions,
} from "../database/db";

import "pdfjs-dist/web/pdf_viewer.css";
import "../App.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function Reader() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [pdf, setPdf] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);

  const [highlights, setHighlights] = useState([]);
  const [selectedText, setSelectedText] = useState(null);
  const [completionData, setCompletionData] = useState(null);

  const canvasRef = useRef(null);
  const textLayerRef = useRef(null);
  const renderTaskRef = useRef(null);

  // LOAD BOOK AND SAVED COMPLETION

  useEffect(() => {
    async function loadBook() {
      const savedBook = await getBookById(id);

      if (!savedBook) {
        setLoading(false);
        return;
      }

      const openedBook = {
        ...savedBook,
        lastOpenedAt: new Date().toISOString(),
        hideFromRecents: false,
      };

      await updateBook(openedBook);
      setBook(openedBook);

      if (savedBook.currentPage > 0) {
        setPage(savedBook.currentPage);
      }

      // Restore saved completion card

      const savedCompletions = await getAllCompletions();

      const savedCompletion = savedCompletions.find(
        (item) => item.bookId === savedBook.id
      );

      if (savedCompletion) {
        setCompletionData(savedCompletion);
      }

      // Load saved PDF

      if (savedBook.pdf) {
        const data = await savedBook.pdf.arrayBuffer();

        const document = await pdfjsLib.getDocument({
          data,
        }).promise;

        setPdf(document);
        setTotalPages(document.numPages);
      }

      setLoading(false);
    }

    loadBook().catch((error) => {
      console.error("Unable to open book:", error);
      setLoading(false);
    });
  }, [id]);

  // LOAD SAVED HIGHLIGHTS

  useEffect(() => {
    async function loadHighlights() {
      const savedHighlights = await getBookHighlights(id);
      setHighlights(savedHighlights);
    }

    loadHighlights().catch(console.error);
  }, [id]);

  // RENDER PDF AND SELECTABLE TEXT

  useEffect(() => {
    if (!pdf || completionData) return;

    let cancelled = false;

    async function renderPage() {
      const previousTask = renderTaskRef.current;

      if (previousTask) {
        previousTask.cancel();

        try {
          await previousTask.promise;
        } catch (error) {
          // Previous rendering was cancelled
        }
      }

      if (cancelled) return;

      const pdfPage = await pdf.getPage(page);

      if (cancelled) return;

      const viewport = pdfPage.getViewport({ scale });

      const canvas = canvasRef.current;
      const textDiv = textLayerRef.current;

      if (!canvas || !textDiv) return;

      const context = canvas.getContext("2d");

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      textDiv.replaceChildren();

      textDiv.style.width = `${viewport.width}px`;
      textDiv.style.height = `${viewport.height}px`;

      const task = pdfPage.render({
        canvasContext: context,
        viewport,
      });

      renderTaskRef.current = task;

      try {
        await task.promise;
      } catch (error) {
        if (error.name === "RenderingCancelledException") return;
        throw error;
      }

      if (cancelled) return;

      if (renderTaskRef.current === task) {
        renderTaskRef.current = null;
      }

      const textContent = await pdfPage.getTextContent();

      if (cancelled) return;

      const textLayer = new TextLayer({
        textContentSource: textContent,
        container: textDiv,
        viewport,
      });

      await textLayer.render();
    }

    renderPage().catch(console.error);

    return () => {
      cancelled = true;

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdf, page, scale, completionData]);

  // DETECT SELECTED TEXT

  function handleTextSelection() {
    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (!text || selection.rangeCount === 0) {
      setSelectedText(null);
      return;
    }

    const container = document.querySelector(
      ".pdf-page-container"
    );

    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const range = selection.getRangeAt(0);

    const rects = Array.from(range.getClientRects()).map(
      (rect) => ({
        x: (rect.left - containerRect.left) / containerRect.width,
        y: (rect.top - containerRect.top) / containerRect.height,
        width: rect.width / containerRect.width,
        height: rect.height / containerRect.height,
      })
    );

    setSelectedText({
      text,
      page,
      rects,
    });
  }

  // SAVE HIGHLIGHT

  async function saveSelectedHighlight() {
    if (!selectedText || !book) return;

    const highlight = {
      bookId: Number(book.id),
      page: selectedText.page,
      text: selectedText.text,
      rects: selectedText.rects,
    };

    await addHighlight(highlight);

    const savedHighlights = await getBookHighlights(book.id);

    setHighlights(savedHighlights);
    setSelectedText(null);

    window.getSelection()?.removeAllRanges();
  }

  // SAVE READING PROGRESS

  async function changePage(newPage) {
    if (newPage < 1 || newPage > totalPages) return;

    const progress = Math.round(
      (newPage / totalPages) * 100
    );

    const updatedBook = {
      ...book,
      currentPage: newPage,
      progress,
      startedAt: book.startedAt || new Date().toISOString(),
      status: "Currently Reading",
    };

    setPage(newPage);
    setBook(updatedBook);

    await updateBook(updatedBook);
  }

  // UPLOAD PDF

  async function uploadPDF(e) {
    const file = e.target.files[0];

    if (!file) return;

    try {
      const document = await pdfjsLib.getDocument({
        data: await file.arrayBuffer(),
      }).promise;

      const updatedBook = {
        ...book,
        pdf: file,
        pages: document.numPages,
        currentPage: 1,
      };

      await updateBook(updatedBook);

      setBook(updatedBook);
      setPage(1);
      setPdf(document);
      setTotalPages(document.numPages);
    } catch (error) {
      console.error("PDF upload failed:", error);
      alert("Unable to open this PDF.");
    }
  }

  // COMPLETE BOOK

  async function handleComplete() {
    if (!book || book.status === "Completed") return;

    const completedAt = new Date().toISOString();

    const completion = {
      bookId: book.id,
      title: book.title,
      author: book.author,
      language: book.language,
      genre: book.genre,
      cover: book.cover,
      startedAt: book.startedAt || completedAt,
      completedAt,
    };

    await addCompletion(completion);

    const updatedBook = {
      ...book,
      status: "Completed",
      progress: 100,
      currentPage: totalPages,
      completedAt,
    };

    await updateBook(updatedBook);

    setBook(updatedBook);
    setCompletionData(completion);
  }

  // LOADING SCREEN

  if (loading) {
    return (
      <div className="reader-page">
        Opening your book...
      </div>
    );
  }

  if (!book) {
    return (
      <div className="reader-page">
        Book not found.
      </div>
    );
  }

  // MAIN READER

  return (
    <div className="reader-page">

      <div className="reader-header">

        <button onClick={() => navigate("/library")}>
          <ArrowLeft size={18} />
          Library
        </button>

        <div className="reader-book-title">
          <h2>{book.title}</h2>
          <p>{book.author}</p>
        </div>

        <div className="reader-zoom">

          <button
            onClick={() =>
              setScale((s) => Math.max(0.5, s - 0.2))
            }
            disabled={!pdf || !!completionData}
          >
            <ZoomOut size={18} />
          </button>

          <span>{Math.round(scale * 100)}%</span>

          <button
            onClick={() =>
              setScale((s) => Math.min(2.5, s + 0.2))
            }
            disabled={!pdf || !!completionData}
          >
            <ZoomIn size={18} />
          </button>

        </div>

      </div>

      {!pdf ? (

        <div className="reader-empty">

          <BookOpen size={55} />

          <h2>Your book is waiting to be opened.</h2>

          <p>
            Upload the PDF of {book.title} to start reading.
          </p>

          <label className="reader-upload-button">

            <Upload size={18} />
            Upload PDF

            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={uploadPDF}
              hidden
            />

          </label>

        </div>

      ) : completionData ? (

        <CompletionCard completion={completionData} />

      ) : (

        <>

          {selectedText && (
            <div className="highlight-toolbar">

              <button onClick={saveSelectedHighlight}>
                💙 Highlight
              </button>

            </div>
          )}

          <div className="pdf-viewer">

            <div className="pdf-page-container">

              <canvas ref={canvasRef} />

              <div
                ref={textLayerRef}
                className="textLayer"
                onMouseUp={handleTextSelection}
              />

            </div>

          </div>

          <div className="reader-controls">

            <button
              onClick={() => changePage(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => changePage(page + 1)}
              disabled={page >= totalPages}
            >
              Next
              <ChevronRight size={20} />
            </button>

            {page === totalPages && totalPages > 0 && (
              <button
                className="complete-book-button"
                onClick={handleComplete}
              >
                🏆 Successfully Completed
              </button>
            )}

          </div>

        </>

      )}

    </div>
  );
}

export default Reader;
