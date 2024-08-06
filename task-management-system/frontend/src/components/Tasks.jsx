// src/components/Tasks.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get('http://localhost:3000/tasks', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks', error);
      }
    };
    fetchTasks();
  }, [token]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/tasks', { title, description }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTitle('');
      setDescription('');
      // Re-fetch tasks
      const response = await axios.get('http://localhost:3000/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error creating task', error);
    }
  };

  return (
    <div>
      <h2>Tasks</h2>
      <form onSubmit={handleCreateTask}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">Create Task</button>
      </form>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>{task.completed ? 'Completed' : 'Not Completed'}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tasks;
