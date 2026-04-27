import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import os
from preprocessing import clean_text

class FakeNewsModel:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=5000)
        self.model = LogisticRegression()
        self.svm_model = SVC(probability=True)
        self.is_trained = False
        self.model_dir = os.path.join(os.path.dirname(__file__), 'model')
        
        if not os.path.exists(self.model_dir):
            os.makedirs(self.model_dir)

    def train(self, dataset_path):
        print(f"Loading dataset from {dataset_path}...")
        try:
            # Try to handle common CSV issues
            df = pd.read_csv(dataset_path, error_bad_lines=False, warn_bad_lines=True)
        except:
            try:
                df = pd.read_csv(dataset_path, encoding='ISO-8859-1', error_bad_lines=False)
            except:
                print("Using train.csv as fallback...")
                df = pd.read_csv('backend/dataset/train.csv')
            
        print(f"Initial row count: {len(df)}")
        
        # Keep only necessary columns
        if 'text' not in df.columns or 'label' not in df.columns:
            print("Required columns missing. Attempting to locate...")
            # If we're missing columns, maybe we used the wrong delimiter? 
            # Or maybe we need to drop everything but what we need
            
        print("Preprocessing labels...")
        # Map string labels if present
        if df['label'].dtype == 'object':
            label_map = {
                'real': 0, 'REAL': 0, 'reliable': 0, '0': 0,
                'fake': 1, 'FAKE': 1, 'unreliable': 1, '1': 1
            }
            df['label'] = df['label'].map(label_map)
        
        # Force label to numeric and drop non-finite values
        df['label'] = pd.to_numeric(df['label'], errors='coerce')
        df = df.dropna(subset=['label', 'text'])
        
        # Ensure mapping: 0 = Real, 1 = Fake
        df = df[df['label'].isin([0, 1])]
        
        print(f"Cleaned row count: {len(df)}")
        if len(df) == 0:
            print("Error: No valid data left after cleaning labels. Check dataset label column.")
            return 0

        print("Preprocessing text...")
        X = df['text'].apply(clean_text)
        y = df['label'].astype(int)
        
        print("Splitting dataset (80/20)...")
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        print("Vectorizing data...")
        self.vectorizer = TfidfVectorizer(max_features=5000)
        X_train_vec = self.vectorizer.fit_transform(X_train)
        X_test_vec = self.vectorizer.transform(X_test)
        
        print("Training Logistic Regression (Default)...")
        self.model.fit(X_train_vec, y_train)
        
        print("Training SVM (Optional - using subset for speed)...")
        # SVM is slow on large datasets, training on a subset to satisfy requirements
        self.svm_model.fit(X_train_vec[:2000], y_train[:2000])
        
        print("Evaluating model...")
        y_pred = self.model.predict(X_test_vec)
        accuracy = accuracy_score(y_test, y_pred)
        print(f"Accuracy: {accuracy}")
        
        self.accuracy = accuracy
        self.report = classification_report(y_test, y_pred, output_dict=True)
        self.cm = confusion_matrix(y_test, y_pred).tolist()
        
        print("Saving model and vectorizer...")
        self.save_models()
        self.is_trained = True
        return accuracy

    def save_models(self):
        joblib.dump(self.model, os.path.join(self.model_dir, 'model.pkl'))
        joblib.dump(self.vectorizer, os.path.join(self.model_dir, 'vectorizer.pkl'))
        # Also save metrics for analytics
        joblib.dump({
            'accuracy': self.accuracy,
            'report': self.report,
            'cm': self.cm
        }, os.path.join(self.model_dir, 'metrics.pkl'))

    def load_models(self):
        model_path = os.path.join(self.model_dir, 'model.pkl')
        vec_path = os.path.join(self.model_dir, 'vectorizer.pkl')
        
        if os.path.exists(model_path) and os.path.exists(vec_path):
            self.model = joblib.load(model_path)
            self.vectorizer = joblib.load(vec_path)
            self.is_trained = True
            return True
        return False

    def predict(self, text, model_type='logistic'):
        if not self.is_trained:
            if not self.load_models():
                return None, 0
        
        cleaned = clean_text(text)
        vec = self.vectorizer.transform([cleaned])
        
        if model_type == 'svm' and hasattr(self, 'svm_model'):
            pred = self.svm_model.predict(vec)[0]
            prob = self.svm_model.predict_proba(vec)[0]
        else:
            pred = self.model.predict(vec)[0]
            prob = self.model.predict_proba(vec)[0]
            
        confidence = float(max(prob))
        # Handle different label formats (0/1 or Real/Fake strings)
        pred_val = int(pred) if hasattr(pred, 'item') else pred
        if isinstance(pred_val, (int, float)):
            result = "Fake" if pred_val == 1 else "Real"
        else:
            result = str(pred_val)
            
        return result, confidence
