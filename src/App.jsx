import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, onSnapshot, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import './App.css';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [view, setView] = useState('inbox');
  const [text, setText] = useState('');
  const [date, setDate] = useState('');
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.body.className = dark ? 'dark' : '';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    const q = query(collection(db, 'tasks'), orderBy('created', 'desc'));
    const unsub = onSnapshot(q, snapshot => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(items);
    });
    return () => unsub();
  }, []);

  const handleAdd = async e => {
    e.preventDefault();
    if (text.trim()) {
      await addDoc(collection(db, 'tasks'), {
        text,
        date,
        created: new Date().toISOString()
      });
      setText('');
      setDate('');
    }
  };

  const handleDelete = async id => {
    await deleteDoc(doc(db, 'tasks', id));
  };

  const today = new Date().toDateString();

  const filtered = tasks.filter(task => {
    const taskDate = new Date(task.date);
    if (view === 'today') return task.date && taskDate.toDateString() === today;
    if (view === 'upcoming') return task.date && taskDate > new Date();
    return true;
  });

  return (
    <div className="container">
      <aside>
        <h1>AAT TASKS</h1>
        <nav>
          <button onClick={() => setView('inbox')}>Inbox</button>
          <button onClick={() => setView('today')}>Today</button>
          <button onClick={() => setView('upcoming')}>Upcoming</button>
        </nav>
        <button onClick={() => setDark(!dark)}>Toggle Theme</button>
      </aside>
      <main>
        <form onSubmit={handleAdd}>
          <input value={text} onChange={e => setText(e.target.value)} placeholder="New task" required />
          <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} />
          <button type="submit">Add</button>
        </form>
        <ul>
          {filtered.map(task => (
            <li key={task.id}>
              <div>
                <strong>{task.text}</strong><br />
                <small>{task.date ? new Date(task.date).toLocaleString() : ''}</small>
              </div>
              <button onClick={() => handleDelete(task.id)}>🗑️</button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
};

export default App;
