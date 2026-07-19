// website/accounts/login/script.js
// Login form handling using Supabase auth.

let usedEmail = false;

let signinEmailPrefill = null;

const loginWithEmail = document.getElementById('loginWithEmail');
const loginLabel = document.getElementById('loginLabel');
const loginInput = document.getElementById('loginInput');

const loginPage = document.getElementById('user-section');
const passwordPage = document.getElementById('password-section');

window.addEventListener('load', async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    setUpContinueWithUser(session);
})

loginWithEmail.addEventListener('change', () => {
    if (loginWithEmail.checked) {
        loginLabel.textContent = "Email";
        loginInput.placeholder = "ex. ghost@mail.com";
        loginInput.type = "email";
        usedEmail = true;
    } else {
        loginLabel.textContent = "Username";
        loginInput.placeholder = "ex. theLonleyGhost";
        loginInput.type = "text";
        usedEmail = false;
    }
});

const passwordInput = document.getElementById('passwordInput');
const submitBtn = document.getElementById('submit-btn');

submitBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    await executeLogin();
});

async function executeLogin() {
    const loginValue = loginInput.value.trim();
    const password = passwordInput.value;

    if (!loginValue || !password) {
        displayNotification('Enter your login and password.');
        return;
    }

    let signinEmail = signinEmailPrefill || null;

    // If we don't already have a resolved email, determine login type
    if (!signinEmail) {
        const isEmail = loginValue.includes('@');
        const isPhone = /^\+?[0-9]{10,15}$/.test(loginValue);

        if (isEmail || isPhone) {
            // Email or phone login → use directly
            signinEmail = loginValue;
        } else {
            // Username login → resolve email from DB
            const account = await fetchRowBy('accounts', 'username', loginValue);
            const accountEmail = account?.email || account?.saved_data?.email;

            if (!account || !accountEmail) {
                displayNotification(
                    'Username login requires a linked account email. Please switch to email login.',
                    '⚠️ '
                );
                return;
            }

            signinEmail = accountEmail;
        }
    }

    // Authenticate with Supabase Auth
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: signinEmail,
        password,
    });

    if (error) {
        displayNotification(`Login failed: ${error.message}`, '⚠️ ');
        console.error('Login error:', error);
        return;
    }

    if (window.parent) {
        window.parent.postMessage({ email: data.email, data });
    }

    displayNotification('Logged in successfully. Welcome back!', '✅ ');
    console.log('Login success:', data);
}

function setUpContinueWithUser(data) {
    console.log(data);

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('continue-with-alert');

    messageDiv.innerHTML = `
        <div>
            <i class="material-symbols-rounded">account_circle</i>
            <div>
                <h3>@${data.user.user_metadata.displayName}</h3>
                <p>${data.user.email}</p>
            </div>
        </div>
        <button>Continue <i class="material-symbols-rounded">arrow_forward</i> </button>
    `;

    document.querySelector('.container').insertBefore(
        messageDiv,
        document.getElementById('user-section')
    );

    document.body.querySelector('.continue-with-alert button').onclick = () => {
        window.parent.postMessage({ email: data.user.email, data });
        window.close();
        window.history.back();
    }

    messageDiv.insertAdjacentHTML('beforebegin', `<h2>Continue with this account?</h2>`);
}

// Auto-prefill from URL param `email` (e.g. ?email=you@example.com)
(function handleUrlPrefill() {
    try {
        const params = new URLSearchParams(window.location.search);
        const email = params.get('email');
        const username = params.get('username');
        if (email) {
            loginWithEmail.checked = true;
            loginLabel.textContent = 'Email';
            loginInput.type = 'email';
            usedEmail = true;
            loginInput.value = email;
        } else if (username) {
            loginWithEmail.checked = false;
            loginLabel.textContent = 'Username';
            loginInput.type = 'text';
            usedEmail = false;
            loginInput.value = username;
        }
    } catch (err) {
        console.error('URL prefill error:', err);
    }
})();