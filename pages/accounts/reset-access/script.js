document.getElementById('reset-password-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const redirectUrl = `${window.location.origin}/accounts/otp/index.html?email=${encodeURIComponent(value)}`;

    const email = document.getElementById('resetEmailorPhone').value;
    if (email) {
        document.querySelector('.container').innerHTML = `
        <svg viewBox="25 25 50 50" class="spinner" id="main-spinner">
            <circle r="20" cy="50" cx="50"></circle>
        </svg>
        `;

        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectUrl,
        })

        setUpResetPasswordScreen();
    }
});

// After inserting email/phone
function setUpResetPasswordScreen() {

}