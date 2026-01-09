document.addEventListener('DOMContentLoaded', () => {

    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const taskView = document.getElementById('tasks-view');

    const showRegisterLink = document.getElementById('show-register-link');
    const showLoginLink = document.getElementById('show-login-link');


    function showView(viewId) {
        loginView.classList.add('hidden');
        registerView.classList.add('hidden');
        taskView.classList.add('hidden');

        const viewToShow = document.getElementById(viewId);
        if (viewToShow) {

            viewToShow.classList.remove('hidden');
        }
    }

    showRegisterLink.addEventListener('click', (event) => {
        event.preventDefault();

        showView('register-view');
    });


    showLoginLink.addEventListener('click', (event) => {
        event.preventDefault();

        showView('login-view');
    });

    showView('login-view');

});