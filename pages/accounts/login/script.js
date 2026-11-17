// website/accounts/login/script.js
// Login form handling using Supabase auth.

const params = new URLSearchParams(window.location.search);

let signinEmailPrefill = null;

let type

const loginLabel = document.getElementById('loginLabel');
const loginInput = document.getElementById('loginInput');

const loginPage = document.getElementById('user-section');
const passwordPage = document.getElementById('password-section');

window.addEventListener('load', async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    document.getElementById('main-spinner').remove();
    if (session) {
        setUpContinueWithUser(session);
    } else {
        document.getElementById('main-log-in-page').style.display = 'unset';

        loginInput.addEventListener('keyup', (e) => {
            const nextType = detectType(loginInput.value);
            if (loginInput.type !== nextType) {
                loginInput.type = nextType;
                type = nextType;
            }
        });
    }
});

function detectType(value) {
    const v = value.trim();
    if (!v) return 'text';
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'email';

    const digitsOnly = v.replace(/\D/g, '');
    if (digitsOnly.length >= 7 && /^[\d\s()+\-.]+$/.test(v)) return 'tel';

    return 'text';
}

const passwordInput = document.getElementById('passwordInput');
const submitBtn = document.getElementById('submit-btn');

document.getElementById('user-section').addEventListener('submit', async (event) => {
    event.preventDefault();
    await executeLogin();
});

async function executeLogin() {
    submitBtn.innerHTML = `<svg viewBox="25 25 50 50" class="spinner"><circle r="20" cy="50" cx="50"></circle></svg>  Log In`
    const loginValue = loginInput.value.trim();
    const password = passwordInput.value;

    if (!loginValue || !password) {
        displayNotification('Enter your login and password.');
        submitBtn.innerHTML = `Log In`
        return;
    }

    let signinEmail = signinEmailPrefill || null;

    // If we don't already have a resolved email, determine login type
    if (!signinEmail) {
        const isEmail = loginValue.includes('@');
        const isPhone = /^\+?[0-9]{10,15}$/.test(loginValue);

        if (isEmail || isPhone) {
            // Email login → use directly
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
                submitBtn.innerHTML = `Log In`
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

    submitBtn.innerHTML = `Log In`

    if (error) {
        displayNotification(`Login failed: ${error.message}`, '⚠️ ');
        console.error('Login error:', error);
        return;
    }

    if (window.parent) {
        window.parent.postMessage({ postedFrom: "bluebird-login_sQr7k5zjs1NxQ9Qad61SMKsN2", email: data.email, data });
    }

    logInAnimation(data);
    console.log('Login success:', data);
}

function setUpContinueWithUser(data) {
    console.log(data);

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('continue-with-alert', 'container-content');

    messageDiv.innerHTML = `
        <center>
            <div style="display: flex; justify-content: center; align-items: center; gap: 6px; margin-top: 50px; background: var(--river-900); padding: 4px 8px; border-radius: 30px; color: var(--text-inverse); width: fit-content;">
                <img class="header-logo" style="max-height: 40px; background: none; " src="./../../images/bluebird_2027.png" alt="Bluebird Logo">
                <b>Bluebird</b>
            </div>
            <h1>Continue with this account?</h1>
        </center>
        <div class="account-info-card">
            <div>
            <h1 id="user-pfp"><i translate="no" class="material-symbols-rounded">account_circle</i></h1>
                <h2>${data.user.user_metadata.full_name}</h2>
                <h3>@${data.user.user_metadata.displayName}</h3>
                <p>${data.user.email && data.user.phone ? `${data.user.email} | ${data.user.phone}` : (data.user.email || data.user.phone)}</p>
            </div>
        </div>
        <div class="cont-with-account-btns">
            <button class="submit-btn" type="submit">Continue</button>
            <a href="../logout/logout.html" style="text-align: center;" class="alt-btn cancel-btn">No, log out & use a different account</a>
        </div>
    `;

    document.querySelector('.container').appendChild(messageDiv);

    document.body.querySelector('.continue-with-alert button.submit-btn').onclick = () => {
        window.parent.postMessage({ postedFrom: "bluebird-login_sQr7k5zjs1NxQ9Qad61SMKsN2", email: data.email, data });
        window.close();
        window.history.back();
    }
}

function logInAnimation(data) {
    const div = document.createElement('div');

    div.innerHTML = `
    <div>
        <div class="ani-pfp">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="5rem" width="5rem" fill="#FFFFFF"><path d="M5.85,17.1q1.27-0.98 2.85-1.54T12,15t3.3,0.56t2.85,1.54q0.88-1.03 1.36-2.33T20,12q0-3.33-2.34-5.66T12,4Q8.68,4 6.34,6.34T4,12q0,1.47 0.49,2.78q0.49,1.3 1.36,2.33Zm3.66-5.11Q8.5,10.98 8.5,9.5q0-1.48 1.01-2.49T12,6t2.49,1.01T15.5,9.5t-1.01,2.49T12,13q-1.47,0-2.49-1.01ZM12,22q-2.07,0-3.9-0.79q-1.82-0.79-3.17-2.14Q3.58,17.73 2.79,15.9T2,12Q2,9.92 2.79,8.1Q3.58,6.27 4.93,4.93Q6.28,3.57 8.1,2.79Q9.93,2 12,2t3.9,0.79t3.17,2.14q1.35,1.35 2.14,3.17Q22,9.92 22,12t-0.79,3.9t-2.14,3.17q-1.35,1.35-3.17,2.14T12,22Zm2.5-2.39q1.18-0.39 2.15-1.11q-0.98-0.73-2.15-1.11T12,17T9.5,17.39Q8.33,17.77 7.35,18.5q0.98,0.73 2.15,1.11T12,20t2.5-0.39Zm-1.42-9.04Q13.5,10.15 13.5,9.5T13.08,8.42T12,8T10.93,8.42T10.5,9.5t0.43,1.07T12,11t1.08-0.43ZM12,9.5Zm0,9Z"/></svg></div>
        <div>
            <h1 class="ani-heading">Hi ${data?.user.user_metadata.full_name || 'Guest'}</h1>
            <p class="ani-tag">@${data?.user.user_metadata.displayName || "guestie"}</p>
        </div>
    </div>
    <img src="../../images/hi_waving.gif" alt="Waving">

    <svg viewBox="25 25 50 50" class="spinner" id="animator-loader">
				<circle r="20" cy="50" cx="50"></circle>
	</svg>
    `

    div.classList.add('login-animator');
    document.body.appendChild(div);
    setTimeout(() => {
        div.classList.add('open');
    }, 500)

    setTimeout(() => {
        div.classList.remove('open');
        redirectBack();
    }, 7000);
}

function redirectBack() {
    if (params.get('redirectUrl')) {
        const a = document.createElement('a');
        a.href = params.get('redirectUrl');
        document.body.appendChild(a);
        a.click();
    } else if (window.navigation && window.navigation.canGoBack()) {
        history.back();
    } else {
        window.close();
    }
}

// Auto-prefill from URL param `email` (e.g. ?email=you@example.com)
(function handleUrlPrefill() {
    try {
        const params = new URLSearchParams(window.location.search);
        const email = params.get('email');
        if (email) {
            loginWithEmail.checked = true;
            loginLabel.textContent = 'Email';
            loginInput.type = 'email';
            loginInput.value = email;
        }
    } catch (err) {
        console.error('URL prefill error:', err);
    }
})();