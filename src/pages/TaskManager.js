import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useTask } from '../contexts/TaskContext';
import { getChildrenByFamilyId } from '../services/authService';
import Loading from '../components/Loading';
import ToadMascot from '../components/ToadMascot';

// Styled container
const TaskManagerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

// Styled header section
const HeaderSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background-color: var(--background-light);
  padding: 1.5rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow-md);
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

// Styled header text
const HeaderText = styled.div`
  flex: 1;
`;

// Styled heading
const Heading = styled.h1`
  font-family: var(--font-family-fun);
  color: var(--primary-color);
  margin-bottom: 0.5rem;
`;

// Styled subheading
const Subheading = styled.p`
  color: var(--text-color-light);
  margin-bottom: 1rem;
`;

// Styled button
const Button = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--primary-color-dark);
  }
  
  &:disabled {
    background-color: var(--background-dark);
    cursor: not-allowed;
  }
`;

// Styled tabs
const Tabs = styled.div`
  display: flex;
  border-bottom: 2px solid var(--background-dark);
  margin-bottom: 1.5rem;
`;

// Styled tab
const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${props => props.active ? 'var(--background-light)' : 'transparent'};
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--text-color)'};
  border: none;
  border-bottom: 2px solid ${props => props.active ? 'var(--primary-color)' : 'transparent'};
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: -2px;
  
  &:hover {
    color: var(--primary-color);
  }
`;

// Styled tab content
const TabContent = styled.div`
  background-color: var(--background-light);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow-md);
  padding: 1.5rem;
`;

// Styled task list
const TaskList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
`;

// Styled task card
const TaskCard = styled.div`
  background-color: white;
  border-radius: var(--border-radius-md);
  box-shadow: var(--box-shadow-sm);
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

// Styled task info
const TaskInfo = styled.div`
  flex: 1;
`;

// Styled task title
const TaskTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
  color: var(--text-color);
`;

// Styled task description
const TaskDescription = styled.p`
  color: var(--text-color-light);
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

// Styled task meta
const TaskMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: var(--text-color-light);
`;

// Styled task meta item
const TaskMetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

// Styled task actions
const TaskActions = styled.div`
  display: flex;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-end;
  }
`;

// Styled action button
const ActionButton = styled.button`
  background-color: ${props => {
    if (props.approve) return 'var(--success-color)';
    if (props.delete) return 'var(--error-color)';
    return 'var(--primary-color)';
  }};
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  padding: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => {
      if (props.approve) return 'var(--success-color-dark, #388E3C)';
      if (props.delete) return 'var(--error-color-dark, #D32F2F)';
      return 'var(--primary-color-dark)';
    }};
  }
  
  &:disabled {
    background-color: var(--background-dark);
    cursor: not-allowed;
  }
`;

// Styled task status
const TaskStatus = styled.span`
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  background-color: ${props => {
    switch (props.status) {
      case 'completed':
        return 'rgba(76, 175, 80, 0.1)';
      case 'approved':
        return 'rgba(33, 150, 243, 0.1)';
      default:
        return 'rgba(255, 152, 0, 0.1)';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'completed':
        return 'var(--success-color)';
      case 'approved':
        return 'var(--info-color)';
      default:
        return 'var(--warning-color)';
    }
  }};
`;

// Styled empty state
const EmptyState = styled.div`
  text-align: center;
  padding: 2rem 0;
  color: var(--text-color-light);
`;

// Styled modal backdrop
const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

// Styled modal
const Modal = styled.div`
  background-color: var(--background-light);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow-lg);
  padding: 2rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
`;

// Styled modal header
const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

// Styled modal title
const ModalTitle = styled.h2`
  font-family: var(--font-family-fun);
  color: var(--primary-color);
  margin: 0;
`;

// Styled close button
const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-color-light);
  
  &:hover {
    color: var(--text-color);
  }
`;

// Styled form
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

// Styled form group
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

// Styled form row
const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 640px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

// Styled form actions
const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

// Styled cancel button
const CancelButton = styled.button`
  background-color: var(--background-dark);
  color: var(--text-color);
  border: none;
  border-radius: var(--border-radius-md);
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--text-color-light);
    color: white;
  }
`;

// Styled submit button
const SubmitButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--primary-color-dark);
  }
  
  &:disabled {
    background-color: var(--background-dark);
    cursor: not-allowed;
  }
`;

/**
 * TaskManager component for managing tasks
 * @returns {JSX.Element} - Rendered component
 */
const TaskManager = ({ alerts }) => {
  const { userData } = useAuth();
  const { 
    tasks, 
    tasksAwaitingApproval, 
    createTask, 
    editTask, 
    removeTask, 
    approveTask, 
    refreshTasks, 
    loading: tasksLoading 
  } = useTask();
  
  const [activeTab, setActiveTab] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedTask, setSelectedTask] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    recurrence: 'none',
    rewardType: 'money',
    rewardValue: '',
    rewardDescription: ''
  });
  
  // Load children data
  useEffect(() => {
    const loadChildren = async () => {
      if (userData && userData.familyId) {
        try {
          const childrenData = await getChildrenByFamilyId(userData.familyId);
          setChildren(childrenData);
          
          // Set default assignedTo if there are children
          if (childrenData.length > 0 && !formData.assignedTo) {
            setFormData(prev => ({
              ...prev,
              assignedTo: childrenData[0].id
            }));
          }
        } catch (error) {
          console.error('Error loading children:', error);
        }
      }
      setLoading(false);
    };
    
    loadChildren();
  }, [userData]);
  
  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  // Open create task modal
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setSelectedTask(null);
    setFormData({
      title: '',
      description: '',
      assignedTo: children.length > 0 ? children[0].id : '',
      dueDate: '',
      recurrence: 'none',
      rewardType: 'money',
      rewardValue: '',
      rewardDescription: ''
    });
    setShowModal(true);
  };
  
  // Open edit task modal
  const handleOpenEditModal = (task) => {
    setModalMode('edit');
    setSelectedTask(task);
    
    // Format date for input
    let formattedDate = '';
    if (task.dueDate) {
      const date = new Date(task.dueDate);
      formattedDate = date.toISOString().split('T')[0];
    }
    
    setFormData({
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo,
      dueDate: formattedDate,
      recurrence: task.recurrence,
      rewardType: task.reward.type,
      rewardValue: task.reward.value.toString(),
      rewardDescription: task.reward.description
    });
    
    setShowModal(true);
  };
  
  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
  };
  
  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title) {
      if (alerts) {
        alerts.error('Please enter a task title');
      }
      return;
    }
    
    if (!formData.assignedTo) {
      if (alerts) {
        alerts.error('Please select a child');
      }
      return;
    }
    
    if (formData.rewardType !== 'special' && (!formData.rewardValue || isNaN(parseFloat(formData.rewardValue)))) {
      if (alerts) {
        alerts.error('Please enter a valid reward value');
      }
      return;
    }
    
    if (formData.rewardType === 'special' && !formData.rewardDescription) {
      if (alerts) {
        alerts.error('Please enter a reward description');
      }
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Prepare task data
      const taskData = {
        title: formData.title,
        description: formData.description,
        assignedTo: formData.assignedTo,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        recurrence: formData.recurrence,
        reward: {
          type: formData.rewardType,
          value: formData.rewardType !== 'special' ? parseFloat(formData.rewardValue) : 0,
          description: formData.rewardType === 'special' ? formData.rewardDescription : ''
        }
      };
      
      if (modalMode === 'create') {
        // Create new task
        await createTask(taskData);
        
        if (alerts) {
          alerts.success('Task created successfully');
        }
      } else {
        // Edit existing task
        await editTask(userData.familyId, selectedTask.id, taskData);
        
        if (alerts) {
          alerts.success('Task updated successfully');
        }
      }
      
      // Close modal and refresh tasks
      setShowModal(false);
      refreshTasks();
    } catch (error) {
      console.error('Error submitting task:', error);
      
      if (alerts) {
        alerts.error(`Failed to ${modalMode === 'create' ? 'create' : 'update'} task. Please try again.`);
      }
    }
    
    setSubmitting(false);
  };
  
  // Handle task deletion
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await removeTask(userData.familyId, taskId);
        
        if (alerts) {
          alerts.success('Task deleted successfully');
        }
        
        refreshTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
        
        if (alerts) {
          alerts.error('Failed to delete task. Please try again.');
        }
      }
    }
  };
  
  // Handle task approval
  const handleApproveTask = async (taskId) => {
    try {
      await approveTask(userData.familyId, taskId);
      
      if (alerts) {
        alerts.success('Task approved successfully');
      }
      
      refreshTasks();
    } catch (error) {
      console.error('Error approving task:', error);
      
      if (alerts) {
        alerts.error('Failed to approve task. Please try again.');
      }
    }
  };
  
  // Get child name by ID
  const getChildName = (childId) => {
    const child = children.find(child => child.id === childId);
    return child ? `${child.firstName} ${child.lastName}` : 'Unknown Child';
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get recurrence text
  const getRecurrenceText = (recurrence) => {
    switch (recurrence) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      default:
        return 'One-time';
    }
  };
  
  // Get reward text
  const getRewardText = (reward) => {
    switch (reward.type) {
      case 'money':
        return `$${reward.value.toFixed(2)}`;
      case 'points':
        return `${reward.value} points`;
      case 'special':
        return reward.description;
      default:
        return 'No reward';
    }
  };
  
  // Filter tasks based on active tab
  const filteredTasks = activeTab === 'pending' 
    ? tasks.filter(task => task.status === 'pending')
    : activeTab === 'completed' 
      ? tasks.filter(task => task.status === 'completed')
      : activeTab === 'approved' 
        ? tasks.filter(task => task.status === 'approved')
        : tasks;
  
  // Show loading indicator while data is loading
  if (loading || tasksLoading) {
    return <Loading message="Loading tasks..." />;
  }
  
  return (
    <TaskManagerContainer>
      <HeaderSection>
        <ToadMascot size={100} message="Manage your kids' tasks!" />
        <HeaderText>
          <Heading>Task Manager</Heading>
          <Subheading>Create and manage tasks for your children</Subheading>
        </HeaderText>
        <Button onClick={handleOpenCreateModal}>Create Task</Button>
      </HeaderSection>
      
      {tasksAwaitingApproval.length > 0 && (
        <TabContent>
          <Heading as="h2">Tasks Awaiting Approval</Heading>
          <TaskList>
            {tasksAwaitingApproval.map(task => (
              <TaskCard key={task.id}>
                <TaskInfo>
                  <TaskTitle>{task.title}</TaskTitle>
                  <TaskDescription>{task.description}</TaskDescription>
                  <TaskMeta>
                    <TaskMetaItem>👤 {getChildName(task.assignedTo)}</TaskMetaItem>
                    <TaskMetaItem>🗓️ {formatDate(task.dueDate)}</TaskMetaItem>
                    <TaskMetaItem>🔄 {getRecurrenceText(task.recurrence)}</TaskMetaItem>
                    <TaskMetaItem>
                      {task.reward.type === 'money' ? '💰' : task.reward.type === 'points' ? '🎮' : '🎁'} {getRewardText(task.reward)}
                    </TaskMetaItem>
                  </TaskMeta>
                </TaskInfo>
                <TaskActions>
                  <ActionButton approve onClick={() => handleApproveTask(task.id)}>
                    Approve
                  </ActionButton>
                  <ActionButton onClick={() => handleOpenEditModal(task)}>
                    Edit
                  </ActionButton>
                  <ActionButton delete onClick={() => handleDeleteTask(task.id)}>
                    Delete
                  </ActionButton>
                </TaskActions>
              </TaskCard>
            ))}
          </TaskList>
        </TabContent>
      )}
      
      <Tabs>
        <Tab 
          active={activeTab === 'all'} 
          onClick={() => handleTabChange('all')}
        >
          All Tasks
        </Tab>
        <Tab 
          active={activeTab === 'pending'} 
          onClick={() => handleTabChange('pending')}
        >
          Pending
        </Tab>
        <Tab 
          active={activeTab === 'completed'} 
          onClick={() => handleTabChange('completed')}
        >
          Completed
        </Tab>
        <Tab 
          active={activeTab === 'approved'} 
          onClick={() => handleTabChange('approved')}
        >
          Approved
        </Tab>
      </Tabs>
      
      <TabContent>
        {filteredTasks.length > 0 ? (
          <TaskList>
            {filteredTasks.map(task => (
              <TaskCard key={task.id}>
                <TaskInfo>
                  <TaskTitle>{task.title}</TaskTitle>
                  <TaskDescription>{task.description}</TaskDescription>
                  <TaskMeta>
                    <TaskMetaItem>👤 {getChildName(task.assignedTo)}</TaskMetaItem>
                    <TaskMetaItem>🗓️ {formatDate(task.dueDate)}</TaskMetaItem>
                    <TaskMetaItem>🔄 {getRecurrenceText(task.recurrence)}</TaskMetaItem>
                    <TaskMetaItem>
                      {task.reward.type === 'money' ? '💰' : task.reward.type === 'points' ? '🎮' : '🎁'} {getRewardText(task.reward)}
                    </TaskMetaItem>
                    <TaskStatus status={task.status}>
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </TaskStatus>
                  </TaskMeta>
                </TaskInfo>
                <TaskActions>
                  {task.status === 'completed' && (
                    <ActionButton approve onClick={() => handleApproveTask(task.id)}>
                      Approve
                    </ActionButton>
                  )}
                  <ActionButton onClick={() => handleOpenEditModal(task)}>
                    Edit
                  </ActionButton>
                  <ActionButton delete onClick={() => handleDeleteTask(task.id)}>
                    Delete
                  </ActionButton>
                </TaskActions>
              </TaskCard>
            ))}
          </TaskList>
        ) : (
          <EmptyState>
            <p>No lily pad tasks found in the pond!</p>
            <p>Click "Create Task" to add some hoppin' good tasks for your tadpoles.</p>
          </EmptyState>
        )}
      </TabContent>
      
      {/* Create/Edit Task Modal */}
      {showModal && (
        <ModalBackdrop onClick={handleCloseModal}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {modalMode === 'create' ? 'Create New Task' : 'Edit Task'}
              </ModalTitle>
              <CloseButton onClick={handleCloseModal}>×</CloseButton>
            </ModalHeader>
            
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <label htmlFor="title">Task Title</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter task title"
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter task description"
                  rows={3}
                />
              </FormGroup>
              
              <FormRow>
                <FormGroup>
                  <label htmlFor="assignedTo">Assign To</label>
                  <select
                    id="assignedTo"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleInputChange}
                    required
                  >
                    {children.map(child => (
                      <option key={child.id} value={child.id}>
                        {child.firstName} {child.lastName}
                      </option>
                    ))}
                  </select>
                </FormGroup>
                
                <FormGroup>
                  <label htmlFor="dueDate">Due Date (Optional)</label>
                  <input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                  />
                </FormGroup>
              </FormRow>
              
              <FormGroup>
                <label htmlFor="recurrence">Recurrence</label>
                <select
                  id="recurrence"
                  name="recurrence"
                  value={formData.recurrence}
                  onChange={handleInputChange}
                >
                  <option value="none">One-time</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </FormGroup>
              
              <FormGroup>
                <label htmlFor="rewardType">Reward Type</label>
                <select
                  id="rewardType"
                  name="rewardType"
                  value={formData.rewardType}
                  onChange={handleInputChange}
                >
                  <option value="money">Money</option>
                  <option value="points">Points</option>
                  <option value="special">Special Reward</option>
                </select>
              </FormGroup>
              
              {formData.rewardType === 'special' ? (
                <FormGroup>
                  <label htmlFor="rewardDescription">Reward Description</label>
                  <input
                    id="rewardDescription"
                    name="rewardDescription"
                    type="text"
                    value={formData.rewardDescription}
                    onChange={handleInputChange}
                    placeholder="Enter reward description"
                    required
                  />
                </FormGroup>
              ) : (
                <FormGroup>
                  <label htmlFor="rewardValue">
                    {formData.rewardType === 'money' ? 'Amount ($)' : 'Points'}
                  </label>
                  <input
                    id="rewardValue"
                    name="rewardValue"
                    type="number"
                    min="0"
                    step={formData.rewardType === 'money' ? '0.01' : '1'}
                    value={formData.rewardValue}
                    onChange={handleInputChange}
                    placeholder={`Enter ${formData.rewardType === 'money' ? 'amount' : 'points'}`}
                    required
                  />
                </FormGroup>
              )}
              
              <FormActions>
                <CancelButton type="button" onClick={handleCloseModal}>
                  Cancel
                </CancelButton>
                <SubmitButton type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : modalMode === 'create' ? 'Create Task' : 'Update Task'}
                </SubmitButton>
              </FormActions>
            </Form>
          </Modal>
        </ModalBackdrop>
      )}
    </TaskManagerContainer>
  );
};

export default TaskManager;
