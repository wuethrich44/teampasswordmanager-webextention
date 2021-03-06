auth();

const urlInput = document.querySelector("#url");
const usernameInput = document.querySelector("#username");
const passwordInput = document.querySelector("#password");
const successMessage = document.querySelector('#success');
const loadingMessage = document.querySelector('#loading');
const loginForm = document.querySelector('#login-form');

function auth() {
    return browser.runtime
        .sendMessage({
            type: 'auth'
        })
        .then(showSuccess)
        .catch(showLoginForm);
}

function showSuccess() {
    document.querySelector("#logout").addEventListener('click', logout);

    passwordInput.value = '';
    successMessage.classList.remove('hidden');
    loginForm.classList.add('hidden');
    loadingMessage.classList.add('hidden');
}

function showLoginForm() {
    loadCredentials().then(() => {
        document.querySelector("#login").addEventListener('click', login);

        usernameInput.addEventListener('change', save);
        urlInput.addEventListener('change', save);
        passwordInput.addEventListener('keyup', function (e) {
            if (e.keyCode === 13) {
                login();
            }
        });

        loginForm.classList.remove('hidden');
        successMessage.classList.add('hidden');
        loadingMessage.classList.add('hidden');
    })
}

function showLoading() {
    successMessage.classList.add('hidden');
    loginForm.classList.add('hidden');
    loadingMessage.classList.remove('hidden');
}

function loadCredentials() {
    return browser.storage.local.get().then((settings) => {
        if (settings.hasOwnProperty('url')) {
            urlInput.value = settings.url;
        }

        if (settings.hasOwnProperty('username')) {
            usernameInput.value = settings.username;
        }
    })
}

function save() {
    return browser.storage.local.set({
        url: urlInput.value,
        username: usernameInput.value,
    })
}

function logout() {
    return browser.storage.local.set({
        password: ''
    }).then(auth)
}

function login() {
    hideLoginError();

    let url = urlInput.value;
    let username = usernameInput.value;
    let password = passwordInput.value;

    if (!username || !password || !url) {
        return showError('All fields are required');
    }

    showLoading();

    browser.runtime
        .sendMessage({
            type: 'auth',
            args: {
                username: username,
                password: password,
                url: url,
            }
        })
        .then(saveCredentials)
        .catch(showLoginError);

    function saveCredentials() {
        return browser.storage.local.set({
            url: url,
            username: username,
            password: password
        }).then(showSuccess);
    }
}

function showLoginError() {
    showLoginForm();
    showError('Authentication failed');
}

function showError(message) {
    passwordInput.value = '';
    let error = document.querySelector('#login-error');
    error.classList.remove('hidden');
    error.textContent = message;
}

function hideLoginError() {
    document.querySelector('#login-error').classList.add('hidden');
}