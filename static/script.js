const api_url = 'http://localhost:5000/'

const show_alert = (message, status) => {
    let alert = document.getElementById('alert');
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
    })
        .then((response) => response.json())
        .then((data) => {
            if (data['error']) {
                show_alert(data['error'], 'error')
            } else {
                show_alert(data['success'], 'success')
            }
        })
        .catch((error) => {
            console.log('Error:', error);
        });
}


const login = async (email, password) => {
    const resp = await fetch(api_url + 'login', {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email: email, password: password})
    })
        .then((response) => response.json())
        .then((data) => {
            if (!data['token']) {
                show_alert(data['error'], 'error')
            } else {
                getUserData(data['token'])
            }
        })
        .catch((error) => {
            console.log('Error:', error);
        });
}


const getUserData = async (token) => {
    const resp = await fetch(api_url + 'users', {
        method: "GET",
        headers: {"Content-Type": "application/json", "x-access-token": token}
    })
        .then((response) => response.json())
        .then((data) => console.log(data));
}


btnRegister = document.getElementById('register')
btnRegister.addEventListener('click', (e) =>{
    e.preventDefault()
    let email = document.getElementById('email').value
    let password = document.getElementById('password').value
    register(email, password)
})

btnLogin = document.getElementById('login')
btnLogin.addEventListener('click', (e) => {
    e.preventDefault()
    let email = document.getElementById('email').value
    let password = document.getElementById('password').value
    login(email, password)
})