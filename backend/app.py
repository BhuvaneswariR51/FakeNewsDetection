from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime, timedelta
import os
import bcrypt
import jwt
import joblib
import re
import string
import requests
from bs4 import BeautifulSoup
from PIL import Image
try:
    import pytesseract
    # Common Windows path
    tess_path = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    if os.path.exists(tess_path):
        pytesseract.pytesseract.tesseract_cmd = tess_path
except ImportError:
    pytesseract = None
import speech_recognition as sr
try:
    from moviepy.editor import VideoFileClip
except ImportError:
    VideoFileClip = None
try:
    from pydub import AudioSegment
except ImportError:
    AudioSegment = None
try:
    from langdetect import detect
except ImportError:
    detect = None
try:
    from googletrans import Translator
except ImportError:
    Translator = None

app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = 'fakenews_auth_secret_key_123'
UPLOAD_FOLDER = 'backend/temp'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Initialize database
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'database', 'history.db')

def init_db():
    if not os.path.exists('backend/database'):
        os.makedirs('backend/database')
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS news_history
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  news_text TEXT,
                  result TEXT,
                  created_at TEXT,
                  language TEXT DEFAULT 'English',
                  input_type TEXT DEFAULT 'Text')''')
                  
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  full_name TEXT,
                  email TEXT UNIQUE,
                  password TEXT)''')
                  
    c.execute("SELECT COUNT(*) FROM users")
    if c.fetchone()[0] == 0:
        default_password = 'admin123'
        hashed_pw = bcrypt.hashpw(default_password.encode('utf-8'), bcrypt.gensalt())
        c.execute("INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)", 
                 ('Admin User', 'admin@example.com', hashed_pw.decode('utf-8')))
                 
    conn.commit()
    conn.close()

init_db()

# Preprocessing matching trained logic
def clean_text(text):
    if not text: return ""
    text = text.lower()
    text = re.sub(r'\[.*?\]', '', text)
    text = re.sub(r'[%s]' % re.escape(string.punctuation), '', text)
    text = re.sub(r'\w*\d\w*', '', text)
    return text

# Load models
from model import FakeNewsModel
MODEL_DIR = os.path.join(BASE_DIR, 'model')

model_handler = FakeNewsModel()
is_trained = model_handler.load_models()
metrics = None

if is_trained:
    try:
        metrics_path = os.path.join(MODEL_DIR, 'metrics.pkl')
        if os.path.exists(metrics_path):
            metrics = joblib.load(metrics_path)
    except:
        pass
else:
    print("Warning: Model files not found. Please run training.")

# Helper: Detect and Translate
def process_language(text, target_lang='en'):
    if not text: return text, 'English'
    detected_lang = 'English'
    try:
        lang_code = detect(text) if detect else 'en'
        lang_map = {'en': 'English', 'hi': 'Hindi', 'ta': 'Tamil'}
        detected_lang = lang_map.get(lang_code, 'English')
        
        if lang_code in ['hi', 'ta'] and Translator:
            translator = Translator()
            # Wrap in try as googletrans can fail
            translation = translator.translate(text, dest='en')
            return translation.text, detected_lang
    except:
        pass
    return text, detected_lang

def check_fact_google(query):
    """Checks Google Fact Check Tools API for existing fact checks"""
    # REPLACE THIS WITH YOUR GOOGLE API KEY
    GOOGLE_API_KEY = "AIzaSyBRqWcKIMQIaO_pOmkkLD09jaPDEANBTUE"
    
    if GOOGLE_API_KEY == "YOUR_GOOGLE_API_KEY_HERE" or not GOOGLE_API_KEY:
        return None, 0
        
    try:
        url = f"https://factchecktools.googleapis.com/v1alpha1/claims:search?query={query}&key={GOOGLE_API_KEY}"
        res = requests.get(url, timeout=5)
        data = res.json()
        
        if 'claims' in data and len(data['claims']) > 0:
            # Get the top claim
            claim = data['claims'][0]
            rating = claim['claimReview'][0]['textualRating'].lower()
            
            # Map rating to Real/Fake
            fake_keywords = ['false', 'fake', 'incorrect', 'misleading', 'pants on fire', 'untrue']
            real_keywords = ['true', 'correct', 'accurate', 'authentic']
            
            if any(word in rating for word in fake_keywords):
                return "Fake", 0.95
            elif any(word in rating for word in real_keywords):
                return "Real", 0.95
    except Exception as e:
        print(f"Google Fact Check Error: {e}")
        
    return None, 0

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    full_name, email, password = data.get('full_name'), data.get('email'), data.get('password')
    if not all([full_name, email, password]) or len(password) < 6:
        return jsonify({"status": "error", "message": "Invalid input"}), 400
    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    conn = sqlite3.connect(DB_PATH); c = conn.cursor()
    try:
        c.execute("INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)", (full_name, email, hashed_pw.decode('utf-8')))
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close(); return jsonify({"status": "error", "message": "Email exists"}), 409
    conn.close(); return jsonify({"status": "success", "message": "Success"})

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email, password = data.get('email'), data.get('password')
    conn = sqlite3.connect(DB_PATH); c = conn.cursor()
    c.execute("SELECT password FROM users WHERE email = ?", (email,))
    user = c.fetchone(); conn.close()
    if user and bcrypt.checkpw(password.encode('utf-8'), user[0].encode('utf-8')):
        token = jwt.encode({'email': email, 'exp': datetime.utcnow() + timedelta(hours=24)}, app.config['SECRET_KEY'], algorithm="HS256")
        return jsonify({"status": "success", "token": token})
    return jsonify({"status": "error", "message": "Invalid credentials"}), 401

@app.route('/predict', methods=['POST'])
def predict():
    # model_handler handles auto-loading if files exist
    data = request.json
    text = data.get('text', '')
    if not text: return jsonify({'error': 'No text provided'}), 400
    
    # Internal Lang Processing
    translated_text, detected_lang = process_language(text)
    
    # Try Google Fact Check First (Procedure 2)
    result, confidence = check_fact_google(translated_text)
    
    # Fallback to local AI Model if Google has no record
    if result is None:
        result, confidence = model_handler.predict(translated_text)
        
    if result is None:
        return jsonify({'error': 'Problem loading weights. Try training again.'}), 503
    
    conn = sqlite3.connect(DB_PATH); c = conn.cursor()
    c.execute("INSERT INTO news_history (news_text, result, created_at, language, input_type) VALUES (?, ?, ?, ?, ?)",
              (text[:500], result, datetime.now().strftime("%Y-%m-%d %H:%M:%S"), detected_lang, data.get('type', 'Text')))
    conn.commit(); conn.close()
    
    return jsonify({
        'prediction': result,
        'confidence': round(confidence, 4),
        'language': detected_lang
    })

@app.route('/analyze', methods=['POST'])
def analyze():
    mode = request.form.get('mode', 'text')
    extracted_text = ""
    error_msg = ""
    
    try:
        if mode == 'text':
            extracted_text = request.form.get('text', '')
        elif mode == 'url':
            url = request.form.get('url', '')
            res = requests.get(url, timeout=10)
            soup = BeautifulSoup(res.text, 'html.parser')
            # Extract main text
            for script in soup(["script", "style"]): script.decompose()
            extracted_text = soup.get_text()[:3000].strip()
        elif mode == 'image' and 'file' in request.files:
            file = request.files['file']
            img = Image.open(file)
            if pytesseract:
                try:
                    extracted_text = pytesseract.image_to_string(img)
                except:
                    error_msg = "Tesseract binary missing. Install Tesseract-OCR."
            else:
                error_msg = "pytesseract library missing."
        elif mode in ['audio', 'video', 'voice'] and 'file' in request.files:
            file = request.files['file']
            filename = f"temp_{int(datetime.now().timestamp())}_{file.filename}"
            temp_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(temp_path)
            
            audio_path = temp_path
            try:
                if mode == 'video' and VideoFileClip:
                    clip = VideoFileClip(temp_path)
                    audio_path = temp_path + ".wav"
                    clip.audio.write_audiofile(audio_path, logger=None)
                elif mode in ['audio', 'voice'] and AudioSegment:
                    # Attempt conversion to wav if not already
                    if not temp_path.lower().endswith('.wav'):
                        sound = AudioSegment.from_file(temp_path)
                        audio_path = temp_path + ".wav"
                        sound.export(audio_path, format="wav")

                recognizer = sr.Recognizer()
                with sr.AudioFile(audio_path) as source:
                    audio_data = recognizer.record(source)
                    extracted_text = recognizer.recognize_google(audio_data)
            except Exception as e:
                error_msg = f"Speech conversion failed: {str(e)}"
            finally:
                # Cleanup
                if audio_path != temp_path and os.path.exists(audio_path): os.remove(audio_path)
                if os.path.exists(temp_path): os.remove(temp_path)
            
    except Exception as e:
        error_msg = f"Processing Error: {str(e)}"

    if error_msg: return jsonify({'error': error_msg}), 400
    if not extracted_text: return jsonify({'error': 'Empty extraction'}), 400

    # Prediction logic
    translated_text, detected_lang = process_language(extracted_text)
    
    # Try Google Fact Check First (Procedure 2)
    result, confidence = check_fact_google(translated_text)
    
    # Fallback to local AI Model if Google has no record
    if result is None:
        result, confidence = model_handler.predict(translated_text)
        
    if result is None:
        return jsonify({'error': 'Prediction failure. Check if models are trained.'}), 503
    
    conn = sqlite3.connect(DB_PATH); c = conn.cursor()
    c.execute("INSERT INTO news_history (news_text, result, created_at, language, input_type) VALUES (?, ?, ?, ?, ?)",
              (extracted_text[:500], result, datetime.now().strftime("%Y-%m-%d %H:%M:%S"), detected_lang, mode.capitalize()))
    conn.commit(); conn.close()
    
    return jsonify({
        'prediction': result,
        'confidence': round(confidence, 4),
        'language': detected_lang,
        'extracted_text': extracted_text[:1000]
    })

@app.route('/update-password', methods=['POST'])
def update_password():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"status": "error", "message": "Missing token"}), 401
    token = auth_header.split(' ')[1]
    
    try:
        decoded = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        email = decoded.get('email')
    except Exception as e:
        return jsonify({"status": "error", "message": "Invalid token"}), 401

    data = request.json
    current_pw = data.get('current_password')
    new_pw = data.get('new_password')
    
    if not current_pw or not new_pw or len(new_pw) < 6:
        return jsonify({"status": "error", "message": "Invalid password criteria (minimum 6 chars)"}), 400

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT password FROM users WHERE email = ?", (email,))
    user = c.fetchone()
    
    if user and bcrypt.checkpw(current_pw.encode('utf-8'), user[0].encode('utf-8')):
        hashed_new_pw = bcrypt.hashpw(new_pw.encode('utf-8'), bcrypt.gensalt())
        c.execute("UPDATE users SET password = ? WHERE email = ?", (hashed_new_pw.decode('utf-8'), email))
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "message": "Password updated"})
    
    conn.close()
    return jsonify({"status": "error", "message": "Incorrect current password"}), 401

@app.route('/history', methods=['GET'])
def get_history():
    conn = sqlite3.connect(DB_PATH); c = conn.cursor()
    c.execute("SELECT created_at, news_text, result, language, input_type FROM news_history ORDER BY id DESC")
    rows = c.fetchall(); conn.close()
    return jsonify([{'date': r[0], 'title': r[1][:50], 'result': r[2], 'language': r[3], 'type': r[4]} for r in rows])

@app.route('/analytics', methods=['GET'])
def get_analytics():
    if not metrics: return jsonify({'error': 'No metrics'}), 400
    return jsonify({'accuracy': metrics['accuracy'], 'confusion_matrix': metrics['cm'], 'report': metrics['report']})

@app.route('/stats', methods=['GET'])
def get_stats():
    conn = sqlite3.connect(DB_PATH); c = conn.cursor()
    c.execute("SELECT COUNT(*), SUM(CASE WHEN result='Real' THEN 1 ELSE 0 END), SUM(CASE WHEN result='Fake' THEN 1 ELSE 0 END) FROM news_history")
    stats = c.fetchone(); conn.close()
    return jsonify({'total': stats[0] or 0, 'real': stats[1] or 0, 'fake': stats[2] or 0, 'accuracy': metrics['accuracy'] if metrics else 0})

@app.route('/trending-news', methods=['GET'])
def get_trending_news():
    api_key = "96ae3aaa81564e4aa868d7e947fa2c62"
    url = f"https://newsapi.org/v2/top-headlines?country=us&apiKey={api_key}"
    try:
        res = requests.get(url, timeout=5)
        return jsonify(res.json())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
    # trigger reload again
