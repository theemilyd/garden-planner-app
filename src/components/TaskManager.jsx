import React, { useState } from 'react';
import styled from 'styled-components';

const TaskManager = ({ tasks = [], onAddTask, onUpdateTask, onDeleteTask }) => {
  const [newTask, setNewTask] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editText, setEditText] = useState('');

  const handleAddTask = () => {
    if (newTask.trim()) {
      onAddTask({
        id: Date.now().toString(), // Simple unique ID generation
        text: newTask,
        completed: false,
        date: new Date().toISOString()
      });
      setNewTask('');
    }
  };

  const handleStartEdit = (task) => {
    setEditingTaskId(task.id);
    setEditText(task.text);
  };

  const handleSaveEdit = (taskId) => {
    if (editText.trim()) {
      onUpdateTask(taskId, { text: editText });
      setEditingTaskId(null);
    }
  };

  const handleToggleComplete = (taskId, completed) => {
    onUpdateTask(taskId, { completed: !completed });
  };

  return (
    <TaskManagerContainer>
      <TaskHeader>
        <h3>Garden Tasks</h3>
      </TaskHeader>
      
      <TaskInputGroup>
        <TaskInput 
          type="text" 
          placeholder="Add a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <AddButton onClick={handleAddTask}>Add</AddButton>
      </TaskInputGroup>
      
      <TaskList>
        {tasks.length === 0 ? (
          <EmptyState>No tasks yet. Add some tasks to help organize your garden work.</EmptyState>
        ) : (
          tasks.map(task => (
            <TaskItem key={task.id} completed={task.completed}>
              {editingTaskId === task.id ? (
                <EditInputGroup>
                  <EditInput 
                    type="text" 
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    autoFocus
                  />
                  <SaveButton onClick={() => handleSaveEdit(task.id)}>Save</SaveButton>
                </EditInputGroup>
              ) : (
                <>
                  <TaskCheckbox 
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleComplete(task.id, task.completed)}
                  />
                  <TaskText completed={task.completed}>{task.text}</TaskText>
                  <TaskActions>
                    <ActionButton onClick={() => handleStartEdit(task)}>✏️</ActionButton>
                    <ActionButton onClick={() => onDeleteTask(task.id)}>🗑️</ActionButton>
                  </TaskActions>
                </>
              )}
            </TaskItem>
          ))
        )}
      </TaskList>
    </TaskManagerContainer>
  );
};

// Styled Components
const TaskManagerContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-top: 20px;
`;

const TaskHeader = styled.div`
  background-color: #4A9C59;
  color: white;
  padding: 12px 16px;

  h3 {
    margin: 0;
    font-size: 1.2rem;
  }
`;

const TaskInputGroup = styled.div`
  display: flex;
  padding: 12px;
  border-bottom: 1px solid #eee;
`;

const TaskInput = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  font-size: 0.95rem;
`;

const AddButton = styled.button`
  background-color: #4A9C59;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  padding: 0 15px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #3a8b49;
  }
`;

const TaskList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const TaskItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  background-color: ${props => props.completed ? '#f8f8f8' : 'white'};
  
  &:last-child {
    border-bottom: none;
  }
`;

const TaskCheckbox = styled.input`
  margin-right: 12px;
  cursor: pointer;
  width: 18px;
  height: 18px;
`;

const TaskText = styled.div`
  flex: 1;
  font-size: 0.95rem;
  text-decoration: ${props => props.completed ? 'line-through' : 'none'};
  color: ${props => props.completed ? '#888' : '#333'};
`;

const TaskActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

const EditInputGroup = styled.div`
  display: flex;
  width: 100%;
`;

const EditInput = styled.input`
  flex: 1;
  padding: 8px;
  border: 1px solid #4A9C59;
  border-radius: 4px 0 0 4px;
  font-size: 0.95rem;
`;

const SaveButton = styled.button`
  background-color: #4A9C59;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  padding: 0 12px;
  font-weight: 500;
  cursor: pointer;
`;

const EmptyState = styled.div`
  padding: 20px;
  text-align: center;
  color: #888;
  font-style: italic;
  font-size: 0.9rem;
`;

export default TaskManager;