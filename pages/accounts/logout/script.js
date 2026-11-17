document.addEventListener('DOMContentLoaded', async () => {
    let didLogOut = await logOutUser();

    setTimeout(function () {
        document.querySelector('.container-content').innerHTML = `
        <div style="display: flex; justify-content: center;">
        <svg class="main-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="5rem" width="5rem" fill="#e3e3e3"><path d="M5,21q-0.83,0-1.41-0.59T3,19V5Q3,4.17 3.59,3.59T5,3h7V5H5V19h7v2H5Zm11-4l-1.38-1.45L17.18,13H9V11h8.18L14.63,8.45L16,7l5,5l-5,5Z"/></svg>
        </div>
        <h1>Logged Out</h1>
        <p>You will be redirected back to the page you came from.</p>
        `
        setTimeout(() => {
            history.back();
        }, 1000)
    }, 800)
})
