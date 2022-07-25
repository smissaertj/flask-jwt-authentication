from flask import Flask, jsonify, make_response, request, render_template
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy
from functools import wraps
import os
import uuid
import jwt
import datetime

app = Flask(__name__)

app.config['SECRET_KEY'] = '71d41fd43a56655a771cffb38a5c9b5f'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite://///' + os.path.join(os.path.dirname(__file__), 'demo.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True

db = SQLAlchemy(app)


class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    public_id = db.Column(db.Integer)
    email = db.Column(db.String(50), unique=True)
    password = db.Column(db.String(50))
    admin = db.Column(db.Boolean)


def token_required(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']

        if not token:
            return make_response(jsonify({'error': 'Missing valid access token'}), 401)

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = Users.query.filter_by(public_id=data['public_id']).first()
        except:
            return make_response(jsonify({'error': 'Invalid access token'}), 401)

        return f(current_user, *args, **kwargs)
    return decorator


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html', title='Welcome')


@app.route('/register', methods=['POST'])
def signup_user():
    # TODO - Handle empty fields

    data = request.get_json()
    email = data['email']
    hashed_password = generate_password_hash(data['password'], method='sha256')

    if not Users.query.filter_by(email=email).first():
        new_user = Users(public_id=str(uuid.uuid4()), email=email, password=hashed_password, admin=False)
        db.session.add(new_user)
        db.session.commit()
        return make_response(jsonify({'success': 'Registration successful'}), 200)
    else:
        return make_response(jsonify({'error': 'Email address already exists.'}), 409)


@app.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()
    email = data['email']
    password = data['password']

    if not data or not email or not password:
        return make_response(jsonify({'error': 'Email and password required.'}), 401)

    user = Users.query.filter_by(email=email).first()

    if user:
        if check_password_hash(user.password, password):
            token = jwt.encode({'public_id': user.public_id, 'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=60)}, app.config['SECRET_KEY'], "HS256")
            return jsonify({'token': token})

    return make_response(jsonify({'error': 'Wrong email and/or password.'}), 401)


@app.route('/users', methods=['GET'])
@token_required
def get_all_users(current_user):
    users = Users.query.all()
    result = []
    for user in users:
        user_data = {'public_id': user.public_id, 'email': user.email, 'password': user.password, 'admin': user.admin}
        result.append(user_data)

    return make_response(jsonify({'users': result}), 200)


if __name__ == '__main__':
    app.run(debug=True)