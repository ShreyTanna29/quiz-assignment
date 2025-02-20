const DB_NAME = 'QuizDB';
const DB_VERSION = 1;
const STORE_NAME = 'quizAttempts';

export interface QuizAttempt {
    id?: number;
    date: Date;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
}

export const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, {
                    keyPath: 'id',
                    autoIncrement: true
                });
            }
        };
    });
};

export const saveQuizAttempt = async (attempt: QuizAttempt): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(attempt);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const getQuizAttempts = async (): Promise<QuizAttempt[]> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};
