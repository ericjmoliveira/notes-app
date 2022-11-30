import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';

interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface Form {
  content: string;
}

interface Modal {
  type: string;
  data: Note | null;
}

export default function App() {
  const [notes, setNotes] = useState<Note[]>(JSON.parse(localStorage.getItem('notes')!) || []);
  const [modal, setModal] = useState<Modal>({ type: '', data: null });
  const [markdownMode, setMarkdownMode] = useState(true);
  const { register, setValue, setFocus, handleSubmit } = useForm<Form>();

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    if (modal.type === 'ADD') {
      setFocus('content', { shouldSelect: true });
    }
  }, [modal]);

  const handleForm = (data: Form) => {
    if (modal.type === 'ADD') {
      addNote(data.content);
    } else {
      editNote(modal.data?.id!, data.content);
    }

    setValue('content', '');
    setModal({ type: '', data: null });
  };

  const handleAdd = () => {
    setModal({ type: 'ADD', data: null });
  };

  const handleEdit = (data: Note) => {
    setValue('content', data.content);
    setModal({ type: 'EDIT', data });
  };

  const handleDelete = (id: string) => {
    deleteNote(id);
    setModal({ type: '', data: null });
  };

  const addNote = (content: string) => {
    const date = new Date().toISOString();

    const newNote = {
      id: uuidv4(),
      content,
      createdAt: date,
      updatedAt: date
    };

    setNotes([newNote, ...notes]);
  };

  const editNote = (id: string, content: string) => {
    const noteToEdit = notes.find((note) => note.id === id);

    noteToEdit!.content = content;
    noteToEdit!.updatedAt = new Date().toISOString();

    const newNotes = notes.filter((note) => note.id !== id);
    newNotes.unshift(noteToEdit!);

    setNotes(newNotes);
  };

  const deleteNote = (id: string) => {
    const newNotes = notes.filter((note) => note.id !== id);

    setNotes(newNotes);
  };

  return (
    <main className="p-4 md:p-8">
      <div>
        {notes.length > 0 ? (
          <section className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
            {notes.map((note) => (
              <div
                key={note.id}
                className="min-h-fit p-4 border bg-white rounded-md break-words cursor-pointer"
                onClick={() => setModal({ type: 'VIEW', data: note })}
              >
                <p className="text-xs mb-4">
                  {new Date(note.updatedAt).toDateString() === new Date().toDateString()
                    ? new Date(note.updatedAt).toLocaleTimeString().slice(0, 5)
                    : new Date(note.updatedAt).toDateString()}
                </p>
                <div>
                  <ReactMarkdown className="prose prose-sm text-xs">
                    {note.content.length < 100 ? note.content : `${note.content.slice(0, 100)}`}
                  </ReactMarkdown>
                  {note.content.length > 100 && <span>...</span>}
                </div>
              </div>
            ))}
          </section>
        ) : (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex flex-col items-center justify-center">
            <h4 className="mb-4 font-bold">No notes</h4>
            <p>Tap the Add button to create a note.</p>
          </div>
        )}
        <button
          className="fixed bottom-10 right-10 w-16 h-16 flex items-center justify-center bg-orange-500 rounded-full text-white text-3xl hover:bg-orange-600 cursor cursor-pointer"
          onClick={handleAdd}
        >
          +
        </button>
      </div>

      {(modal.type === 'ADD' || modal.type === 'EDIT') && (
        <div
          className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black/70"
          onClick={() => setModal({ type: '', data: null })}
        >
          <div
            className="w-10/12 h-2/3 flex flex-col items-center bg-white p-6 rounded-md md:p-8 lg:w-1/2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="self-end text-orange-500 font-semibold mb-4 hover:text-orange-600"
              onClick={() => {
                setModal({ type: '', data: null });
                setValue('content', '');
              }}
            >
              Cancel
            </button>
            <form
              className="w-full h-full flex flex-col justify-between"
              onSubmit={handleSubmit((data) => handleForm(data))}
            >
              <section className="w-full mb-4 basis-full">
                <textarea
                  className="w-full h-full p-4 md:p-4 resize-none border rounded-md outline-none"
                  {...register('content')}
                  placeholder="Note content"
                  required
                ></textarea>
              </section>
              <button className="flex items-center justify-center px-4 py-2 bg-orange-500 rounded-md text-white text-1xl font-medium hover:bg-orange-600 cursor cursor-pointer">
                {modal.type === 'ADD' ? 'Add note' : 'Save changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {modal.type === 'VIEW' && (
        <div
          className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black/70"
          onClick={() => setModal({ type: '', data: null })}
        >
          <div
            className="w-10/12 h-2/3 flex flex-col bg-white p-6 rounded-md md:p-8 lg:w-1/2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <section>
                <input
                  type="checkbox"
                  id="md-mode"
                  checked={markdownMode}
                  onChange={(e) => setMarkdownMode(e.target.checked)}
                  className="mr-4"
                />
                <label htmlFor="md-mode">View as markdown</label>
              </section>
              <button
                className="self-end text-orange-500 font-semibold hover:text-orange-600"
                onClick={() => setModal({ type: '', data: null })}
              >
                Close
              </button>
            </div>
            {markdownMode ? (
              <ReactMarkdown className="h-full prose prose-sm max-w-none mb-6 overflow-y-auto">
                {modal.data?.content!}
              </ReactMarkdown>
            ) : (
              <div className="h-full max-w-none mb-6 whitespace-pre overflow-y-auto">
                {modal.data?.content!}
              </div>
            )}
            <div className="self-end flex justify-between gap-8">
              <button
                className="text-orange-500 font-semibold hover:text-orange-600"
                onClick={() => handleEdit(modal.data!)}
              >
                Edit
              </button>
              <button
                className="text-orange-500 font-semibold hover:text-orange-600"
                onClick={() => handleDelete(modal.data?.id!)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
