from model import FakeNewsModel
import os

def main():
    dataset_path = 'backend/dataset/fake_news.csv'
    if not os.path.exists(dataset_path):
        # Fallback for underscore/hyphen if needed, but we saw fake_news.csv
        dataset_path = 'backend/dataset/fake_news.csv'
        
    if not os.path.exists(dataset_path):
        print(f"Error: Dataset not found at {dataset_path}")
        return

    model_handler = FakeNewsModel()
    print("Starting training...")
    # This might take a few minutes for 100MB+ file
    accuracy = model_handler.train(dataset_path)
    print(f"Training completed. Accuracy: {accuracy}")

if __name__ == '__main__':
    main()
