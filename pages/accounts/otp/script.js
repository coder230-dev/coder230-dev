const params = new URLSearchParams(window.location.search);

const input = document.getElementById('otpPhoneorEmail');

let type;

function detectType(value) {
    const v = value.trim();
    if (!v) return 'text';
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'email';

    const digitsOnly = v.replace(/\D/g, '');
    if (digitsOnly.length >= 7 && /^[\d\s()+\-.]+$/.test(v)) return 'tel';

    return 'text';
}

input.addEventListener('keyup', (e) => {
    const nextType = detectType(input.value);

    type = nextType;

    if (input.type !== nextType) {
        input.type = nextType;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    if (params.get('error') && params.get('error_code')) {
        showError();
        return
    }
    if (params.get('email')) {
        showLoginConfirmScreen();
    }
})

document.getElementById('otp-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const value = document.getElementById('otpPhoneorEmail').value;
    if (value) {
        document.querySelector('.container').innerHTML = `
        <svg viewBox="25 25 50 50" class="spinner" id="main-spinner">
            <circle r="20" cy="50" cx="50"></circle>
        </svg>
        `;

        if (type === 'email') {
            const redirectUrl = `${window.location.origin}/accounts/otp/index.html?email=${encodeURIComponent(value)}`;

            ({ data, error } = await supabaseClient.auth.signInWithOtp({
                email: value,
                options: {
                    emailRedirectTo: redirectUrl
                }
            }));
        } else if (type === 'tel') {
            // phone - MUST be in E.164 format: +19165551234
            ({ data, error } = await supabaseClient.auth.signInWithOtp({
                phone: value,
            }));
        }

        document.querySelector('.container').innerHTML = `
        <div class="container-content check-device">
            <div style="display: flex; justify-content: center; align-items: center; gap: 6px; margin-top: 50px; background: var(--river-900); padding: 4px 8px; border-radius: 30px; color: var(--text-inverse); width: fit-content;">
                <img class="header-logo" style="max-height: 40px; background: none; " src="./../../images/bluebird_2027.png" alt="Bluebird Logo">
                <b>Bluebird</b>
            </div>
            <center><svg class="main-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="5rem" width="5rem" fill="var(--river-100)"><path d="M12,12Zm4.98-4.98q-0.89-0.89-0.89-2.17t0.89-2.17T19.14,1.8t2.17,0.89T22.2,4.86T21.31,7.02T19.14,7.92T16.98,7.02ZM8.02,21.4q-1.86-0.8-3.24-2.18T2.6,15.98T1.8,12T2.6,8.02T4.78,4.78T8.02,2.6T12,1.8q0.44,0 0.88,0.05t0.86,0.12q0.46,0.08 0.68,0.49T14.49,3.3q-0.16,0.45-0.57,0.67t-0.9,0.16Q12.76,4.1 12.51,4.08T12,4.07q-3.31,0-5.62,2.31T4.07,12t2.31,5.62T12,19.93t5.62-2.31T19.93,12q0-0.26-0.01-0.51t-0.06-0.51q-0.06-0.48 0.16-0.9T20.7,9.51q0.46-0.16 0.86,0.06t0.48,0.68q0.07,0.42 0.12,0.86T22.2,12q0,2.12-0.8,3.98t-2.18,3.24T15.98,21.4T12,22.2T8.02,21.4Zm2.56-7.85L8.59,11.58q-0.31-0.31-0.77-0.31T7.02,11.6q-0.31,0.31-0.31,0.78t0.31,0.78l2.74,2.75q0.34,0.34 0.8,0.34t0.8-0.34l5.23-5.23q0.39-0.39 0.34-0.82T16.57,9.13T15.83,8.78T15.01,9.13l-4.43,4.43Z"/></svg></center>
            <h1>Check your ${type === 'email' ? 'Email' : 'Phone'}</h1>
            <p>We've sent ${type === 'email' ? 'an email' : 'a text message'} to <b>${value}</b>. Since the sign in service is hosted on Supabase, you'll see ${type === 'email' ? `an email from "Supabase Auth"` : `text message`}. Click on the link and it will log you in.
            <p>You will no longer need this page, so feel free to close this page.</p>
        </div>
        `
    }
});

async function showLoginConfirmScreen() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    console.log(session);

    if (!session.user.email === params.get('email')) {
        showError();
    }

    document.querySelector('.container').innerHTML = `
        <div class="container-content logged-in">
            <div style="display: flex; justify-content: center; align-items: center; gap: 6px; margin-top: 50px; background: var(--river-900); padding: 4px 8px; border-radius: 30px; color: var(--text-inverse); width: fit-content;">
                <img class="header-logo" style="max-height: 40px; background: none; " src="./../../images/bluebird_2027.png" alt="Bluebird Logo">
                <b>Bluebird</b>
            </div>
            <center><svg class="main-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="5rem" width="5rem" fill="#0bf3ff"><path d="M12,12Zm4.98-4.98q-0.89-0.89-0.89-2.17t0.89-2.17T19.14,1.8t2.17,0.89T22.2,4.86T21.31,7.02T19.14,7.92T16.98,7.02ZM8.02,21.4q-1.86-0.8-3.24-2.18T2.6,15.98T1.8,12T2.6,8.02T4.78,4.78T8.02,2.6T12,1.8q0.44,0 0.88,0.05t0.86,0.12q0.46,0.08 0.68,0.49T14.49,3.3q-0.16,0.45-0.57,0.67t-0.9,0.16Q12.76,4.1 12.51,4.08T12,4.07q-3.31,0-5.62,2.31T4.07,12t2.31,5.62T12,19.93t5.62-2.31T19.93,12q0-0.26-0.01-0.51t-0.06-0.51q-0.06-0.48 0.16-0.9T20.7,9.51q0.46-0.16 0.86,0.06t0.48,0.68q0.07,0.42 0.12,0.86T22.2,12q0,2.12-0.8,3.98t-2.18,3.24T15.98,21.4T12,22.2T8.02,21.4Zm2.56-7.85L8.59,11.58q-0.31-0.31-0.77-0.31T7.02,11.6q-0.31,0.31-0.31,0.78t0.31,0.78l2.74,2.75q0.34,0.34 0.8,0.34t0.8-0.34l5.23-5.23q0.39-0.39 0.34-0.82T16.57,9.13T15.83,8.78T15.01,9.13l-4.43,4.43Z"/></svg></center>
            <h1>Hi ${session.user.user_metadata.full_name}!</h1>
            <h2>@${session.user.user_metadata.displayName}</h2>
            <h3>${session.user.user_metadata.email}</h3>
            <p>You have been successfully logged in using One Time Login. Welcome back to your account.</p>
			<div class="btn-cont">
                <a class="submit-btn" href="../dashboard/index.html">Go to Your Dashboard</a>
				<a class="alt-btn" href="../../../index.html">Go to Bluebird Home Page</a>
            </div>
            <p style="opacity: 0.7; margin-top: 30px">Access Token: ${session.access_token}</p>
            <p style="opacity: 0.7;">Expires: ${session.expires_at}</p>
        </div>
        `
}

function showError() {
    document.querySelector('.container').innerHTML = `
        <div class="container-content error-content">
            <div style="display: flex; justify-content: center; align-items: center; gap: 6px; margin-top: 50px; background: var(--river-900); padding: 4px 8px; border-radius: 30px; color: var(--text-inverse); width: fit-content;">
                <img class="header-logo" style="max-height: 40px; background: none; " src="./../../images/bluebird_2027.png" alt="Bluebird Logo">
                <b>Bluebird</b>
            </div>
            <center><svg class="main-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="5rem" width="5rem" fill="#d09d56"><path d="M12.84,16.87q0.34-0.34 0.34-0.84t-0.34-0.84T12,14.85t-0.84,0.34t-0.34,0.84t0.34,0.84T12,17.2t0.84-0.34Zm-0.03-4.18q0.33-0.33 0.33-0.81V8.01q0-0.48-0.33-0.81T12,6.87T11.19,7.2T10.86,8.01v3.86q0,0.48 0.33,0.81T12,13.01t0.81-0.33ZM12,22.2q-2.12,0-3.98-0.8T4.78,19.22T2.6,15.98T1.8,12T2.6,8.02T4.78,4.78T8.02,2.6T12,1.8t3.98,0.8t3.24,2.18T21.4,8.02T22.2,12t-0.8,3.98t-2.18,3.24T15.98,21.4T12,22.2Zm0-2.28q3.33,0 5.63-2.3T19.93,12t-2.3-5.63T12,4.07T6.37,6.37T4.07,12t2.3,5.63T12,19.93ZM12,12Z"/></svg></center>
            <h1>${params.get('error')}<br><br>An Error Occured While Logging You In.</h1>
            <p>We're sorry about that, but something went wrong while signing you in. Check if it is the correct link. If this problem still persists, contact us.</p>
            <p>${params.get('error_description')}
			<div class="btn-cont">
                <button class="submit-btn" onclick="window.close();">Close Page</button>
				<a class="alt-btn" href="../login/index.html">Login Manually</a>
            </div>
            <p style="opacity: 0.7; margin-top: 30px">Error Code: ${params.get('error_code')}</p>
            <p style="opacity: 0.7;"></p>
        </div>
    `
}
