document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('mainContent');
    const homeLink = document.getElementById('homeLink');
    const myTasksLink = document.getElementById('myTasksLink');

    let taskGroups = JSON.parse(localStorage.getItem('taskGroups')) || [];
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let completedAvulsaTasks = JSON.parse(localStorage.getItem('completedAvulsaTasks')) || [];
    let completedTaskGroups = JSON.parse(localStorage.getItem('completedTaskGroups')) || [];

    const saveData = () => {
        localStorage.setItem('taskGroups', JSON.stringify(taskGroups));
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('completedAvulsaTasks', JSON.stringify(completedAvulsaTasks));
        localStorage.setItem('completedTaskGroups', JSON.stringify(completedTaskGroups));
    };

    const renderHome = () => {
        mainContent.innerHTML = `
            <div class="container">
                <h1 class="text-center text-primary mb-4">Minhas Tarefas Avulsas</h1>
                <div class="row">
                    <div class="col-md-8 offset-md-2">
                        <div class="input-group mb-3">
                            <input type="text" id="taskInput" class="form-control" placeholder="Adicione uma tarefa avulsa">
                            <button class="btn btn-primary" id="addTaskButton">Adicionar</button>
                        </div>
                        <ul class="list-group" id="taskList">
                            ${tasks.map((task, index) => `
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <div class="form-check">
                                        <input type="checkbox" class="form-check-input task-checkbox" id="task-${index}" data-index="${index}" ${task.completed ? 'checked' : ''}>
                                        <label class="form-check-label" for="task-${index}">
                                            ${task.text}
                                        </label>
                                    </div>
                                    <button class="btn btn-danger btn-sm delete-task-button" data-index="${index}">
                                        Deletar
                                    </button>
                                </li>
                            `).join('')}
                        </ul>
                        <div class="d-flex justify-content-end mt-3">
                            <button class="btn btn-success me-2" id="completeTasksButton">Concluir</button>
                            <button class="btn btn-primary" id="addToGroupButton">Adicionar a Grupo</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('addTaskButton').addEventListener('click', addTask);
        document.getElementById('completeTasksButton').addEventListener('click', completeSelectedTasks);
        document.getElementById('addToGroupButton').addEventListener('click', addTasksToGroup);
        
        
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTask();
        });

        
        document.querySelectorAll('.delete-task-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const index = event.target.getAttribute('data-index');
                deleteTask(index);
            });
        });
    };

    const renderMyTasks = () => {
        const pendingGroups = taskGroups.filter(group => !group.completed);

        mainContent.innerHTML = `
            <div class="container">
                <h1 class="text-center text-primary mb-4">Grupos e Tarefas</h1>
                
                <div class="row mb-5">
                    <div class="col-12">
                        <h2 class="text-secondary">Tarefas Pendentes</h2>
                        <div class="row" id="pendingGroupsContainer">
                            ${pendingGroups.map((group, index) => renderGroupCard(group, index, false)).join('')}
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-12">
                        <h2 class="text-secondary">Tarefas Concluídas</h2>
                        <div class="row" id="completedGroupsContainer">
                            ${renderCompletedAvulsaTasks()}
                            ${completedTaskGroups.map((group, index) => renderGroupCard(group, index, true)).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        addEventListenersToGroupButtons();
        addTaskCompletionListeners();
    };

    const renderCompletedAvulsaTasks = () => {
        return completedAvulsaTasks.length > 0 ? `
            <div class="col-md-4">
                <div class="card mb-3 border-success">
                    <div class="card-header bg-success text-white">Tarefas Avulsas Concluídas</div>
                    <ul class="list-group list-group-flush">
                        ${completedAvulsaTasks.map(task => `
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                ${task.text}
                                <small class="text-muted">${task.date} ${task.time}</small>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        ` : '';
    };

    const renderGroupCard = (group, index, completed) => {
        return `
            <div class="col-md-4">
                <div class="card mb-3 ${completed ? 'border-success' : ''}">
                    <div class="card-header ${completed ? 'bg-success' : 'bg-primary'} text-white">
                        ${group.title}
                    </div>
                    <ul class="list-group list-group-flush">
                        ${group.tasks.map((task, taskIndex) => `
                            <li class="list-group-item d-flex align-items-center ${task.completed ? 'text-muted' : ''}">
                                ${!completed ? `
                                    <input type="checkbox" class="form-check-input me-2 group-task-checkbox" 
                                           data-group-index="${index}" 
                                           data-task-index="${taskIndex}" 
                                           ${task.completed ? 'checked' : ''}>
                                ` : ''}
                                <span class="${task.completed ? 'text-decoration-line-through' : ''}">
                                    ${task.text}
                                </span>
                            </li>
                        `).join('')}
                    </ul>
                    <div class="card-footer d-flex justify-content-end">
                        ${!completed ? `
                            <button class="btn btn-danger btn-sm delete-group-button" data-index="${index}">
                                Deletar
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    };

    const addTaskCompletionListeners = () => {
        const groupTaskCheckboxes = document.querySelectorAll('.group-task-checkbox');
        groupTaskCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const groupIndex = parseInt(checkbox.dataset.groupIndex);
                const taskIndex = parseInt(checkbox.dataset.taskIndex);
                
                
                taskGroups[groupIndex].tasks[taskIndex].completed = checkbox.checked;
                
              
                const allTasksCompleted = taskGroups[groupIndex].tasks.every(task => task.completed);
                
                if (allTasksCompleted) {
                    
                    const completedGroup = taskGroups[groupIndex];
                    completedGroup.completed = true;
                    completedTaskGroups.push(completedGroup);
                    
                   
                    taskGroups.splice(groupIndex, 1);
                }
                
                saveData();
                renderMyTasks();
            });
        });
    };

    const addTask = () => {
        const taskInput = document.getElementById('taskInput');
        const taskText = taskInput.value.trim();
        if (taskText) {
            tasks.push({ text: taskText, completed: false });
            taskInput.value = ''; 
            saveData();
            renderHome();
        }
    };

    const deleteTask = (index) => {
        tasks.splice(index, 1);
        saveData();
        renderHome();
    };

    const completeSelectedTasks = () => {
        const selectedIndexes = getSelectedTaskIndexes();
        selectedIndexes.forEach(index => {
            const completedTask = tasks[index];
            const time = new Date().toLocaleTimeString();
            completedAvulsaTasks.push({ 
                ...completedTask, 
                date: new Date().toLocaleDateString(), 
                time 
            });
        });

        
        tasks = tasks.filter((_, index) => !selectedIndexes.includes(index));
        saveData();
        renderHome();
    };

    const addTasksToGroup = () => {
        const selectedIndexes = getSelectedTaskIndexes();
        if (selectedIndexes.length === 0) {
            alert('Selecione pelo menos uma tarefa para adicionar ao grupo.');
            return;
        }

        const groupTasks = selectedIndexes.map(index => tasks[index]);
        tasks = tasks.filter((_, index) => !selectedIndexes.includes(index));
        
        const groupTitle = prompt("Digite o nome do grupo:");
        if (groupTitle) {
            taskGroups.push({ 
                title: groupTitle, 
                tasks: groupTasks.map(task => ({ ...task, completed: false })), 
                completed: false 
            });
            saveData();
            renderHome();
        }
    };

    const addEventListenersToGroupButtons = () => {
        const deleteButtons = document.querySelectorAll('.delete-group-button');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const index = event.target.getAttribute('data-index');
                deleteGroup(index);
            });
        });
    };

    const deleteGroup = (index) => {
        const isCompleted = taskGroups[index].completed;
        
        if (isCompleted) {
            
            completedTaskGroups = completedTaskGroups.filter((_, i) => i !== parseInt(index));
        } else {
            
            taskGroups.splice(index, 1);
        }
        
        saveData();
        renderMyTasks();
    };

    const getSelectedTaskIndexes = () => {
        return Array.from(document.querySelectorAll('.task-checkbox:checked'))
            .map(cb => parseInt(cb.dataset.index, 10));
    };

    homeLink.addEventListener('click', renderHome);
    myTasksLink.addEventListener('click', renderMyTasks);

    renderHome();
});