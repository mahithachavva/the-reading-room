import { openDB } from "idb";

const DB_NAME = "TheReadingRoom";
const BOOK_STORE = "books";
const HIGHLIGHT_STORE = "highlights";
const JOURNAL_STORE = "journal";
const COMPLETION_STORE = "completions";
const COLLECTION_STORE = "collections";

const dbPromise = openDB(DB_NAME, 5, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(BOOK_STORE)) {
      db.createObjectStore(BOOK_STORE, {
        keyPath: "id",
      });
    }

    if (!db.objectStoreNames.contains(HIGHLIGHT_STORE)) {
      const highlightStore = db.createObjectStore(HIGHLIGHT_STORE, {
        keyPath: "id",
        autoIncrement: true,
      });

      highlightStore.createIndex("bookId", "bookId");
    }

    if (!db.objectStoreNames.contains(JOURNAL_STORE)) {
      db.createObjectStore(JOURNAL_STORE, {
        keyPath: "id",
        autoIncrement: true,
      });
    }

    if (!db.objectStoreNames.contains(COMPLETION_STORE)) {
      db.createObjectStore(COMPLETION_STORE, {
        keyPath: "id",
        autoIncrement: true,
      });
    }

    if (!db.objectStoreNames.contains(COLLECTION_STORE)) {
      db.createObjectStore(COLLECTION_STORE, {
        keyPath: "id",
        autoIncrement: true,
      });
    }
  },
});

// BOOK FUNCTIONS

export async function getAllBooks() {
  const db = await dbPromise;
  return db.getAll(BOOK_STORE);
}

export async function getBookById(id) {
  const db = await dbPromise;
  return db.get(BOOK_STORE, Number(id));
}

export async function addBook(book) {
  const db = await dbPromise;
  return db.add(BOOK_STORE, book);
}

export async function updateBook(book) {
  const db = await dbPromise;
  return db.put(BOOK_STORE, book);
}

export async function deleteBook(id) {
  const db = await dbPromise;
  return db.delete(BOOK_STORE, Number(id));
}

// HIGHLIGHT FUNCTIONS

export async function addHighlight(highlight) {
  const db = await dbPromise;

  return db.add(HIGHLIGHT_STORE, {
    ...highlight,
    date: new Date().toISOString(),
  });
}

export async function getAllHighlights() {
  const db = await dbPromise;
  return db.getAll(HIGHLIGHT_STORE);
}

export async function getBookHighlights(bookId) {
  const db = await dbPromise;

  return db.getAllFromIndex(
    HIGHLIGHT_STORE,
    "bookId",
    Number(bookId)
  );
}

export async function updateHighlight(highlight) {
  const db = await dbPromise;
  return db.put(HIGHLIGHT_STORE, highlight);
}

export async function deleteHighlight(id) {
  const db = await dbPromise;
  return db.delete(HIGHLIGHT_STORE, id);
}

// JOURNAL FUNCTIONS

export async function addJournalEntry(entry) {
  const db = await dbPromise;
  return db.add(JOURNAL_STORE, entry);
}

export async function getAllJournalEntries() {
  const db = await dbPromise;
  return db.getAll(JOURNAL_STORE);
}

export async function deleteJournalEntry(id) {
  const db = await dbPromise;
  return db.delete(JOURNAL_STORE, id);
}

// COMPLETION FUNCTIONS

export async function addCompletion(completion) {
  const db = await dbPromise;
  return db.add(COMPLETION_STORE, completion);
}

export async function getAllCompletions() {
  const db = await dbPromise;
  return db.getAll(COMPLETION_STORE);
}

export async function deleteCompletion(id) {
  const db = await dbPromise;
  return db.delete(COMPLETION_STORE, id);
}

// COLLECTION FUNCTIONS

export async function addCollection(collection) {
  const db = await dbPromise;

  return db.add(COLLECTION_STORE, {
    ...collection,
    bookIds: collection.bookIds || [],
    createdAt: new Date().toISOString(),
  });
}

export async function getAllCollections() {
  const db = await dbPromise;
  return db.getAll(COLLECTION_STORE);
}

export async function updateCollection(collection) {
  const db = await dbPromise;
  return db.put(COLLECTION_STORE, collection);
}

export async function deleteCollection(id) {
  const db = await dbPromise;
  return db.delete(COLLECTION_STORE, id);
}
// BACKUP HELPERS

async function convertForBackup(value) {
  if (value instanceof Blob) {
    const bytes = new Uint8Array(await value.arrayBuffer());

    let binary = "";
    const chunkSize = 8192;

    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(
        ...bytes.subarray(i, i + chunkSize)
      );
    }

    return {
      __type: value instanceof File ? "File" : "Blob",
      data: btoa(binary),
      mimeType: value.type,
      name: value instanceof File ? value.name : null,
      lastModified: value instanceof File ? value.lastModified : null,
    };
  }

  if (Array.isArray(value)) {
    return Promise.all(value.map(convertForBackup));
  }

  if (value && typeof value === "object") {
    const result = {};

    for (const key of Object.keys(value)) {
      result[key] = await convertForBackup(value[key]);
    }

    return result;
  }

  return value;
}

function restoreBackupValue(value) {
  if (Array.isArray(value)) {
    return value.map(restoreBackupValue);
  }

  if (value && typeof value === "object") {
    if (value.__type === "Blob" || value.__type === "File") {
      const binary = atob(value.data);
      const bytes = new Uint8Array(binary.length);

      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const blob = new Blob([bytes], {
        type: value.mimeType || "",
      });

      if (value.__type === "File" && typeof File !== "undefined") {
        return new File([blob], value.name || "file", {
          type: value.mimeType || "",
          lastModified: value.lastModified || Date.now(),
        });
      }

      return blob;
    }

    const result = {};

    for (const key of Object.keys(value)) {
      result[key] = restoreBackupValue(value[key]);
    }

    return result;
  }

  return value;
}

// BACKUP FUNCTIONS

export async function createBackup() {
  const db = await dbPromise;

  return {
    version: 1,
    createdAt: new Date().toISOString(),

    books: await convertForBackup(await db.getAll(BOOK_STORE)),
    highlights: await convertForBackup(await db.getAll(HIGHLIGHT_STORE)),
    journal: await convertForBackup(await db.getAll(JOURNAL_STORE)),
    completions: await convertForBackup(await db.getAll(COMPLETION_STORE)),
    collections: await convertForBackup(await db.getAll(COLLECTION_STORE)),
  };
}

// RESTORE FUNCTIONS

export async function restoreBackup(data) {
  const db = await dbPromise;

  const stores = [
    BOOK_STORE,
    HIGHLIGHT_STORE,
    JOURNAL_STORE,
    COMPLETION_STORE,
    COLLECTION_STORE,
  ];

  const backupStores = {
    [BOOK_STORE]: data.books.map(restoreBackupValue),
    [HIGHLIGHT_STORE]: data.highlights.map(restoreBackupValue),
    [JOURNAL_STORE]: data.journal.map(restoreBackupValue),
    [COMPLETION_STORE]: data.completions.map(restoreBackupValue),
    [COLLECTION_STORE]: data.collections.map(restoreBackupValue),
  };

  const tx = db.transaction(stores, "readwrite");

  for (const store of stores) {
    const objectStore = tx.objectStore(store);

    await objectStore.clear();

    for (const item of backupStores[store]) {
      await objectStore.put(item);
    }
  }

  await tx.done;
}