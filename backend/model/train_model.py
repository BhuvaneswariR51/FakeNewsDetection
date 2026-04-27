import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import re
import string
import os

def clean_text(text):
    text = text.lower()
    text = re.sub(r'\[.*?\]', '', text)
    text = re.sub(r'[%s]' % re.escape(string.punctuation), '', text)
    text = re.sub(r'\w*\d\w*', '', text)
    return text

def train():
    print("Loading dataset...")
    df = pd.read_csv('../dataset/fake_news.csv')
    df = df[['text', 'label']].dropna()
    df['content'] = df['text'].astype(str)
    
    # 0 = Real, 1 = Fake (Assume numeric casting if necessary)
    df['label'] = pd.to_numeric(df['label'], errors='coerce')
    df = df.dropna(subset=['label'])
    
    print("Cleaning text...")
    df['content'] = df['content'].apply(clean_text)
    
    X = df['content']
    y = df['label'] # 1 is Fake, 0 is Real
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Vectorizing...")
    vectorizer = TfidfVectorizer(max_features=5000, stop_words='english')
    X_train_vec = vectorizer.fit_transform(X_train)
    
    print("Training model...")
    model = LogisticRegression()
    model.fit(X_train_vec, y_train)
    
    from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
    y_pred = model.predict(vectorizer.transform(X_test))
    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, output_dict=True)
    cm = confusion_matrix(y_test, y_pred).tolist()

    print(f"Accuracy: {accuracy}")
    
    print("Saving models...")
    joblib.dump(model, 'fake_news_model.pkl')
    joblib.dump(vectorizer, 'vectorizer.pkl')
    joblib.dump({'accuracy': accuracy, 'report': report, 'cm': cm}, 'metrics.pkl')
    print("Training complete!")

if __name__ == '__main__':
    train()
