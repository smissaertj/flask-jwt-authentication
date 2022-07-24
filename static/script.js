const api_url = 'http://localhost:5000/'

const show_alert = (message, status) => {
    let alert = document.getElementById('alert');
    console.log(alert)
    alert.style.display = 'block';
    alert.textContent = message;

    if (status === 'error') {
        alert.className = 'alert alert-danger';
    } else {
        alert.className = 'alert alert-success';
    }
}

const register = async (email, password) => {
    const resp = await fetch(api_url + 'register',{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email: email, password: password})
    });

    const data = await resp.json();

    let message = data['message'];
    let status = '';
    if (resp.status !== 200) {
        status = 'error';
    } else if (resp.status === 200) {
        status = 'success';
    }
    show_alert(message, status);
}


const login = async (email, password) => {
    const resp = await fetch(api_url + 'login', {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email: email, password: password})
    });

    const data = await resp.json();

    if (resp.status !== 200) {
        let message = data['message'];
        let status = 'error';
        show_alert(message, status);
    } else if (resp.status === 200) {
        let token = data['token']
        console.log(token)
        // Store the token in localSession
    }
}


btnRegister = document.getElementById('register')
btnRegister.addEventListener('click', (e) =>{
    e.preventDefault()
    email = document.getElementById('email').value
    password = document.getElementById('password').value
    register(email, password)
})

btnLogin = document.getElementById('login')
btnLogin.addEventListener('click', (e) => {
    e.preventDefault()
    email = document.getElementById('email').value
    password = document.getElementById('password').value
    login(email, password)
})