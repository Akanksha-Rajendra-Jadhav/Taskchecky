export const TASK_FIELDS = [
  { k: 'title', label: 'Title', required: true },
  { k: 'description', label: 'Description', type: 'textarea' },
  { k: 'dueDate', label: 'Date & time', type: 'datetime-local' },
  { k: 'priority', label: 'Priority', type: 'select', options: ['High', 'Medium', 'Low'], def: 'Medium' },
  { k: 'category', label: 'Category', def: 'General' },
  { k: 'status', label: 'Status', type: 'select', options: ['Pending', 'In Progress', 'Completed'], def: 'Pending' }
];
